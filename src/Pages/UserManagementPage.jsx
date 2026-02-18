import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import FieldCard from "../components/FieldCard";
import api from "../api";

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState("");

    const fetchUsers = async (role = "") => {
        setLoading(true);
        try {
            const endpoint = role ? `/auth/users?role=${role}` : "/auth/users";
            const response = await api.get(endpoint);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(filterRole);
    }, [filterRole]);

    const handleRoleChange = (e) => {
        setFilterRole(e.target.value);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-green-600 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">User Management</h2>
                        <p className="text-gray-600">List and filter all system users.</p>
                    </div>
                    <div className="w-64">
                        <FieldCard
                            label="Filter by Role"
                            name="filterRole"
                            type="select"
                            value={filterRole}
                            onChange={handleRoleChange}
                            options={[
                                { label: "All Roles", value: "" },
                                { label: "Admin", value: "ADMIN" },
                                { label: "Agency", value: "AGENCY" },
                                { label: "Hospital", value: "HOSPITAL" },
                                { label: "PI", value: "PI" }
                            ]}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                <th className="px-8 py-5 text-sm font-semibold text-gray-600 uppercase tracking-wider">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400">Loading users...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-5 font-medium text-gray-900">{user.username}</td>
                                        <td className="px-8 py-5 text-gray-600">{user.email}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'HOSPITAL' ? 'bg-blue-100 text-blue-700' :
                                                    user.role === 'PI' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-gray-500 text-sm">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserManagementPage;
