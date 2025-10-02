import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { Card, CardContent } from '../components/ui/Card.jsx'
import { 
  Scissors, 
  Users, 
  Clock, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

function LandingPage() {
  const features = [
    {
      icon: <Scissors className="w-8 h-8 text-blue-600" />,
      title: 'Expert Tailors',
      description: 'Connect with skilled artisans who specialize in custom clothing'
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: 'Quick Turnaround',
      description: 'Get accurate estimates and fast delivery for your custom orders'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with Razorpay integration'
    },
    {
      icon: <Star className="w-8 h-8 text-blue-600" />,
      title: 'Quality Guaranteed',
      description: 'Review system ensures high-quality work from verified tailors'
    }
  ]

  const benefits = [
    'Upload measurements and design preferences',
    'Browse portfolios of expert tailors',
    'Get instant estimates and delivery times',
    'Secure payment processing',
    'Track your order progress',
    'Rate and review your experience'
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">WearMade</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Custom Tailoring
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {' '}Made Simple
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Connect with skilled tailors, get custom clothing made to your exact 
                measurements, all from the comfort of your home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Your Order
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/explore">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Browse Tailors
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose WearMade?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We revolutionize custom tailoring by connecting you with expert artisans 
              through our seamless digital platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="slide-up">
                <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How WearMade Works
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/register">
                  <Button size="lg">
                    Get Started Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Create Your Order</h4>
                    <p className="text-gray-600 text-sm">Upload measurements and design preferences</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Receive Estimates</h4>
                    <p className="text-gray-600 text-sm">Tailors submit quotes with delivery times</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pay & Track</h4>
                    <p className="text-gray-600 text-sm">Secure payment and order tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Perfect Outfit?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who found their perfect tailor on WearMade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=customer">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Order Custom Clothing
              </Button>
            </Link>
            <Link to="/register?role=tailor">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Join as Tailor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">WearMade</span>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2025 WearMade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage