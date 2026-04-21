import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const role = searchParams.get('role');
        const id = searchParams.get('id');

        if (token) {
            login({ id, name, email, role }, token);
            toast.success(`Welcome, ${name}!`);
            navigate('/dashboard');
        } else {
            toast.error('OAuth login failed');
            navigate('/login');
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing Google login...</p>
            </div>
        </div>
    );
};

export default OAuthSuccess;