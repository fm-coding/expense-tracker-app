import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  PieChart,
  TrendingUp,
  Shield,
  Smartphone,
  CreditCard,
  CheckCircle,
  Star,
  Users,
  Zap,
  Lock,
  Globe,
  DollarSign,
  Calendar,
  FileText,
  Menu,
  X,
  Play,
  Quote,
  ArrowUpRight,
  Sparkles,
  Target,
  LineChart,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Animated counter hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime;
      const animateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      requestAnimationFrame(animateCount);
    }, [end, duration]);

    return count;
  };

  const features = [
    {
      icon: LineChart,
      title: 'Real-time Analytics',
      description: 'Track your spending patterns with AI-powered insights and predictive analytics',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Wallet,
      title: 'Smart Budgeting',
      description: 'Intelligent budget recommendations based on your spending habits',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and achieve financial milestones with guided progress tracking',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Bank-level Security',
      description: '256-bit encryption and multi-factor authentication protect your data',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Smartphone,
      title: 'Cross-platform Sync',
      description: 'Seamlessly sync across all your devices in real-time',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Instant Insights',
      description: 'Get actionable recommendations to optimize your spending',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Entrepreneur',
      content: 'ExpenseTracker transformed how I manage my business finances. The insights are invaluable!',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Software Developer',
      content: 'Finally, an expense tracker that actually helps me save money. The AI recommendations are spot-on.',
      avatar: '👨‍💻',
      rating: 5
    },
    {
      name: 'Emily Thompson',
      role: 'Freelance Designer',
      content: 'The goal tracking feature helped me save for my dream vacation in just 6 months!',
      avatar: '👩‍🎨',
      rating: 5
    }
  ];

  const stats = [
    { label: 'Active Users', value: 50000, prefix: '', suffix: '+' },
    { label: 'Money Saved', value: 2.5, prefix: '$', suffix: 'M+' },
    { label: 'Transactions Tracked', value: 10, prefix: '', suffix: 'M+' },
    { label: 'User Rating', value: 4.9, prefix: '', suffix: '/5' }
  ];

  const benefits = [
    '100% Free Forever',
    'No credit card required',
    'Unlimited transactions',
    'Export your data anytime',
    'Real-time AI insights',
    'Bank-level security',
    'Cross-platform sync',
    '24/7 access'
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden">
        {/* Progress Bar */}
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform-origin-left z-50"
            style={{ scaleX }}
        />

        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <motion.div
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/')}
              >
                <div className="relative">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <motion.div
                      className="absolute inset-0 bg-blue-500 blur-xl opacity-50"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ExpenseTracker
              </span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Button>
                <Button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Get Started Free
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-800"
                >
                  <div className="px-4 py-6 space-y-4">
                    <a href="#features" className="block text-gray-300 hover:text-white">Features</a>
                    <a href="#how-it-works" className="block text-gray-300 hover:text-white">How it Works</a>
                    <a href="#testimonials" className="block text-gray-300 hover:text-white">Testimonials</a>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="w-full"
                    >
                      Sign In
                    </Button>
                    <Button
                        onClick={() => navigate('/register')}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      Get Started Free
                    </Button>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
              <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-6"
              >
                <Sparkles className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-sm text-blue-400">100% Free Forever • No Credit Card Required</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Master Your Money
              </span>
                <br />
                <span className="text-white">With Intelligence</span>
              </h1>

              <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                Join 50,000+ users who save an average of $500/month using our AI-powered expense tracking
                and smart budgeting recommendations - completely free!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-2xl"
                  >
                    Start Free Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6 border-gray-600 hover:border-gray-400 hover:bg-gray-800"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </div>

              {/* Live Stats */}
              <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              >
                {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {stat.prefix}
                        {stat.value % 1 === 0 ? useCounter(stat.value) : stat.value}
                        {stat.suffix}
                      </div>
                      <div className="text-gray-400 mt-2">{stat.label}</div>
                    </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-600 rounded-full mt-2" />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
                Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need to
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Succeed</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Powerful tools and insights designed to transform your financial habits - all completely free
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-full group hover:border-gray-600 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="w-full h-full text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-400">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
              <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
                How It Works
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Get Started in
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> 3 Simple Steps</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />

              {[
                { step: '01', title: 'Sign Up Free', description: 'Create your free account in seconds', icon: Users },
                { step: '02', title: 'Add Transactions', description: 'Track your income and expenses easily', icon: CreditCard },
                { step: '03', title: 'Get Insights', description: 'See where your money goes and save more', icon: TrendingUp }
              ].map((item, index) => (
                  <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className="relative"
                  >
                    <div className="text-center">
                      <motion.div
                          className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 relative z-10"
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                      >
                        <item.icon className="w-10 h-10 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-400">{item.description}</p>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-6xl font-bold text-gray-800/50">
                        {item.step}
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
              <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
                Why Choose Us
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Start Managing Your Money
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> Better Today</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
              >
                <h3 className="text-3xl font-bold mb-6">
                  Everything you need, nothing you don't
                </h3>
                <p className="text-lg text-gray-400 mb-8">
                  Join thousands of users who have taken control of their financial future.
                  Our platform makes it easy to track, analyze, and optimize your spending -
                  without any hidden fees or paywalls.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                      <motion.div
                          key={index}
                          className="flex items-center"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </motion.div>
                  ))}
                </div>
                <motion.div
                    className="mt-8"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                  <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative"
              >
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">$0</div>
                      <div className="text-sm text-gray-400">Forever</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">50K+</div>
                      <div className="text-sm text-gray-400">Users</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">256-bit</div>
                      <div className="text-sm text-gray-400">Encryption</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">Real-time</div>
                      <div className="text-sm text-gray-400">Sync</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
              <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Loved by
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Thousands</span>
              </h2>
              <p className="text-xl text-gray-400">See what our users have to say</p>
            </motion.div>

            <div className="relative max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12"
                >
                  <Quote className="h-12 w-12 text-blue-500 mb-6" />
                  <p className="text-xl md:text-2xl text-gray-300 mb-6 italic">
                    "{testimonials[activeTestimonial].content}"
                  </p>
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{testimonials[activeTestimonial].avatar}</div>
                    <div>
                      <h4 className="font-semibold">{testimonials[activeTestimonial].name}</h4>
                      <p className="text-gray-400">{testimonials[activeTestimonial].role}</p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Testimonial Dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTestimonial(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === activeTestimonial ? 'w-8 bg-blue-500' : 'bg-gray-600'
                        }`}
                    />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Financial Future?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join 50,000+ users saving money every month - completely free!
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-2xl"
                >
                  Create Your Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <p className="mt-4 text-gray-400">No credit card required • Free forever • Cancel anytime</p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  <span className="ml-2 text-lg font-semibold">ExpenseTracker</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Your free intelligent financial companion for a better tomorrow.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                © 2025 ExpenseTracker. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
  );
};

export default LandingPage;