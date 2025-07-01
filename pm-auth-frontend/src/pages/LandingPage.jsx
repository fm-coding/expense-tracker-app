import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  PieChart,
  TrendingUp,
  Shield,
  Smartphone,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: 'Track Expenses',
      description: 'Monitor your spending habits with detailed analytics'
    },
    {
      icon: PieChart,
      title: 'Visual Reports',
      description: 'Understand your finances with intuitive charts'
    },
    {
      icon: TrendingUp,
      title: 'Budget Goals',
      description: 'Set and achieve your financial targets'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and protected'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Access your finances anywhere, anytime'
    },
    {
      icon: CreditCard,
      title: 'Multiple Categories',
      description: 'Organize expenses by customizable categories'
    }
  ];

  const benefits = [
    'Free to use forever',
    'No credit card required',
    'Unlimited transactions',
    'Export your data anytime',
    'Real-time insights',
    '24/7 access'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ExpenseTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Take Control of Your
              <span className="text-primary-600"> Finances</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Track expenses, manage budgets, and achieve your financial goals with our intuitive expense tracking platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="text-lg px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="text-lg px-8"
              >
                Sign In
              </Button>
            </div>
          </motion.div>

          {/* Demo Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">$0</div>
              <div className="text-gray-600 mt-2">Total Balance</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">$0</div>
              <div className="text-gray-600 mt-2">Total Income</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">$0</div>
              <div className="text-gray-600 mt-2">Total Expenses</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Money
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, powerful features to help you track every penny
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Start Tracking Your Expenses Today
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of users who have taken control of their financial future.
                Our platform makes it easy to track, analyze, and optimize your spending.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-100 rounded-lg p-8"
            >
              <img
                src="/api/placeholder/500/400"
                alt="Dashboard Preview"
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Sign up now and start your journey to financial freedom
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/register')}
              className="text-lg px-8"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6 text-primary-400" />
              <span className="ml-2 text-lg font-semibold">ExpenseTracker</span>
            </div>
            <p className="text-sm">
              © 2025 ExpenseTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;