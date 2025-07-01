import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AddExpenseDialog = ({ open, onClose, onSubmit, categories = [] }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [transactionType, setTransactionType] = useState('EXPENSE');
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        categoryId: '',
        transactionDate: new Date(),
        type: 'EXPENSE'
    });
    const [errors, setErrors] = useState({});

    // Debug categories
    useEffect(() => {
        console.log('Categories received:', categories);
        console.log('Transaction type:', transactionType);
        console.log('Filtered categories:', categories.filter(cat => cat.type === transactionType));
    }, [categories, transactionType]);

    // Filter categories based on transaction type
    const filteredCategories = categories.filter(cat =>
        cat.type === transactionType
    );

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Please select a category';
        }

        if (!formData.transactionDate) {
            newErrors.transactionDate = 'Transaction date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const success = await onSubmit({
                ...formData,
                amount: parseFloat(formData.amount),
                categoryId: parseInt(formData.categoryId) || formData.categoryId, // Handle both number and string IDs
                type: transactionType
            });

            if (success) {
                handleReset();
                onClose();
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            amount: '',
            description: '',
            categoryId: '',
            transactionDate: new Date(),
            type: 'EXPENSE'
        });
        setErrors({});
        setTransactionType('EXPENSE');
    };

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            handleReset();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                        Record a new income or expense transaction
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs value={transactionType} onValueChange={(value) => {
                        setTransactionType(value);
                        handleInputChange('type', value);
                        handleInputChange('categoryId', ''); // Reset category when type changes
                    }}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
                            <TabsTrigger value="INCOME">Income</TabsTrigger>
                        </TabsList>

                        <TabsContent value={transactionType} className="space-y-4 mt-4">
                            {/* Amount Field */}
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-sm font-medium">
                                    Amount <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                        className={cn(
                                            "pl-9",
                                            errors.amount && "border-red-500"
                                        )}
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="text-sm text-red-500">{errors.amount}</p>
                                )}
                            </div>

                            {/* Category Field */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium">
                                    Category <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.categoryId.toString()}
                                    onValueChange={(value) => handleInputChange('categoryId', value)}
                                >
                                    <SelectTrigger className={cn(
                                        errors.categoryId && "border-red-500"
                                    )}>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{category.icon}</span>
                                                        <span>{category.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center">
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    No categories available
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        // TODO: Add create category functionality
                                                        console.log('Create category clicked');
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Create Category
                                                </Button>
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.categoryId && (
                                    <p className="text-sm text-red-500">{errors.categoryId}</p>
                                )}
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">
                                    Description <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder={transactionType === 'EXPENSE'
                                        ? "e.g., Grocery shopping at Walmart"
                                        : "e.g., Monthly salary"
                                    }
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className={cn(
                                        "min-h-[80px]",
                                        errors.description && "border-red-500"
                                    )}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Date Field */}
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-sm font-medium">
                                    Transaction Date <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.transactionDate && "text-muted-foreground",
                                                errors.transactionDate && "border-red-500"
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
                                            onSelect={(date) => handleInputChange('transactionDate', date)}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.transactionDate && (
                                    <p className="text-sm text-red-500">{errors.transactionDate}</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>

                <DialogFooter className="mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={cn(
                            transactionType === 'EXPENSE'
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Adding...
                            </>
                        ) : (
                            `Add ${transactionType.charAt(0) + transactionType.slice(1).toLowerCase()}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddExpenseDialog;