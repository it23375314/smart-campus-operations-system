import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data);
        } catch (err) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (err) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success('All notifications marked as read!');
        } catch (err) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('Notification deleted!');
        } catch (err) {
            toast.error('Failed to delete notification');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'BOOKING': return 'bg-blue-100 text-blue-700';
            case 'TICKET': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'BOOKING': return '📅';
            case 'TICKET': return '🎫';
            default: return '🔔';
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">Smart Campus</h1>
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                        🏠 Dashboard
                    </Link>
                    <button
                        onClick={() => { logout(); }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">🔔 Notifications</h2>
                        {unreadCount > 0 && (
                            <p className="text-sm text-blue-600 mt-1">
                                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow p-12 text-center">
                        <div className="text-5xl mb-4">🔕</div>
                        <h3 className="text-lg font-semibold text-gray-700">No notifications yet</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            You'll see booking and ticket updates here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-2xl shadow p-5 transition ${!notification.read ? 'border-l-4 border-blue-500' : 'opacity-75'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3 flex-1">
                                        <span className="text-2xl">
                                            {getTypeIcon(notification.type)}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-800">
                                                    {notification.title}
                                                </h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(notification.type)}`}>
                                                    {notification.type}
                                                </span>
                                                {!notification.read && (
                                                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                {notification.message}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-2">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 ml-4">
                                        {!notification.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg transition"
                                            >
                                                Mark Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;