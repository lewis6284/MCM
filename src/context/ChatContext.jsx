import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [messagesState, setMessagesState] = useState({});
    const [loading, setLoading] = useState(false);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const fetchChatData = useCallback(async () => {
        if (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "PI")) return;

        setLoading(true);
        try {
            // 1. Fetch Agencies and Hospitals to build contact list
            const [agenciesRes, hospitalsRes, messagesRes] = await Promise.all([
                api.get("/agencies").catch(() => ({ data: [] })),
                api.get("/hospitals").catch(() => ({ data: [] })),
                api.get("/messages")
            ]);

            const allContacts = [
                ...agenciesRes.data.map(a => ({ ...a, type: "AGENCY", id: `agency_${a.id}`, originalId: a.id, userId: a.owner_id })),
                ...hospitalsRes.data.map(h => ({ ...h, type: "HOSPITAL", id: `hospital_${h.id}`, originalId: h.id, userId: h.owner_id }))
            ];

            // 2. Group messages by contact (Simplified: Agencies/Hospitals to Admin/PI)
            const groupedMessages = {};
            const contactUserIds = new Set(allContacts.map(c => c.userId));

            messagesRes.data.forEach(msg => {
                // In this simplified version, we only show messages SENT by contact users
                if (contactUserIds.has(msg.sender_id)) {
                    const threadContactId = msg.sender_id;
                    if (!groupedMessages[threadContactId]) groupedMessages[threadContactId] = [];
                    groupedMessages[threadContactId].push({
                        id: msg.id,
                        text: msg.message,
                        sender: "other",
                        time: new Date(msg.created_at).toLocaleString(),
                        created_at: msg.created_at
                    });
                }
            });

            // Note: Since we removed receiver_id at user's request, Admin replies
            // won't appear in specific threads as there is no link in DB.

            // Sort each thread by time
            Object.keys(groupedMessages).forEach(id => {
                groupedMessages[id].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });

            // 3. Update contacts with last message info
            const contactsWithLastMsg = allContacts.map(contact => {
                const contactMsgs = groupedMessages[contact.userId] || [];
                const lastMsg = contactMsgs[contactMsgs.length - 1];
                return {
                    ...contact,
                    lastMessage: lastMsg ? lastMsg.text : "No messages yet",
                    time: lastMsg ? lastMsg.time : "",
                    timestamp: lastMsg ? new Date(lastMsg.created_at).getTime() : 0,
                    unread: 0
                };
            });

            // 4. Sort contacts: Most recent message first
            contactsWithLastMsg.sort((a, b) => b.timestamp - a.timestamp);

            setContacts(contactsWithLastMsg);
            setMessagesState(groupedMessages);
        } catch (error) {
            console.error("Error fetching chat data:", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.role, user?.id]);

    useEffect(() => {
        if (isChatOpen) {
            fetchChatData();
        }
    }, [isChatOpen, fetchChatData]);

    const selectChat = (contact) => {
        setActiveChat(contact);
    };

    const sendMessage = async (text) => {
        if (!text.trim() || !activeChat) return;

        try {
            const res = await api.post("/messages", {
                subject: "Direct Message",
                message: text
            });

            // Refresh to get full thread correctly
            fetchChatData();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <ChatContext.Provider value={{
            isChatOpen,
            toggleChat,
            activeChat,
            selectChat,
            contacts,
            messages: activeChat ? (messagesState[activeChat.userId] || []) : [],
            sendMessage,
            loading,
            refresh: fetchChatData
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
