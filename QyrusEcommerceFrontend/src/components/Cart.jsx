import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';
import CheckoutSteps from './CheckoutSteps';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { email } = useUser(); // Assuming email is available in UserContext
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await authAPI.getCart(email);
        setCartItems(data.cart || []); // Correctly access `cart` key
      } catch (err) {
        setError('Failed to fetch cart details');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchCartItems();
    }
  }, [email]);

  const handleRemoveItem = async (cartItemId) => {
    try {
      await authAPI.removeFromCart(email, cartItemId);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.cart_item_id !== cartItemId)
      );
      // Also remove from selected items if present
      setSelectedItems((prevSelected) =>
        prevSelected.filter((item) => item.cart_item_id !== cartItemId)
      );
    } catch (err) {
      setError('Failed to remove item from cart');
    }
  };

  const handleSelectItem = (item) => {
    if (selectedItems.find((selected) => selected.cart_item_id === item.cart_item_id)) {
      // Deselect the item
      setSelectedItems((prevSelected) =>
        prevSelected.filter((selected) => selected.cart_item_id !== item.cart_item_id)
      );
    } else {
      // Select the item
      setSelectedItems((prevSelected) => [...prevSelected, item]);
    }
  };

  const handleCheckout = () => {
    const products = selectedItems.map((item) => ({
      productId: item.product_id,
      productName: item.name,
      quantity: item.quantity,
      selectedColor: item.color,
      selectedProvider: item.provider,
      selectedSize: item.size,
      price: item.price,
    }));

    navigate('/buy-now', { state: { products } });
  };

  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon="🛍️"
        eyebrow="Checkout"
        title="My Cart"
        subtitle="Review your picks, then select items to take to checkout."
      />

      <div className="container mx-auto px-4 md:px-6 py-10">
        <CheckoutSteps current="Cart" />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse p-4">
                <div className="aspect-square bg-gray-200 rounded-xl" />
                <div className="mt-3 h-3.5 bg-gray-200 rounded w-3/4" />
                <div className="mt-2 h-3.5 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-center py-3 px-4">
            {error}
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {cartItems.map((item) => {
                const isSelected = selectedItems.find((selected) => selected.cart_item_id === item.cart_item_id);
                return (
                  <div
                    key={item.cart_item_id}
                    className={`relative bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      isSelected ? 'border-violet-500 ring-2 ring-violet-100' : 'border-gray-100'
                    }`}
                    onClick={() => handleSelectItem(item)}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h2 className="mt-3 font-semibold text-gray-900">{item.name}</h2>
                    <div className="mt-1 text-sm text-gray-500 space-y-0.5">
                      <p>Color: {item.color} · Size: {item.size}</p>
                      <p>Provider: {item.provider} · Qty: {item.quantity}</p>
                    </div>
                    <p className="mt-2 font-bold text-gray-900">₹{item.price}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering selection on button click
                        handleRemoveItem(item.cart_item_id);
                      }}
                      className="mt-3 w-full rounded-full bg-red-50 text-red-600 text-sm font-semibold py-2 hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="h-fit bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Items selected</span>
                <span>{selectedItems.length}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-3">
                <span>Total</span>
                <span>₹{calculateTotalPrice()}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="mt-5 w-full rounded-full bg-violet-600 text-white font-semibold py-3 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            subtitle="Looks like you haven't added anything yet. Let's fix that."
            actionLabel="Continue Shopping"
            onAction={() => navigate('/products')}
          />
        )}
      </div>
    </div>
  );
};

export default Cart;
