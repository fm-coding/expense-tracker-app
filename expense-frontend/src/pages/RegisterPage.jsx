import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
                {/* Left side - Registration Form */}
                <div className="flex justify-center order-2 lg:order-1">
                    <RegisterForm />
                </div>

                {/* Right side - Branding */}
                <div className="hidden lg:block order-1 lg:order-2">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Join Our
                            <span className="text-primary-600"> Community</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Start your journey with us today. Create your account and unlock powerful management tools.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                                <span className="text-gray-700">Free account with no hidden fees</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                                <span className="text-gray-700">Instant email verification</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                                <span className="text-gray-700">24/7 customer support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;