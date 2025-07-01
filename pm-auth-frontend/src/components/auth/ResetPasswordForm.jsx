import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';


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

        // Clear error when user starts typing
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
            newErrors.newPassword = 'Password must contain uppercase, lowercase, number and special character';
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
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
                    <p className="text-gray-600 mt-2">Enter your new password below</p>
                </div>

                {alertMessage && (
                    <Alert
                        type={alertMessage.type}
                        message={alertMessage.message}
                        className="mb-6"
                        onClose={() => setAlertMessage(null)}
                    />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Input
                            name="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            error={errors.newPassword}
                            icon={Lock}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="relative">
                        <Input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            icon={Lock}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                        <p className="font-medium text-blue-900 mb-2">Password Requirements:</p>
                        <ul className="text-blue-800 space-y-1">
                            <li>• At least 8 characters long</li>
                            <li>• Contains uppercase and lowercase letters</li>
                            <li>• Contains at least one number</li>
                            <li>• Contains at least one special character (@#$%^&+=)</li>
                        </ul>
                    </div>

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full"
                        disabled={!token}
                    >
                        Reset Password
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

export default ResetPasswordForm;