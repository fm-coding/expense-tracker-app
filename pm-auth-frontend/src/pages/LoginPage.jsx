import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
                {/* Left side - Branding */}
                <div className="hidden lg:block">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Personal Management
                            <span className="text-primary-600"> System</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Streamline your tasks, track expenses, and boost productivity with our all-in-one management platform.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span className="text-gray-700">Secure authentication & data protection</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span className="text-gray-700">Real-time expense tracking</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span className="text-gray-700">Advanced analytics & insights</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="flex justify-center">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;