import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { currencies } from '@/config/currency';

const AddExpenseDialog = ({ open, onClose, onSubmit, categories, selectedCurrency = 'USD', exchangeRates = {} }) => {
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        categoryId: '',
        description: '',
        transactionDate: new Date(),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Get current currency info
    const currency = currencies.find(c => c.code === selectedCurrency) || currencies[0];

    useEffect(() => {
        if (!open) {
            // Reset form when dialog closes
            setFormData({
                type: 'expense',
                amount: '',
                categoryId: '',
                description: '',
                transactionDate: new Date(),
            });
            setErrors({});
        }
    }, [open]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Please select a category';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Please enter a description';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const convertToUSD = (amount) => {
        console.log('Converting amount:', amount, 'from', selectedCurrency, 'to USD');
        console.log('Exchange rates:', exchangeRates);

        if (selectedCurrency === 'USD') return amount;

        // Check if we have exchange rates
        if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
            console.warn('No exchange rates available, using amount as-is');
            return amount;
        }

        const rate = exchangeRates[selectedCurrency];
        if (!rate || rate === 0) {
            console.warn(`No exchange rate found for ${selectedCurrency}, using amount as-is`);
            return amount;
        }

        // Convert from selected currency to USD
        const convertedAmount = amount / rate;
        console.log(`Converted ${amount} ${selectedCurrency} to ${convertedAmount} USD (rate: ${rate})`);

        // Round to 2 decimal places to avoid floating point issues
        return Math.round(convertedAmount * 100) / 100;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Parse the amount as float
            const originalAmount = parseFloat(formData.amount);

            // Convert amount to USD before sending to backend
            const amountInUSD = convertToUSD(originalAmount);

            console.log('Submitting transaction:', {
                originalAmount,
                amountInUSD,
                currency: selectedCurrency,
                type: formData.type.toUpperCase()
            });

            // Prepare the payload with proper types
            const payload = {
                categoryId: parseInt(formData.categoryId), // Ensure integer
                amount: parseFloat(amountInUSD.toFixed(2)), // Ensure float with 2 decimal places
                type: formData.type.toUpperCase(), // Ensure uppercase for backend (INCOME or EXPENSE)
                description: formData.description.trim(),
                transactionDate: formData.transactionDate
            };

            console.log('Final payload:', payload);

            const success = await onSubmit(payload);

            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
            // Show error to user
            setErrors({ submit: 'Failed to add transaction. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: '',
                submit: '' // Clear submit error too
            }));
        }
    };

    // Filter categories based on transaction type
    const filteredCategories = categories.filter(
        cat => cat.type.toUpperCase() === formData.type.toUpperCase()
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                        Record your income or expense in {currency.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Show general error if exists */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                {errors.submit}
                            </div>
                        )}

                        {/* Transaction Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant={formData.type === 'income' ? 'default' : 'outline'}
                                className={cn(
                                    "justify-center",
                                    formData.type === 'income' && "bg-green-600 hover:bg-green-700"
                                )}
                                onClick={() => {
                                    handleChange('type', 'income');
                                    handleChange('categoryId', ''); // Reset category when type changes
                                }}
                            >
                                Income
                            </Button>
                            <Button
                                type="button"
                                variant={formData.type === 'expense' ? 'default' : 'outline'}
                                className={cn(
                                    "justify-center",
                                    formData.type === 'expense' && "bg-red-600 hover:bg-red-700"
                                )}
                                onClick={() => {
                                    handleChange('type', 'expense');
                                    handleChange('categoryId', ''); // Reset category when type changes
                                }}
                            >
                                Expense
                            </Button>
                        </div>

                        {/* Amount with Currency Display */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10 pointer-events-none">
                                    <span className="text-muted-foreground font-semibold">{currency.symbol}</span>
                                    <span className="text-xs text-muted-foreground">{currency.code}</span>
                                </div>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => handleChange('amount', e.target.value)}
                                    className={cn(
                                        "pl-20", // Increased padding for currency display
                                        errors.amount && "border-red-500 focus:border-red-500"
                                    )}
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-sm text-red-500">{errors.amount}</p>
                            )}
                            {/* Show USD equivalent if not in USD */}
                            {selectedCurrency !== 'USD' && formData.amount && parseFloat(formData.amount) > 0 && (
                                <p className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                                    ≈ ${convertToUSD(parseFloat(formData.amount)).toFixed(2)} USD
                                    {exchangeRates[selectedCurrency] && (
                                        <span className="text-xs ml-1">
                                            (1 {selectedCurrency} = ${(1 / exchangeRates[selectedCurrency]).toFixed(4)} USD)
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => handleChange('categoryId', value)}
                            >
                                <SelectTrigger className={cn(
                                    errors.categoryId && "border-red-500 focus:border-red-500"
                                )}>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{category.icon}</span>
                                                    <span>{category.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No {formData.type} categories available
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.categoryId && (
                                <p className="text-sm text-red-500">{errors.categoryId}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder={formData.type === 'income'
                                    ? "e.g., Monthly salary, Freelance payment"
                                    : "e.g., Grocery shopping, Utility bills"}
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className={cn(
                                    "resize-none min-h-[80px]",
                                    errors.description && "border-red-500 focus:border-red-500"
                                )}
                                rows={3}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label>Transaction Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.transactionDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.transactionDate ? (
                                            format(formData.transactionDate, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.transactionDate}
                                        onSelect={(date) => handleChange('transactionDate', date)}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                formData.type === 'income'
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Adding...
                                </>
                            ) : (
                                `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddExpenseDialog;