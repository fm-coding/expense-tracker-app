import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const RecentTransactions = ({ transactions = [] }) => {
    const getCategoryColor = (category) => {
        const colors = {
            'Food': 'bg-orange-100 text-orange-800',
            'Transport': 'bg-blue-100 text-blue-800',
            'Shopping': 'bg-pink-100 text-pink-800',
            'Bills': 'bg-red-100 text-red-800',
            'Entertainment': 'bg-purple-100 text-purple-800',
            'Income': 'bg-green-100 text-green-800',
            'Other': 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors['Other'];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                        ) : (
                            transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {transaction.type === 'income' ? (
                                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className={getCategoryColor(transaction.category)}>
                                            {transaction.category}
                                        </Badge>
                                        <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default RecentTransactions;