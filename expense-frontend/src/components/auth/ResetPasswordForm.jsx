import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, Shield, CheckCircle, X } from 'lucide-react';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResetPasswordForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);

    const passwordRequirements = [
        { regex: /.{8,}/, text: 'At least 8 characters' },
        { regex: /[A-Z]/, text: 'One uppercase letter' },
        { regex: /[a-z]/, text: 'One lowercase letter' },
        { regex: /[0-9]/, text: 'One number' },
        { regex: /[@#$%^&+=]/, text: 'One special character' }
    ];

    useEffect(() => {
        if (!token) {
            setAlertMessage({
                type: 'error',
                message: 'Invalid or missing reset token. Please request a new password reset.'
            });
        }
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.newPassword) {
            newErrors.newPassword = 'Password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        } else if (!/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])/.test(formData.newPassword)) {
            newErrors.newPassword = 'Password must meet all requirements';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setAlertMessage({
                type: 'error',
                message: 'Invalid reset token. Please request a new password reset.'
            });
            return;
        }

        if (!validateForm()) return;

        setLoading(true);
        setAlertMessage(null);

        try {
            await authService.resetPassword(token, formData);
            setAlertMessage({
                type: 'success',
                message: 'Password reset successful! Redirecting to login...'
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Reset password error:', error);
            setAlertMessage({
                type: 'error',
                message: error.message || 'Failed to reset password. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Reset Password
                    </h2>
                    <p className="text-gray-600 mt-2">Create your new secure password</p>
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
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        </div>
                        <Input
                            name="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={`pl-10 pr-10 bg-white/50 backdrop-blur border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${errors.newPassword ? 'border-red-500' : ''}`}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {errors.newPassword && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-red-600"
                            >
                                {errors.newPassword}
                            </motion.p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="relative group"
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        </div>
                        <Input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`pl-10 pr-10 bg-white/50 backdrop-blur border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {errors.confirmPassword && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-red-600"
                            >
                                {errors.confirmPassword}
                            </motion.p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4"
                    >
                        <p className="font-medium text-purple-900 mb-3">Password Requirements:</p>
                        <ul className="space-y-2">
                            {passwordRequirements.map((req, index) => {
                                const isValid = req.regex.test(formData.newPassword);
                                return (
                                    <motion.li
                                        key={index}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 + index * 0.05 }}
                                        className={`flex items-center text-sm ${isValid ? 'text-green-700' : 'text-gray-600'}`}
                                    >
                                        {isValid ? (
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                        ) : (
                                            <X className="w-4 h-4 mr-2 text-gray-400" />
                                        )}
                                        {req.text}
                                    </motion.li>
                                );
                            })}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                    >
                        <Button
                            type="submit"
                            disabled={loading || !token}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </Button>
                    </motion.div>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
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

export default ResetPasswordForm;