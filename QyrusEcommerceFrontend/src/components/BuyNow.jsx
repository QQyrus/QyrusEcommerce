import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from './PageHeader';
import CheckoutSteps from './CheckoutSteps';


const AddressSelection = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { email } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const { products } = location.state || {};

  const handleNext = () => {
    if (!selectedAddressId) {
      alert("Please select an address!");
      return;
    }

    // Proceed to the order confirmation or payment page
    navigate('/payment', {
      state: {
        addressId: selectedAddressId,
        products,
      },
    });
  };

  const fetchAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.getAddresses(email);
      setAddresses(data.addresses || []);
    } catch (err) {
      setError("Failed to fetch addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchAddresses();
    }
  }, [email]);

  const handleAddAddress = async () => {
    try {
      const { data } = await authAPI.createAddress(email, newAddress);
      fetchAddresses();
      setSelectedAddressId(data.address_id); // Automatically select the newly added address
      setNewAddress("");
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to add address.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon="📍"
        eyebrow="Checkout"
        title="Select a delivery address"
        subtitle="Choose where you'd like your order delivered."
      />

      <div className="container mx-auto px-4 md:px-6 py-10 max-w-2xl">
        <CheckoutSteps current="Address" />

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading addresses...</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <label
                key={address.address_id}
                className={`flex items-center gap-4 p-4 rounded-xl border bg-white cursor-pointer transition-all ${
                  selectedAddressId === address.address_id
                    ? 'border-violet-500 ring-2 ring-violet-100'
                    : 'border-gray-100 hover:border-gray-200 shadow-sm'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address.address_id}
                  checked={selectedAddressId === address.address_id}
                  onChange={() => setSelectedAddressId(address.address_id)}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                />
                <p className="text-gray-700 text-sm whitespace-pre-line">{address.address}</p>
              </label>
            ))}

            <button
              onClick={() => setIsModalOpen(true)}
              className="block w-full p-4 rounded-xl border-2 border-dashed border-gray-200 text-center text-sm font-medium text-violet-600 hover:bg-violet-50 hover:border-violet-300 transition-colors"
            >
              + Add New Address
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full bg-gray-100 text-gray-700 font-semibold px-6 py-3 hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            disabled={!selectedAddressId}
            onClick={handleNext}
            className="rounded-full bg-violet-600 text-white font-semibold px-6 py-3 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Payment
          </button>
        </div>

        {/* Add Address Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Add New Address</h2>
              <textarea
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 mb-4 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                rows="4"
                placeholder="Enter your new address here..."
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleAddAddress}
                  className="rounded-full bg-violet-600 text-white font-semibold px-5 py-2 text-sm hover:bg-violet-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-gray-100 text-gray-700 font-semibold px-5 py-2 text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSelection;
