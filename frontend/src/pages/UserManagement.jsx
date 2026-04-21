import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, updateUserRole, deleteUser, deactivateUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await updateUserRole(id, newRole);
            toast.success('Role updated successfully!');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm('Deactivate this user?')) return;
        try {
            await deactivateUser(id);
            toast.success('User deactivated!');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to deactivate user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteUser(id);
            toast.success('User deleted!');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-700';
            case 'TECHNICIAN': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-green-100 text-green-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">Smart Campus</h1>
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                        🏠 Dashboard
                    </Link>
                    <Link to="/notifications" className="text-gray-600 hover:text-blue-600 font-medium">
                        🔔 Notifications
                    </Link>
                    <button
                        onClick={() => { logout(); }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">👥 User Management</h2>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {users.length} Users
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {user.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* Role Selector */}
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                    <option value="TECHNICIAN">TECHNICIAN</option>
                                                </select>

                                                {/* Deactivate Button */}
                                                {user.active && (
                                                    <button
                                                        onClick={() => handleDeactivate(user.id)}
                                                        className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-2 py-1 rounded-lg transition"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded-lg transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No users found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;