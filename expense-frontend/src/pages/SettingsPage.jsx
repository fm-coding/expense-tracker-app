import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Globe,
    Moon,
    Sun,
    Save,
    Lock,
    Palette,
    ArrowLeft,
    Check,
    X,
    Shield,
    Smartphone,
    Wallet,
    Camera,
    Bell,
    Volume2,
    Eye,
    EyeOff,
    AlertCircle,
    RefreshCw,
    Settings // Add this import - this was missing!
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { currencies } from '@/config/currency';
import { userService } from '@/services/userService';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { toast } = useToast();

    // Initialize settings state with default values
    const [settingsData, setSettingsData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        currency: 'USD',
        theme: 'light',
        emailNotifications: true,
        pushNotifications: false,
        monthlyReports: true,
        budgetAlerts: true,
        soundEnabled: true,
        language: 'en',
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);

    // Load user data and preferences on component mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoading(true);

                // Set user data from auth context
                if (user) {
                    setSettingsData(prev => ({
                        ...prev,
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                    }));
                }

                // Load saved preferences from localStorage
                const savedCurrency = localStorage.getItem('preferredCurrency');
                const savedTheme = localStorage.getItem('theme');

                if (savedCurrency) {
                    setSettingsData(prev => ({ ...prev, currency: savedCurrency }));
                }
                if (savedTheme) {
                    setSettingsData(prev => ({ ...prev, theme: savedTheme }));
                }

                // Try to load preferences from backend - wrap in try-catch to handle 500 error
                try {
                    const response = await userService.getPreferences();
                    if (response?.data) {
                        setSettingsData(prev => ({
                            ...prev,
                            ...response.data
                        }));
                    }
                } catch (preferencesError) {
                    console.log('No preferences found or error loading preferences:', preferencesError);
                    // Don't show error toast for preferences - just use defaults
                }

            } catch (error) {
                console.error('Error loading settings:', error);
                toast({
                    title: "Warning",
                    description: "Some settings could not be loaded. Using defaults.",
                    variant: "warning"
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [user, toast]);

    // Apply theme on component mount and when it changes
    useEffect(() => {
        applyTheme(settingsData.theme);
    }, [settingsData.theme]);

    // Track changes
    useEffect(() => {
        if (!user) return;

        const hasProfileChanges =
            settingsData.firstName !== (user.firstName || '') ||
            settingsData.lastName !== (user.lastName || '');

        const hasPreferenceChanges =
            settingsData.currency !== (localStorage.getItem('preferredCurrency') || 'USD') ||
            settingsData.theme !== (localStorage.getItem('theme') || 'light');

        setHasChanges(hasProfileChanges || hasPreferenceChanges);
    }, [settingsData, user]);

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('bg-gray-900');
            document.body.classList.remove('bg-gray-50');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('bg-gray-900');
            document.body.classList.add('bg-gray-50');
        }
    };

    const handleChange = (field, value) => {
        setSettingsData(prev => ({
            ...prev,
            [field]: value
        }));

        // Apply theme immediately when changed
        if (field === 'theme') {
            applyTheme(value);
        }
    };

    const handlePasswordChange = (field, value) => {
        setPasswords(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Update user profile in database
            const response = await userService.updateProfile({
                firstName: settingsData.firstName,
                lastName: settingsData.lastName
            });

            // Update local auth context
            if (updateUser && response?.data) {
                updateUser({
                    ...user,
                    firstName: settingsData.firstName,
                    lastName: settingsData.lastName
                });
            }

            // Save preferences to localStorage
            localStorage.setItem('preferredCurrency', settingsData.currency);
            localStorage.setItem('theme', settingsData.theme);

            // Try to save preferences to backend - don't fail if it errors
            try {
                await userService.updatePreferences({
                    currency: settingsData.currency,
                    theme: settingsData.theme,
                    language: settingsData.language,
                    emailNotifications: settingsData.emailNotifications,
                    pushNotifications: settingsData.pushNotifications,
                    monthlyReports: settingsData.monthlyReports,
                    budgetAlerts: settingsData.budgetAlerts,
                    soundEnabled: settingsData.soundEnabled
                });
            } catch (prefError) {
                console.log('Preferences saved locally but failed to sync to server');
            }

            toast({
                title: "Success",
                description: "Your profile has been updated successfully",
            });

            setHasChanges(false);
        } catch (error) {
            console.error('Save profile error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        // Validate passwords
        if (passwords.new !== passwords.confirm) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive"
            });
            return;
        }

        if (passwords.new.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters long",
                variant: "destructive"
            });
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await userService.updatePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });

            toast({
                title: "Success",
                description: "Your password has been changed successfully",
            });

            // Reset password fields
            setPasswords({
                current: '',
                new: '',
                confirm: ''
            });
        } catch (error) {
            console.error('Password update error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update password",
                variant: "destructive"
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const themeColors = {
        light: {
            bg: 'bg-white',
            text: 'text-gray-900',
            border: 'border-gray-200',
            hover: 'hover:bg-gray-100'
        },
        dark: {
            bg: 'bg-gray-800',
            text: 'text-white',
            border: 'border-gray-700',
            hover: 'hover:bg-gray-700'
        }
    };

    const currentTheme = themeColors[settingsData.theme] || themeColors.light;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${settingsData.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 ${settingsData.theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border-b ${currentTheme.border} backdrop-blur-sm bg-opacity-95`}>
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className={`${currentTheme.hover}`}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${currentTheme.text}`}>ExpenseTracker</h2>
                                <p className={`text-xs ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Smart Finance Management
                                </p>
                            </div>
                        </div>
                    </div>

                    {hasChanges && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Unsaved changes
                        </Badge>
                    )}
                </div>
            </div>

            <div className="p-8 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <h1 className={`text-3xl font-bold ${currentTheme.text}`}>Settings</h1>
                    <p className={`mt-1 ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage your account preferences and security
                    </p>
                </motion.div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className={`grid w-full grid-cols-3 ${currentTheme.bg} ${currentTheme.border}`}>
                        <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                            <Shield className="h-4 w-4 mr-2" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
                            <Settings className="h-4 w-4 mr-2" />
                            Preferences
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        {/* Profile Section */}
                        <Card className={`border-0 shadow-lg ${currentTheme.bg} ${currentTheme.border}`}>
                            <CardHeader>
                                <CardTitle className={currentTheme.text}>Profile Information</CardTitle>
                                <CardDescription className={settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                    Update your personal information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl">
                                            {settingsData.firstName?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Button variant="outline" size="sm" className={currentTheme.border}>
                                            <Camera className="h-4 w-4 mr-2" />
                                            Change Avatar
                                        </Button>
                                        <p className={`text-sm mt-2 ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            JPG, PNG or GIF. Max size 2MB
                                        </p>
                                    </div>
                                </div>

                                <Separator className={currentTheme.border} />

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className={currentTheme.text}>First Name</Label>
                                        <div className="relative">
                                            <User className={`absolute left-3 top-2.5 h-4 w-4 ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                            <Input
                                                id="firstName"
                                                value={settingsData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                                className={`pl-10 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}
                                                placeholder="Enter your first name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className={currentTheme.text}>Last Name</Label>
                                        <div className="relative">
                                            <User className={`absolute left-3 top-2.5 h-4 w-4 ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                            <Input
                                                id="lastName"
                                                value={settingsData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                                className={`pl-10 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}
                                                placeholder="Enter your last name"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className={currentTheme.text}>Email</Label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-2.5 h-4 w-4 ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={settingsData.email}
                                            className={`pl-10 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} opacity-60`}
                                            disabled
                                        />
                                    </div>
                                    <p className={`text-sm ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Email cannot be changed for security reasons
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving || (!settingsData.firstName || !settingsData.lastName)}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                    >
                                        {isSaving ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Profile
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        {/* Security Section */}
                        <Card className={`border-0 shadow-lg ${currentTheme.bg} ${currentTheme.border}`}>
                            <CardHeader>
                                <CardTitle className={currentTheme.text}>Change Password</CardTitle>
                                <CardDescription className={settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                    Update your password regularly to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className={currentTheme.text}>Current Password</Label>
                                    <div className="relative">
                                        <Lock className={`absolute left-3 top-2.5 h-4 w-4 ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <Input
                                            id="currentPassword"
                                            type={showPassword.current ? "text" : "password"}
                                            value={passwords.current}
                                            onChange={(e) => handlePasswordChange('current', e.target.value)}
                                            className={`pl-10 pr-10 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}
                                            placeholder="Enter current password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                        >
                                            {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className={currentTheme.text}>New Password</Label>
                                    <div className="relative">
                                        <Lock className={`absolute left-3 top-2.5 h-4 w-4 ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <Input
                                            id="newPassword"
                                            type={showPassword.new ? "text" : "password"}
                                            value={passwords.new}
                                            onChange={(e) => handlePasswordChange('new', e.target.value)}
                                            className={`pl-10 pr-10 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}
                                            placeholder="Enter new password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                        >
                                            {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className={currentTheme.text}>Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className={`absolute left-3 top-2.5 h-4 w-4 ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword.confirm ? "text" : "password"}
                                            value={passwords.confirm}
                                            onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                                            className={`pl-10 pr-10 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}
                                            placeholder="Confirm new password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                        >
                                            {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                    >
                                        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        <span className="text-sm text-red-600 dark:text-red-400">Passwords do not match</span>
                                    </motion.div>
                                )}

                                {passwords.new && passwords.new.length < 6 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                                    >
                                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-sm text-amber-600 dark:text-amber-400">
                                            Password must be at least 6 characters long
                                        </span>
                                    </motion.div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleUpdatePassword}
                                        disabled={isUpdatingPassword || !passwords.current || !passwords.new || !passwords.confirm || passwords.new !== passwords.confirm}
                                        variant="destructive"
                                    >
                                        {isUpdatingPassword ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="mr-2 h-4 w-4" />
                                                Update Password
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preferences">
                        {/* Preferences Section */}
                        <Card className={`border-0 shadow-lg ${currentTheme.bg} ${currentTheme.border}`}>
                            <CardHeader>
                                <CardTitle className={currentTheme.text}>Application Preferences</CardTitle>
                                <CardDescription className={settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                    Customize your experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="currency" className={currentTheme.text}>Default Currency</Label>
                                    <Select value={settingsData.currency} onValueChange={(value) => handleChange('currency', value)}>
                                        <SelectTrigger className={`${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}>
                                            <Globe className="h-4 w-4 mr-2" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className={`${currentTheme.bg} ${currentTheme.border}`}>
                                            {currencies.map(currency => (
                                                <SelectItem key={currency.code} value={currency.code} className={currentTheme.text}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{currency.flag}</span>
                                                        <span>{currency.code} - {currency.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator className={currentTheme.border} />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${settingsData.theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                                                <Palette className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <Label className={currentTheme.text}>Theme</Label>
                                                <p className={`text-sm ${settingsData.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Choose your preferred theme
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Sun className={`h-4 w-4 ${settingsData.theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
                                            <Switch
                                                checked={settingsData.theme === 'dark'}
                                                onCheckedChange={(checked) => handleChange('theme', checked ? 'dark' : 'light')}
                                            />
                                            <Moon className={`h-4 w-4 ${settingsData.theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default SettingsPage;