import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realTimeSales, setRealTimeSales] = useState([]);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    if (socket) {
      socket.on('sale_completed', handleNewSale);
      socket.on('inventory_updated', () => {
        loadDashboardData();
      });
    }

    return () => {
      if (socket) {
        socket.off('sale_completed', handleNewSale);
        socket.off('inventory_updated');
      }
    };
  }, [socket]);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, salesResponse, productsResponse] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/sales-chart'),
        axios.get('/api/dashboard/top-products')
      ]);

      setStats(statsResponse.data);
      setSalesChart(salesResponse.data);
      setTopProducts(productsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = (saleData) => {
    setRealTimeSales(prev => [saleData, ...prev.slice(0, 4)]);
    
    // Refresh dashboard stats
    loadDashboardData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${changeType === 'negative' ? 'rotate-180' : ''}`} />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.full_name} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats?.todaySales?.total || 0)}
          icon={DollarSign}
          color="bg-green-500"
          change="+12.5%"
          changeType="positive"
        />
        <StatCard
          title="Transactions"
          value={stats?.todaySales?.count || 0}
          icon={ShoppingCart}
          color="bg-blue-500"
          change="+8.2%"
          changeType="positive"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts?.count || 0}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers?.count || 0}
          icon={Users}
          color="bg-orange-500"
          change="+15 new"
          changeType="positive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend (30 Days)</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Sales']}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Products (7 Days)</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.total_sold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No sales data available for the last 7 days
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {realTimeSales.length > 0 ? (
              realTimeSales.map((sale, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sale.sale_number}</p>
                      <p className="text-sm text-gray-500">Sale completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(sale.total)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No recent sales activity
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  {stats?.lowStock?.count || 0} Products Low on Stock
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">
                  System Status: Online
                </p>
              </div>
            </div>

            {stats?.lowStock?.count === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    All products well stocked
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Add Product</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Add Customer</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">New Sale</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;