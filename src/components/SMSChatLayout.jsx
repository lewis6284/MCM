import React, { useState, useRef, useEffect } from "react";
import { X, Search, MoreVertical, SendHorizontal, Paperclip, Smile, CheckCheck } from "lucide-react";
import { useChat } from "../context/ChatContext";

const SMSChatLayout = () => {
    const { isChatOpen, toggleChat, activeChat, selectChat, contacts, messages, sendMessage, loading } = useChat();
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!isChatOpen) return null;

    const handleSend = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue("");
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6 lg:p-10 transition-all duration-300">
            <div className="bg-[#f0f2f5] w-full h-full max-w-[1600px] flex shadow-2xl rounded-none md:rounded-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200">

                {/* Left Sidebar - Contact List */}
                <div className="w-[30%] min-w-[300px] bg-white border-r border-[#e9edef] flex flex-col">
                    {/* Sidebar Header */}
                    <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200 shadow-sm">
                            A
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                            <button className="hover:bg-gray-200 p-2 rounded-full transition-colors"><MoreVertical size={20} /></button>
                            <button onClick={toggleChat} className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="p-2 bg-white border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search or start new chat"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#f0f2f5] pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-green-400"
                            />
                        </div>
                    </div>

                    {/* Contacts list */}
                    <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                        {loading && contacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-sm">Loading contacts...</p>
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No contacts found</div>
                        ) : (
                            filteredContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    onClick={() => selectChat(contact)}
                                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-b border-gray-50 ${activeChat?.id === contact.id ? "bg-yellow-400" : "hover:bg-gray-50"}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shrink-0">
                                        {(contact.name || contact.email || "?").charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h4 className="font-bold text-gray-800 text-[15px] truncate">{contact.name || contact.email}</h4>
                                            <span className={`text-[10px] font-bold ${activeChat?.id === contact.id ? "text-red-600" : "text-green-500"}`}>
                                                {contact.time ? (contact.time.includes(',') ? contact.time.split(',')[1] : contact.time) : ""}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${contact.type === 'HOSPITAL' ? 'text-blue-500' : 'text-purple-500'}`}>
                                                    {contact.type} • {contact.email}
                                                </span>
                                                <p className="text-sm text-gray-500 truncate max-w-[180px]">{contact.lastMessage}</p>
                                            </div>
                                            {contact.unread > 0 && (
                                                <span className="bg-green-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 ring-2 ring-white">
                                                    {contact.unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel - Chat Window */}
                <div className="flex-1 flex flex-col relative bg-[#efeae2]">
                    {/* Chat Background Image Overlay (Subtle Pattern) */}
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://w0.peakpx.com/wallpaper/580/678/HD-wallpaper-whatsapp-background-whatsapp-texture.jpg')] bg-repeat"></div>

                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-gray-200 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                                        {activeChat.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 leading-none">{activeChat.name}</h3>
                                        <p className="text-[11px] font-bold text-green-600 mt-1 uppercase tracking-widest">
                                            {activeChat.type} • {activeChat.email}
                                            {activeChat.max_daily_candidates && ` • Max Daily: ${activeChat.max_daily_candidates}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-gray-500">
                                    <button className="hover:bg-gray-200 p-2 rounded-full transition-colors"><Search size={20} /></button>
                                    <button className="hover:bg-gray-200 p-2 rounded-full transition-colors"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-2 z-10 custom-scrollbar">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] flex flex-col ${msg.sender === "me" ? "self-end" : "self-start"}`}
                                    >
                                        <div className={`p-2.5 rounded-lg shadow-sm text-sm relative ${msg.sender === "me"
                                            ? "bg-[#d9fdd3] rounded-tr-none text-gray-800"
                                            : "bg-white rounded-tl-none text-gray-800 border border-gray-100"
                                            }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed pb-3">{msg.text}</p>
                                            <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                                <span className="text-[9px] text-green-600 font-bold">{msg.time}</span>
                                                {msg.sender === "me" && <CheckCheck size={12} className="text-[#53bdeb]" />}
                                            </div>

                                            {/* Message Bubble Tail Component (Simplified CSS) */}
                                            <div className={`absolute top-0 w-2 h-3 overflow-hidden ${msg.sender === "me" ? "left-full -translate-x-[2px]" : "right-full translate-x-[2px]"}`}>
                                                <div className={`w-3 h-3 rotate-45 transform origin-top-left ${msg.sender === "me" ? "bg-[#d9fdd3]" : "bg-white border-l border-t border-gray-100"}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="h-[62px] bg-[#f0f2f5] px-4 flex items-center gap-3 z-10 border-t border-gray-200">
                                <div className="flex gap-4 text-gray-500">
                                    <button className="hover:bg-gray-200 p-1.5 rounded-full transition-colors"><Smile size={24} /></button>
                                    <button className="hover:bg-gray-200 p-1.5 rounded-full transition-colors"><Paperclip size={24} /></button>
                                </div>
                                <form onSubmit={handleSend} className="flex-1">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Type a message"
                                        className="w-full bg-white px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-green-400 placeholder:text-gray-500"
                                    />
                                </form>
                                <button
                                    onClick={handleSend}
                                    className={`p-2 rounded-full transition-all ${inputValue.trim() ? "text-green-600 hover:bg-white" : "text-gray-400"}`}
                                >
                                    <SendHorizontal size={24} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[#f8f9fa] z-10">
                            <div className="w-64 h-64 bg-[#e9edef] rounded-full flex items-center justify-center mb-8 shadow-inner overflow-hidden border-4 border-white">
                                <img src="https://abs.twimg.com/emoji/v2/72x72/1f4ac.png" alt="Select chat" className="w-32 h-32 opacity-50 grayscale" />
                            </div>
                            <h2 className="text-3xl font-light text-[#41525d] mb-4">MCM Business Messenger</h2>
                            <p className="max-w-md text-sm text-[#667781] leading-relaxed">
                                Send and receive SMS updates to your candidates instantly.
                                Keep everyone informed about their appointment status and medical results.
                            </p>
                            <div className="mt-12 flex items-center gap-2 text-[#8696a0] text-xs">
                                <CheckCheck size={14} /> End-to-end encrypted for your security
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom scrollbar style */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ced0d1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #aeb1b2;
                }
            `}} />
        </div>
    );
};

export default SMSChatLayout;
