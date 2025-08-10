'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Radio, 
  Users, 
  Activity, 
  Lock, 
  Zap, 
  Globe,
  ChevronRight,
  Menu,
  X,
  Check,
  Star
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const features = [
    {
      icon: Shield,
      title: 'Advanced CAD System',
      description: 'Professional-grade computer-aided dispatch with real-time unit tracking and call management.',
    },
    {
      icon: Radio,
      title: 'Mobile Data Terminal',
      description: 'Full-featured MDT for officers in the field with citizen records, vehicle lookups, and more.',
    },
    {
      icon: Users,
      title: 'Multi-Community Support',
      description: 'Host multiple roleplay communities on a single platform with isolated data and settings.',
    },
    {
      icon: Activity,
      title: 'Real-Time Updates',
      description: 'WebSocket-powered live updates ensure all units see changes instantly.',
    },
    {
      icon: Lock,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with encrypted data and role-based access control.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for performance with instant response times and minimal latency.',
    },
  ];

  const plans = [
    {
      name: 'Basic',
      price: '$19.99',
      period: '/month',
      features: [
        '10 Users',
        '20 Units',
        '500 Calls/month',
        'Basic Support',
        'Core Features',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$49.99',
      period: '/month',
      features: [
        '50 Users',
        '100 Units',
        '5,000 Calls/month',
        'Priority Support',
        'Custom Fields',
        'Webhooks',
        'Advanced Analytics',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: '$149.99',
      period: '/month',
      features: [
        'Unlimited Users',
        'Unlimited Units',
        'Unlimited Calls',
        'Dedicated Support',
        'All Features',
        'API Access',
        'Custom Integrations',
        'White Label Options',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Shield className="h-8 w-8 text-blue-500" />
                  StarfireCAD
                </h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                    Features
                  </a>
                  <a href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                    Pricing
                  </a>
                  <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                    About
                  </a>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 gap-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Pricing
              </a>
              <a href="#about" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                About
              </a>
              <Link href="/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Next Generation
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Computer Aided Dispatch
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Professional CAD/MDT system designed for FiveM roleplay communities. 
            Fast, reliable, and feature-rich.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push('/demo')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold text-lg transition backdrop-blur-lg border border-white/20"
            >
              View Demo
            </button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span>50+ Communities</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Powerful Features</h3>
            <p className="text-xl text-gray-300">Everything you need for professional emergency roleplay</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl backdrop-blur-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <feature.icon className="h-12 w-12 text-blue-500 mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h3>
            <p className="text-xl text-gray-300">Choose the plan that fits your community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl backdrop-blur-lg border transition ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500 scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="flex items-center gap-2 text-yellow-400 mb-4">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="text-sm font-semibold">MOST POPULAR</span>
                  </div>
                )}
                <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/register')}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.highlighted
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Community?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of roleplay communities using StarfireCAD
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition transform hover:scale-105"
          >
            Start Your Free Trial Today
          </button>
          <p className="mt-4 text-gray-400">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-white font-semibold mb-4">StarfireCAD</h5>
              <p className="text-gray-400 text-sm">
                Professional CAD/MDT system for FiveM roleplay communities.
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>&copy; 2024 StarfireCAD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}