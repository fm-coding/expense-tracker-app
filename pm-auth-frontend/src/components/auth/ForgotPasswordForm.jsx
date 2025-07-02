import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Send } from 'lucide-react';
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
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md mx-auto"
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/20">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Mail className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                        <p className="text-gray-600 mb-6">
                            We've sent password reset instructions to <strong className="text-gray-900">{email}</strong>
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Didn't receive the email? Check your spam folder or
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setAlertMessage(null);
                                }}
                                className="text-blue-600 hover:text-blue-700 ml-1 font-medium"
                            >
                                try again
                            </button>
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/20">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-600 mt-2">
                        No worries, we'll send you reset instructions
                    </p>
                </motion.div>

                {alertMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
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
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="relative group"
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
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
                            className={`pl-10 bg-white/50 backdrop-blur border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all ${error ? 'border-red-500' : ''}`}
                            autoComplete="email"
                        />
                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-red-600"
                            >
                                {error}
                            </motion.p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="mr-2"
                                    >
                                        <Send className="w-4 h-4" />
                                    </motion.span>
                                    Sending...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    Send Reset Instructions
                                    <Send className="ml-2 w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </motion.div>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="mt-6 text-center"
                >
                    <Link
                        to="/login"
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ForgotPasswordForm;