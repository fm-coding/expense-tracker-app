import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { expenseService } from '@/services/expenseService';

const TransactionsPage = () => {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState(searchQuery);
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { toast } = useToast();

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, filterType]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            // Mock data for now
            setTransactions([]);
            setTotalPages(1);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast({
                title: "Error",
                description: "Failed to load transactions",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearch(value);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                toast({
                    title: "Success",
                    description: "Transaction deleted successfully"
                });
                fetchTransactions();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete transaction",
                    variant: "destructive"
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage all your transactions
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <CardTitle>All Transactions</CardTitle>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search transactions..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10 w-full md:w-[300px]"
                                    />
                                </div>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-full md:w-[150px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading transactions...</div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No transactions found. Add your first transaction from the dashboard.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TransactionsPage;