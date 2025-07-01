import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ExpenseChart = ({ data, type = 'line' }) => {
    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#00C49F" name="Income" />
                            <Line type="monotone" dataKey="expenses" stroke="#FF8042" name="Expenses" />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Track your income and expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
                {renderChart()}
            </CardContent>
        </Card>
    );
};

export default ExpenseChart;