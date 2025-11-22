import React, { createContext, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, socket }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (socket && user) {
      // Join user-specific room
      socket.emit('user_connected', { user_id: user.id, role: user.role });

      // Handle real-time events
      socket.on('sale_completed', (data) => {
        toast.success(`Sale completed: ${data.sale_number} - $${data.total.toFixed(2)}`);
      });

      socket.on('inventory_updated', (data) => {
        toast.success('Inventory updated');
      });

      socket.on('low_stock_alert', (data) => {
        toast.error(`Low stock alert: ${data.product_name} (${data.stock_quantity} left)`);
      });

      // POS-specific events
      if (user.role === 'cashier') {
        socket.emit('pos_connected', { user_id: user.id });
      }

      return () => {
        socket.off('sale_completed');
        socket.off('inventory_updated');
        socket.off('low_stock_alert');
      };
    }
  }, [socket, user]);

  const emitEvent = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    emitEvent
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};