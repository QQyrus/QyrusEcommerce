import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import PageHeader from './PageHeader';
import CheckoutSteps from './CheckoutSteps';

const inputClass =
  "block w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 mb-3";

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [upiId, setUpiId] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = useUser();

  const { addressId, products } = location.state || {};
  const total = (products || []).reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (paymentMethod === "UPI" && !upiId) {
      alert("Please enter your UPI ID.");
      return;
    }

    if ((paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      alert("Please fill all card details.");
      return;
    }

    try {
      // Mock Create Order API Call
      const orderData = {
        email: email, // Replace with user's email
        addressId,
        products,
        paymentMethod,
      };

      await authAPI.createOrder(orderData);

      // Redirect to "My Orders" page after successful order creation
      navigate("/my-orders");
    } catch (err) {
      alert("Failed to place order. Please try again.");
    }
  };

  const methodIcons = {
    "Credit Card": "💳",
    "Debit Card": "💳",
    UPI: "📱",
    "Net Banking": "🏦",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon="💳"
        eyebrow="Checkout"
        title="Payment"
        subtitle="Pick a payment method to complete your order."
      />

      <div className="container mx-auto px-4 md:px-6 py-10">
        <CheckoutSteps current="Payment" />

        <div className="max-w-2xl mx-auto grid md:grid-cols-[1fr_240px] gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</h2>
            <div className="space-y-2">
              {["Credit Card", "Debit Card", "UPI", "Net Banking"].map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === method ? 'border-violet-500 bg-violet-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm">{methodIcons[method]}</span>
                  <span className="text-sm text-gray-800">{method}</span>
                </label>
              ))}
            </div>

            {/* Conditional Input for Payment Details */}
            {paymentMethod === "Credit Card" || paymentMethod === "Debit Card" ? (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Enter Card Details</h3>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Expiry Date (MM/YY)"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  className={inputClass}
                />
              </div>
            ) : paymentMethod === "UPI" ? (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Enter UPI ID</h3>
                <input
                  type="text"
                  placeholder="UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className={inputClass}
                />
              </div>
            ) : null}

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-full bg-gray-100 text-gray-700 font-semibold px-6 py-3 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="rounded-full bg-violet-600 text-white font-semibold px-6 py-3 hover:bg-violet-700 transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="h-fit bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-600 max-h-48 overflow-y-auto">
              {(products || []).map((p, i) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate pr-2">{p.productName}</span>
                  <span className="shrink-0">${p.price}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
