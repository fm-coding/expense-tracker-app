import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Filter,
    Download,
    PieChart,
    BarChart3,
    LogOut,
    Menu
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ExpenseChart from '@/components/ExpenseChart';
import RecentTransactions from '@/components/RecentTransactions';
import AddExpenseDialog from '@/components/AddExpenseDialog';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        recentTransactions: [],
        categoryBreakdown: [],
        monthlyTrend: []
    });

    const { user, logout } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [selectedPeriod, user]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            // Using demo data for now
            setDashboardData({
                totalBalance: 5420.50,
                totalIncome: 8500.00,
                totalExpenses: 3079.50,
                recentTransactions: [
                    { id: 1, description: 'Grocery Shopping', amount: 156.80, type: 'expense', category: 'Food', date: new Date() },
                    { id: 2, description: 'Salary', amount: 8500.00, type: 'income', category: 'Income', date: new Date() },
                    { id: 3, description: 'Netflix Subscription', amount: 15.99, type: 'expense', category: 'Entertainment', date: new Date() },
                    { id: 4, description: 'Gas Station', amount: 45.00, type: 'expense', category: 'Transport', date: new Date() },
                    { id: 5, description: 'Restaurant', amount: 78.50, type: 'expense', category: 'Food', date: new Date() },
                ],
                categoryBreakdown: [
                    { name: 'Food', value: 1200 },
                    { name: 'Transport', value: 800 },
                    { name: 'Entertainment', value: 400 },
                    { name: 'Bills', value: 600 },
                    { name: 'Shopping', value: 300 },
                ],
                monthlyTrend: [
                    { date: 'Jan', income: 8500, expenses: 3200 },
                    { date: 'Feb', income: 8500, expenses: 2800 },
                    { date: 'Mar', income: 8500, expenses: 3500 },
                    { date: 'Apr', income: 8500, expenses: 2900 },
                    { date: 'May', income: 8500, expenses: 3100 },
                    { date: 'Jun', income: 8500, expenses: 3079.50 },
                ]
            });

        } catch (error) {
            console.error('Dashboard fetch error:', error);
            toast({
                title: "Error",
                description: "Failed to load dashboard data",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            toast({
                title: "Export",
                description: "Export feature will be available soon",
                variant: "default"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to export transactions",
                variant: "destructive"
            });
        }
    };

    const handleLogout = () => {
        logout();
    };

    const StatCard = ({ title, value, icon: Icon, trend, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className={`h-4 w-4 ${color}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                    </div>
                    {trend && (
                        <p className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
                            {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {Math.abs(trend)}% from last {selectedPeriod}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    const Sidebar = () => (
        <div className="h-full bg-background border-r relative">
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">ExpenseTracker</h2>
                <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Transactions
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <PieChart className="mr-2 h-4 w-4" />
                        Analytics
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        Budget
                    </Button>
                </nav>
            </div>
            <div className="absolute bottom-0 w-full p-6 border-t bg-background">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex h-screen">
                <div className="hidden lg:block w-64">
                    <Sidebar />
                </div>
                <div className="flex-1 p-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-32" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const savingsRate = dashboardData.totalIncome > 0
        ? ((dashboardData.totalIncome - dashboardData.totalExpenses) / dashboardData.totalIncome * 100).toFixed(1)
        : '0.0';

    return (
        <div className="flex h-screen bg-background">
            <div className="hidden lg:block w-64 relative">
                <Sidebar />
            </div>

            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <Sidebar />
                </SheetContent>
            </Sheet>

            <div className="flex-1 overflow-auto">
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                                <p className="text-muted-foreground">
                                    Welcome back, {user?.firstName || 'User'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hidden sm:flex">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                            <Button onClick={() => setShowAddExpense(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </div>
                    </div>

                    <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <TabsList>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="month">Month</TabsTrigger>
                            <TabsTrigger value="year">Year</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Balance"
                            value={dashboardData.totalBalance}
                            icon={DollarSign}
                            color="text-blue-500"
                        />
                        <StatCard
                            title="Total Income"
                            value={dashboardData.totalIncome}
                            icon={TrendingUp}
                            trend={12.5}
                            color="text-green-500"
                        />
                        <StatCard
                            title="Total Expenses"
                            value={dashboardData.totalExpenses}
                            icon={TrendingDown}
                            trend={-8.2}
                            color="text-red-500"
                        />
                        <StatCard
                            title="Savings Rate"
                            value={`${savingsRate}%`}
                            icon={PieChart}
                            color="text-purple-500"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4">
                            <ExpenseChart data={dashboardData.monthlyTrend} />
                        </div>
                        <div className="col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Category Breakdown</CardTitle>
                                    <CardDescription>Expense distribution by category</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ExpenseChart data={dashboardData.categoryBreakdown} type="pie" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <RecentTransactions transactions={dashboardData.recentTransactions} />

                    <AddExpenseDialog
                        open={showAddExpense}
                        onClose={() => setShowAddExpense(false)}
                        onSuccess={() => {
                            fetchDashboardData();
                            toast({
                                title: "Success",
                                description: "Transaction added successfully"
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;