import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPasswordForm = () => {

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const validateEmail = () => {
        if (!email) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail()) return;

        setLoading(true);
        setAlertMessage(null);
        setError('');

        try {
            await authService.forgotPassword(email);
            setSubmitted(true);
            setAlertMessage({
                type: 'success',
                message: 'Password reset instructions have been sent to your email.'
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            setAlertMessage({
                type: 'error',
                message: error.message || 'Failed to send reset email. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                        <p className="text-gray-600 mb-6">
                            We've sent password reset instructions to <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Didn't receive the email? Check your spam folder or
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setAlertMessage(null);
                                }}
                                className="text-primary-600 hover:text-primary-500 ml-1"
                            >
                                try again
                            </button>
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center text-primary-600 hover:text-primary-500"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="text-gray-600 mt-2">
                        Enter your email and we'll send you instructions to reset your password
                    </p>
                </div>

                {alertMessage && (
                    <Alert
                        variant={alertMessage.type === 'error' ? 'destructive' : 'default'}
                        className="mb-6"
                    >
                        {alertMessage.type === 'error' ? (
                            <AlertCircle className="h-4 w-4" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        <AlertDescription>
                            {alertMessage.message}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            className={`pl-10 ${error ? 'border-red-500' : ''}`}
                            autoComplete="email"
                        />
                        {error && (
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Sending...' : 'Send Reset Instructions'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;