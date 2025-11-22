import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Monitor, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  ShoppingCart,
  BarChart3,
  Users,
  Package
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        toast.success(`Welcome back, ${result.user.full_name}!`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Features */}
        <div className="space-y-8 hidden lg:block">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="bg-blue-600 p-3 rounded-xl mr-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">POS Enterprise</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Complete Point of Sale & Business Management System
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Monitor className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Modern Interface</h3>
              <p className="text-gray-600 text-sm">Intuitive design for efficient operations</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <BarChart3 className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600 text-sm">Monitor sales and performance instantly</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Package className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Inventory Management</h3>
              <p className="text-gray-600 text-sm">Track stock levels and automate reorders</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Users className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multi-user Support</h3>
              <p className="text-gray-600 text-sm">Role-based access for your team</p>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Account</h3>
            <p className="text-blue-700 text-sm mb-3">Try the system with our demo credentials:</p>
            <div className="space-y-1 text-sm font-mono">
              <div className="text-blue-800">Username: <span className="font-semibold">admin</span></div>
              <div className="text-blue-800">Password: <span className="font-semibold">admin123</span></div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="text-center mb-8">
              <div className="bg-blue-600 p-3 rounded-xl inline-flex mb-4 lg:hidden">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <div className="text-sm text-gray-600">
                <span>System Status: </span>
                <span className="inline-flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Demo Info */}
          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-200 lg:hidden">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Account</h3>
            <div className="text-sm font-mono space-y-1">
              <div className="text-blue-800">Username: admin</div>
              <div className="text-blue-800">Password: admin123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;