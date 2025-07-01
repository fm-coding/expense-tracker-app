import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RegisterForm = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);

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

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setAlertMessage(null);

        try {
            await register(formData);
            setAlertMessage({
                type: 'success',
                message: 'Registration successful! Please check your email to verify your account.'
            });

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Registration error:', error);
            setAlertMessage({
                type: 'error',
                message: error.message || 'Registration failed. Please try again.'
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
                        <UserPlus className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-600 mt-2">Sign up for your ExpenseTracker account</p>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                name="firstName"
                                type="text"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                                autoComplete="given-name"
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                name="lastName"
                                type="text"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                                autoComplete="family-name"
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                            autoComplete="email"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;