import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser(formData);
            const { token, ...userData } = res.data;
            login(userData, token);

            // Keep a stable identity key so browser-local ticket caches stay user-specific.
            const keySource = String(userData.id || userData.email || userData.name || '').trim().toLowerCase();
            const currentUserKey = keySource ? `u:${keySource}` : '';
            if (currentUserKey) localStorage.setItem('scos.currentUserKey', currentUserKey);
            if (userData.email) localStorage.setItem('scos.email', userData.email);
            if (userData.name) localStorage.setItem('scos.reportedBy', userData.name);

            toast.success(`Welcome back, ${userData.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Smart Campus</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
                >
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Sign in with Google
                </button>

                {/* Quick Dev Login */}
                <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-4">Development Access (Bypass Mode)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => login({ id: 'DEV-MANAGER', name: 'Sara Manager', email: 'sara.w@campus.edu', role: 'MANAGER' }, 'mock-token-manager')}
                            className="text-[10px] font-bold py-2.5 px-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest shadow-sm"
                        >
                            Log as Manager
                        </button>
                        <button 
                            onClick={() => login({ id: 'DEV-ADMIN', name: 'Admin User', email: 'admin@campus.edu', role: 'ADMIN' }, 'mock-token-admin')}
                            className="text-[10px] font-bold py-2.5 px-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 hover:bg-slate-600 hover:text-white transition-all uppercase tracking-widest shadow-sm"
                        >
                            Log as Admin
                        </button>
                        <button 
                            onClick={() => login({ id: 'DEV-TECHNICIAN', name: 'Tech Master', email: 'tech@campus.edu', role: 'TECHNICIAN' }, 'mock-token-tech')}
                            className="text-[10px] font-bold py-2.5 px-2 bg-teal-50 text-teal-600 rounded-lg border border-teal-100 hover:bg-teal-600 hover:text-white transition-all uppercase tracking-widest shadow-sm"
                        >
                            Log as Technician
                        </button>
                        <button 
                            onClick={() => login({ id: 'DEV-STUDENT', name: 'John Student', email: 'student@campus.edu', role: 'USER' }, 'mock-token-user')}
                            className="text-[10px] font-bold py-2.5 px-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest shadow-sm"
                        >
                            Log as Student
                        </button>
                    </div>
                </div>

                <p className="text-center text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 font-medium hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;