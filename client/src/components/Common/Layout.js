import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: location.pathname === '/dashboard' },
    { name: 'POS System', href: '/pos', icon: ShoppingCart, current: location.pathname === '/pos' },
    { name: 'Products', href: '/products', icon: Package, current: location.pathname === '/products' },
    { name: 'Customers', href: '/customers', icon: Users, current: location.pathname === '/customers' },
    { name: 'Sales', href: '/sales', icon: BarChart3, current: location.pathname === '/sales' },
  ];

  // Add admin navigation for admin users
  if (user?.role === 'admin') {
    navigation.push(
      { name: 'Admin Panel', href: '/admin', icon: Settings, current: location.pathname === '/admin' }
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const NavItem = ({ item }) => (
    <Link
      to={item.href}
      onClick={() => setSidebarOpen(false)}
      className={`${
        item.current
          ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
      } group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-colors`}
    >
      <item.icon
        className={`${
          item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
        } mr-3 flex-shrink-0 h-5 w-5`}
      />
      {item.name}
    </Link>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">POS Enterprise</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center mr-3">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, customers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* User dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;