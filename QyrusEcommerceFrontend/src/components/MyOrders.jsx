import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';
import { useNavigate } from 'react-router-dom';

const statusStyles = {
  delivered: "bg-green-50 text-green-700",
  shipped: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { email } = useUser();
  const navigate = useNavigate();

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.getOrders(email);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      await authAPI.cancelOrder(orderId, email);
      toast.success("Order canceled successfully!");
      fetchOrders(); // Refresh orders after cancellation
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  useEffect(() => {
    if (email) {
      fetchOrders();
    }
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <PageHeader
        icon="📦"
        eyebrow="Your orders"
        title="My Orders"
        subtitle="Track, review, and manage everything you've bought."
      />

      <div className="container mx-auto px-4 md:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-center py-3 px-4">{error}</div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            subtitle="Once you place an order, it'll show up here so you can track it."
            actionLabel="Start Shopping"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((order) => {
              const statusClass = statusStyles[(order.status || '').toLowerCase()] || 'bg-gray-100 text-gray-700';
              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-900">Order #{order.order_id}</h2>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {order.products.map((product, index) => (
                      <div key={index} className="flex items-center gap-3 py-2.5">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {product.quantity} · ${product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCancelOrder(order.order_id)}
                    className="mt-4 w-full rounded-full bg-red-50 text-red-600 text-sm font-semibold py-2 hover:bg-red-100 transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
