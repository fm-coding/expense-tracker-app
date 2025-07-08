import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const RecentTransactions = ({ transactions = [], formatCurrency }) => {
    const getCategoryIcon = (icon) => {
        return icon || '📁';
    };

    return (
        <div className="space-y-4">
            {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                    No transactions yet. Add your first transaction to get started!
                </p>
            ) : (
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${
                                        transaction.type === 'income'
                                            ? 'bg-green-100 dark:bg-green-900/20'
                                            : 'bg-red-100 dark:bg-red-900/20'
                                    }`}>
                                        {transaction.type === 'income' ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium leading-none">{transaction.description}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                            </span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs">{getCategoryIcon(transaction.categoryIcon)}</span>
                                                <span className="text-xs text-muted-foreground">{transaction.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`font-semibold ${
                                        transaction.type === 'income'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {transaction.type === 'income' ? '+' : '-'}
                                        {formatCurrency ? formatCurrency(Math.abs(transaction.amount)) : `$${Math.abs(transaction.amount).toFixed(2)}`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
};

export default RecentTransactions;