import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  DollarSign,
  User,
  Package,
  Calculator,
  Receipt,
  Clock
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';

const POSSystem = () => {
  const { emitEvent } = useSocket();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [taxRate] = useState(0.08); // 8% tax
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        toast.error('Insufficient stock');
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        barcode: product.barcode
      }]);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock_quantity) {
      toast.error('Insufficient stock');
      return;
    }

    setCart(cart.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setProcessingPayment(true);

    try {
      const { total } = calculateTotals();
      
      const saleData = {
        customer_id: selectedCustomer?.id,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        payment_method: paymentMethod,
        tax_amount: total - cart.reduce((sum, item) => sum + item.total, 0)
      };

      const response = await axios.post('/api/sales', saleData);
      
      // Emit real-time sale completion
      emitEvent('sale_completed', {
        sale_id: response.data.sale_id,
        sale_number: response.data.sale_number,
        total: response.data.total
      });

      toast.success(`Sale completed! Receipt: ${response.data.sale_number}`);
      
      // Print receipt (you would implement actual printing here)
      printReceipt(response.data.sale_number);
      
      // Clear cart
      clearCart();
      
      // Refresh products to get updated stock
      loadProducts();
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const printReceipt = (saleNumber) => {
    // In a real implementation, this would send to a receipt printer
    console.log('Printing receipt for sale:', saleNumber);
    
    // For demo purposes, show receipt in modal
    alert(`Receipt would be printed for sale: ${saleNumber}\n\nIn a real system, this would connect to a receipt printer.`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen overflow-hidden">
      
      {/* Products Panel */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Products</h2>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{products.length} items</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Package className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Stock: {product.stock_quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({cart.length})
            </h2>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>Cart is empty</p>
              <p className="text-sm mt-1">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="text-right ml-3">
                    <p className="font-medium text-gray-900 text-sm">
                      {formatCurrency(item.total)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Selection */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Customer</span>
              <button
                onClick={() => setShowCustomerModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {selectedCustomer ? 'Change' : 'Add Customer'}
              </button>
            </div>
            
            {selectedCustomer ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-600 mr-2" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedCustomer.name}</p>
                    {selectedCustomer.phone && (
                      <p className="text-sm text-blue-700">{selectedCustomer.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No customer selected</p>
            )}
          </div>
        )}

        {/* Totals */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 border rounded-lg flex items-center justify-center ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="text-sm">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 border rounded-lg flex items-center justify-center ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span className="text-sm">Card</span>
                </button>
              </div>
            </div>

            {/* Process Payment Button */}
            <button
              onClick={processPayment}
              disabled={processingPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              {processingPayment ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  Complete Sale ({formatCurrency(total)})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Customer</h3>
            
            <div className="max-h-64 overflow-y-auto mb-4">
              {customers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowCustomerModal(false);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 border rounded-lg mb-2"
                >
                  <div className="font-medium">{customer.name}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-600">{customer.phone}</div>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowCustomerModal(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSystem;