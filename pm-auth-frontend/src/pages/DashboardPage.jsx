import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    Download,
    Upload,
    PieChart,
    BarChart3,
    LogOut,
    Menu,
    RefreshCw,
    Target,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    FileSpreadsheet,
    Settings,
    Bell,
    Search,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ExpenseChart from '@/components/ExpenseChart';
import RecentTransactions from '@/components/RecentTransactions';
import AddExpenseDialog from '@/components/AddExpenseDialog';
import ImportExcelDialog from '@/components/ImportExcelDialog';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { expenseService } from '@/services/expenseService';

const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        recentTransactions: [],
        categoryBreakdown: [],
        monthlyTrend: [],
        savingsRate: 0,
        incomeTrend: 0,
        expenseTrend: 0,
        monthlyBudget: 5000, // Example budget
        budgetUsed: 0
    });

    const { user, logout } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [selectedPeriod, user]);

    const calculateTrend = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            const [dashboardResponse, categoriesResponse] = await Promise.all([
                expenseService.getDashboardSummary(selectedPeriod),
                expenseService.getCategories()
            ]);

            const transformedCategories = categoriesResponse.map(cat => ({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                icon: cat.icon || '📁',
                color: cat.color || '#6B7280'
            }));
            setCategories(transformedCategories);

            const dashboardResult = dashboardResponse;
            const monthlyTrends = dashboardResult.monthlyTrends || [];
            let incomeTrend = 0;
            let expenseTrend = 0;

            if (monthlyTrends.length >= 2) {
                const currentMonth = monthlyTrends[monthlyTrends.length - 1];
                const previousMonth = monthlyTrends[monthlyTrends.length - 2];

                if (currentMonth && previousMonth) {
                    incomeTrend = calculateTrend(
                        parseFloat(currentMonth.income) || 0,
                        parseFloat(previousMonth.income) || 0
                    );
                    expenseTrend = calculateTrend(
                        parseFloat(currentMonth.expense) || 0,
                        parseFloat(previousMonth.expense) || 0
                    );
                }
            }

            const totalExpenses = dashboardResult.totalExpense || 0;
            const monthlyBudget = 5000; // This should come from user settings
            const budgetUsed = (totalExpenses / monthlyBudget) * 100;

            setDashboardData({
                totalBalance: dashboardResult.netAmount || 0,
                totalIncome: dashboardResult.totalIncome || 0,
                totalExpenses: totalExpenses,
                savingsRate: dashboardResult.savingsRate || 0,
                incomeTrend: incomeTrend,
                expenseTrend: expenseTrend,
                monthlyBudget: monthlyBudget,
                budgetUsed: Math.min(budgetUsed, 100),
                recentTransactions: (dashboardResult.recentTransactions || []).map(tx => ({
                    id: tx.id,
                    description: tx.description || 'No description',
                    amount: parseFloat(tx.amount) || 0,
                    type: tx.type?.toLowerCase() || 'expense',
                    category: tx.categoryName || 'Uncategorized',
                    categoryIcon: tx.categoryIcon || '📁',
                    categoryColor: tx.categoryColor || '#6B7280',
                    date: tx.transactionDate ? new Date(tx.transactionDate) : new Date()
                })),
                categoryBreakdown: (dashboardResult.expensesByCategory || []).map(cat => ({
                    name: cat.categoryName || 'Unknown',
                    value: parseFloat(cat.amount) || 0,
                    percentage: parseFloat(cat.percentage) || 0,
                    color: cat.categoryColor || '#6B7280',
                    icon: cat.categoryIcon || '📁'
                })),
                monthlyTrend: (dashboardResult.monthlyTrends || []).map(trend => ({
                    date: trend.monthName || `Month ${trend.month}`,
                    month: trend.month,
                    year: trend.year,
                    income: parseFloat(trend.income) || 0,
                    expenses: parseFloat(trend.expense) || 0,
                    net: parseFloat(trend.net) || 0
                }))
            });

        } catch (error) {
            console.error('Dashboard fetch error:', error);
            setDashboardData({
                totalBalance: 0,
                totalIncome: 0,
                totalExpenses: 0,
                recentTransactions: [],
                categoryBreakdown: [],
                monthlyTrend: [],
                savingsRate: 0,
                incomeTrend: 0,
                expenseTrend: 0,
                monthlyBudget: 5000,
                budgetUsed: 0
            });

            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to load dashboard data. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchDashboardData();
        setIsRefreshing(false);
        toast({
            title: "Refreshed",
            description: "Dashboard data updated successfully",
        });
    };

    const handleExport = async () => {
        try {
            const blob = await expenseService.exportTransactions(selectedPeriod);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const now = new Date();
            const filename = `expense-report-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.xlsx`;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);

            toast({
                title: "Success",
                description: "Transactions exported successfully"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to export transactions",
                variant: "destructive"
            });
        }
    };

    const handleImportExcel = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await expenseService.importTransactions(formData);
            await fetchDashboardData();

            // Check if result has the expected structure
            const importData = result?.data || result;
            const successCount = importData?.successCount || importData?.imported || 0;
            const totalCount = importData?.totalRows || importData?.total || 0;
            const errorCount = importData?.errorCount || importData?.errors || 0;

            toast({
                title: "Success",
                description: `Imported ${successCount} of ${totalCount} transactions successfully`,
            });

            // Return the import result for the dialog to display
            return {
                success: true,
                data: {
                    totalRows: totalCount,
                    successCount: successCount,
                    errorCount: errorCount,
                    importResults: importData?.importResults || [],
                }
            };
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to import transactions",
                variant: "destructive"
            });
            return false;
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleAddTransaction = async (transactionData) => {
        try {
            await expenseService.createTransaction(transactionData);
            await fetchDashboardData();
            toast({
                title: "Success",
                description: "Transaction added successfully"
            });
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to add transaction";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
            return false;
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden"
        >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{
                    backgroundImage: `linear-gradient(135deg, ${color} 0%, transparent 100%)`
                }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: color }}>
                        <Icon className={`h-4 w-4`} style={{ color }} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {typeof value === 'number' ?
                            `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : value}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                    )}
                    {trend !== undefined && trend !== 0 && (
                        <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    const Sidebar = () => (
        <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white relative">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <Wallet className="h-8 w-8 text-blue-400" />
                    <h2 className="text-2xl font-bold">ExpenseTracker</h2>
                </div>
                <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 bg-white/5">
                        <BarChart3 className="mr-3 h-4 w-4" />
                        Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                        <CreditCard className="mr-3 h-4 w-4" />
                        Transactions
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                        <PieChart className="mr-3 h-4 w-4" />
                        Analytics
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                        <Target className="mr-3 h-4 w-4" />
                        Budgets
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                        <FileSpreadsheet className="mr-3 h-4 w-4" />
                        Reports
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                    </Button>
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 p-0">
                            <div className="flex items-center gap-3 w-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="bg-blue-500 text-white">
                                        {user?.firstName?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-white/60">{user?.email}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-white/60" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    const TopBar = () => (
        <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transactions..."
                            className="pl-10 w-[300px]"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImportDialog(true)}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={() => setShowAddExpense(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <div className="hidden lg:block w-64">
                    <Sidebar />
                </div>
                <div className="flex-1">
                    <TopBar />
                    <div className="p-6 space-y-6">
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
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="hidden lg:block w-64 fixed h-full">
                <Sidebar />
            </div>

            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <Sidebar />
                </SheetContent>
            </Sheet>

            <div className="flex-1 lg:ml-64">
                <TopBar />

                <div className="p-6 space-y-6 max-w-7xl mx-auto">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}! 👋
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="mt-4 md:mt-0">
                            <TabsList className="bg-white shadow-sm">
                                <TabsTrigger value="week">Week</TabsTrigger>
                                <TabsTrigger value="month">Month</TabsTrigger>
                                <TabsTrigger value="year">Year</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Balance"
                            value={dashboardData.totalBalance}
                            icon={Wallet}
                            color="#3B82F6"
                            subtitle="Available funds"
                        />
                        <StatCard
                            title="Total Income"
                            value={dashboardData.totalIncome}
                            icon={TrendingUp}
                            trend={dashboardData.incomeTrend}
                            color="#10B981"
                            subtitle={`${dashboardData.incomeTrend > 0 ? 'Up' : 'Down'} from last ${selectedPeriod}`}
                        />
                        <StatCard
                            title="Total Expenses"
                            value={dashboardData.totalExpenses}
                            icon={TrendingDown}
                            trend={dashboardData.expenseTrend}
                            color="#EF4444"
                            subtitle={`${dashboardData.expenseTrend > 0 ? 'Up' : 'Down'} from last ${selectedPeriod}`}
                        />
                        <StatCard
                            title="Savings Rate"
                            value={`${dashboardData.savingsRate || 0}%`}
                            icon={PieChart}
                            color="#8B5CF6"
                            subtitle="Of total income"
                        />
                    </div>

                    {/* Budget Progress Card */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Monthly Budget</CardTitle>
                                    <CardDescription>Track your spending against your budget</CardDescription>
                                </div>
                                <Target className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Spent</span>
                                    <span className="font-medium">
                                        ${dashboardData.totalExpenses.toLocaleString()} / ${dashboardData.monthlyBudget.toLocaleString()}
                                    </span>
                                </div>
                                <Progress value={dashboardData.budgetUsed} className="h-3" />
                                {dashboardData.budgetUsed > 80 && (
                                    <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>You've used {dashboardData.budgetUsed.toFixed(0)}% of your monthly budget</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Charts Section */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Spending Trends</CardTitle>
                                <CardDescription>Income vs Expenses over time</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ExpenseChart data={dashboardData.monthlyTrend} />
                            </CardContent>
                        </Card>

                        <Card className="col-span-3 border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Category Breakdown</CardTitle>
                                <CardDescription>Where your money goes</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ExpenseChart data={dashboardData.categoryBreakdown} type="pie" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Transactions */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Transactions</CardTitle>
                                    <CardDescription>Your latest financial activities</CardDescription>
                                </div>
                                <Badge variant="secondary">
                                    {dashboardData.recentTransactions.length} transactions
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <RecentTransactions transactions={dashboardData.recentTransactions} />
                        </CardContent>
                    </Card>

                    <AddExpenseDialog
                        open={showAddExpense}
                        onClose={() => setShowAddExpense(false)}
                        onSubmit={handleAddTransaction}
                        categories={categories}
                    />

                    <ImportExcelDialog
                        open={showImportDialog}
                        onClose={() => setShowImportDialog(false)}
                        onImport={handleImportExcel}
                        categories={categories}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;