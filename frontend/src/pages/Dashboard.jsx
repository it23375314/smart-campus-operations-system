import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">Smart Campus</h1>
                <div className="flex items-center gap-4">
                    <Link
                        to="/notifications"
                        className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                        🔔 Notifications
                    </Link>
                    {isAdmin() && (
                        <Link
                            to="/users"
                            className="text-gray-600 hover:text-blue-600 font-medium"
                        >
                            👥 Users
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto p-6">
                {/* Welcome Card */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Welcome back, {user?.name}! 👋
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Role: <span className="font-semibold text-blue-600">{user?.role}</span>
                    </p>
                    <p className="text-gray-500">
                        Email: <span className="font-semibold">{user?.email}</span>
                    </p>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/notifications">
                        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition cursor-pointer border-l-4 border-blue-500">
                            <div className="text-3xl mb-3">🔔</div>
                            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                            <p className="text-gray-500 text-sm mt-1">View your notifications</p>
                        </div>
                    </Link>

                    {isAdmin() && (
                        <Link to="/users">
                            <div className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition cursor-pointer border-l-4 border-green-500">
                                <div className="text-3xl mb-3">👥</div>
                                <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                                <p className="text-gray-500 text-sm mt-1">Manage system users</p>
                            </div>
                        </Link>
                    )}

                    <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-500">
                        <div className="text-3xl mb-3">🏫</div>
                        <h3 className="text-lg font-semibold text-gray-800">My Profile</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* Admin Panel */}
                {isAdmin() && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                            🛡️ Admin Panel
                        </h3>
                        <p className="text-blue-600 text-sm">
                            You have admin access. You can manage users, assign roles, and view all system data.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;