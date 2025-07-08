import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
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

    const inputVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: (i) => ({
            x: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1,
                duration: 0.3
            }
        })
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
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="text-gray-600 mt-2">Join thousands saving money smartly</p>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            variants={inputVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            className="relative group"
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            </div>
                            <Input
                                name="firstName"
                                type="text"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`pl-10 bg-white/50 backdrop-blur border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all ${errors.firstName ? 'border-red-500' : ''}`}
                                autoComplete="given-name"
                            />
                            {errors.firstName && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-1 text-sm text-red-600"
                                >
                                    {errors.firstName}
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            variants={inputVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            className="relative group"
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            </div>
                            <Input
                                name="lastName"
                                type="text"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`pl-10 bg-white/50 backdrop-blur border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all ${errors.lastName ? 'border-red-500' : ''}`}
                                autoComplete="family-name"
                            />
                            {errors.lastName && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-1 text-sm text-red-600"
                                >
                                    {errors.lastName}
                                </motion.p>
                            )}
                        </motion.div>
                    </div>

                    <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="relative group"
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`pl-10 bg-white/50 backdrop-blur border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all ${errors.email ? 'border-red-500' : ''}`}
                            autoComplete="email"
                        />
                        {errors.email && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-red-600"
                            >
                                {errors.email}
                            </motion.p>
                        )}
                    </motion.div>

                    <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        custom={3}
                        className="relative group"
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <Input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`pl-10 pr-10 bg-white/50 backdrop-blur border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all ${errors.password ? 'border-red-500' : ''}`}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-1 text-sm text-red-600"
                            >
                                {errors.password}
                            </motion.p>
                        )}
                    </motion.div>

                    <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        custom={4}
                        className="relative group"
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <Input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`pl-10 pr-10 bg-white/50 backdrop-blur border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
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
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="mr-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </motion.span>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    Create Free Account
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </motion.div>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="mt-6 text-center"
                >
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default RegisterForm;