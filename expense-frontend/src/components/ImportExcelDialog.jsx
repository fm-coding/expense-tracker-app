import React, { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const ImportExcelDialog = ({ open, onClose, onImport, categories }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [parseResults, setParseResults] = useState(null);
    const [error, setError] = useState('');

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                '.xlsx',
                '.xls'
            ];

            const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

            if (!validTypes.includes(selectedFile.type) && !['.xlsx', '.xls'].includes(fileExtension)) {
                setError('Please select a valid Excel file (.xlsx or .xls)');
                return;
            }

            // Check file size (limit to 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setFile(selectedFile);
            setError('');
            setParseResults(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError('Please select a file to import');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);

            const result = await onImport(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (result && result.success) {
                // Show real results from the backend
                const stats = result.data || {};

                // Auto-categorization results
                const categorizedTransactions = {};
                if (stats.importResults && Array.isArray(stats.importResults)) {
                    stats.importResults.forEach(transaction => {
                        const category = transaction.categoryName || 'Uncategorized';
                        categorizedTransactions[category] = (categorizedTransactions[category] || 0) + 1;
                    });
                }

                setParseResults({
                    success: true,
                    message: 'File imported successfully!',
                    stats: {
                        total: stats.totalRows || 0,
                        imported: stats.successCount || 0,
                        skipped: stats.errorCount || 0,
                        categories: categorizedTransactions
                    }
                });

                // Auto close after showing results
                setTimeout(() => {
                    handleClose();
                }, 3000);
            } else {
                setError('Import failed. Please check your file format.');
                setUploadProgress(0);
            }
        } catch (error) {
            clearInterval(progressInterval);
            setError(error.message || 'Failed to import file. Please check the format and try again.');
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError('');
        setParseResults(null);
        setUploadProgress(0);
        onClose();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect({ target: { files: [droppedFile] } });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import Transactions from Excel</DialogTitle>
                    <DialogDescription>
                        Upload your bank statement or expense report. We'll automatically categorize your transactions using smart detection.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!parseResults && (
                        <>
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-6 text-center transition-all",
                                    "hover:border-gray-400 hover:bg-gray-50",
                                    file ? "border-green-500 bg-green-50" : "border-gray-300"
                                )}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <FileSpreadsheet className={cn(
                                    "mx-auto h-12 w-12 mb-3",
                                    file ? "text-green-500" : "text-gray-400"
                                )} />
                                <div className="space-y-2">
                                    <Label htmlFor="file-upload" className="cursor-pointer">
                                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                            Click to upload
                                        </span>
                                        <span className="text-sm text-gray-500"> or drag and drop</span>
                                    </Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls) - Max 5MB</p>
                                </div>
                            </div>

                            {file && (
                                <Alert className="border-green-200 bg-green-50">
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        <div className="flex justify-between items-center">
                                            <span>Selected: {file.name}</span>
                                            <span className="text-sm">({(file.size / 1024).toFixed(2)} KB)</span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Importing and categorizing transactions...</span>
                                        <span className="font-medium">{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                    <p className="text-xs text-muted-foreground">
                                        Processing your file and auto-detecting categories...
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {parseResults && parseResults.success && (
                        <div className="space-y-4">
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    {parseResults.message}
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-lg">Import Summary</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-center p-3 bg-white rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{parseResults.stats.total}</div>
                                        <div className="text-xs text-gray-500">Total Transactions</div>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{parseResults.stats.imported}</div>
                                        <div className="text-xs text-gray-500">Successfully Imported</div>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg">
                                        <div className="text-2xl font-bold text-amber-600">{parseResults.stats.skipped}</div>
                                        <div className="text-xs text-gray-500">Skipped/Errors</div>
                                    </div>
                                </div>

                                {Object.keys(parseResults.stats.categories).length > 0 && (
                                    <div className="pt-3 border-t">
                                        <h5 className="text-sm font-medium mb-2 flex items-center">
                                            <Info className="h-4 w-4 mr-1" />
                                            Auto-categorized Transactions
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(parseResults.stats.categories).map(([category, count]) => (
                                                <div key={category} className="flex justify-between text-sm bg-white rounded px-3 py-2">
                                                    <span className="text-gray-600">{category}:</span>
                                                    <span className="font-medium">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-2">
                                <p className="font-medium">Expected Excel format:</p>
                                <ul className="text-xs space-y-1 ml-4">
                                    <li>• Column A: Date (MM/DD/YYYY or DD/MM/YYYY)</li>
                                    <li>• Column B: Description (we'll auto-detect categories)</li>
                                    <li>• Column C: Amount (negative for expenses, positive for income)</li>
                                    <li>• Column D: Category (optional - we'll auto-categorize if empty)</li>
                                </ul>
                                <p className="text-xs mt-2">
                                    <strong>Smart categorization:</strong> Our AI will automatically categorize transactions based on descriptions
                                    (e.g., "Walmart" → "Shopping", "Netflix" → "Entertainment")
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || isUploading || parseResults?.success}
                        className={cn(
                            parseResults?.success && "bg-green-600 hover:bg-green-700"
                        )}
                    >
                        {isUploading ? (
                            <>
                                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                                Importing...
                            </>
                        ) : parseResults?.success ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Done
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Import
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImportExcelDialog;