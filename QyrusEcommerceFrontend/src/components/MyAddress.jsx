import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import PageHeader from './PageHeader';

const MyAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [updatedAddress, setUpdatedAddress] = useState("");
  const { email } = useUser();

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
      await authAPI.createAddress(email, newAddress);
      fetchAddresses();
      setNewAddress("");
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to add address.");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await authAPI.deleteAddress(email, addressId);
      fetchAddresses();
    } catch (err) {
      setError("Failed to delete address.");
    }
  };

  const handleUpdateAddress = async () => {
    try {
      await authAPI.updateAddress(email, editingAddressId, updatedAddress);
      fetchAddresses();
      setEditingAddressId(null);
    } catch (err) {
      setError("Failed to update address.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon="🏠"
        eyebrow="Delivery details"
        title="My Addresses"
        subtitle="Manage the addresses we deliver your orders to."
      />

      <div className="container mx-auto px-4 md:px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center py-2 max-w-md mx-auto">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {/* Add New Address Card */}
            <div
              className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-10 hover:border-violet-400 hover:bg-violet-50/40 transition-colors cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-2xl font-bold">
                +
              </span>
              <p className="mt-3 text-sm font-medium text-gray-500">Add Address</p>
            </div>

            {/* Address Cards */}
            {addresses.map((address) => (
              <div
                key={address.address_id}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative p-5"
              >
                {editingAddressId === address.address_id ? (
                  <>
                    <textarea
                      value={updatedAddress}
                      onChange={(e) => setUpdatedAddress(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 mb-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      rows="4"
                    ></textarea>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={handleUpdateAddress}
                        className="rounded-full bg-violet-600 text-white font-semibold px-4 py-2 text-sm hover:bg-violet-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAddressId(null)}
                        className="rounded-full bg-gray-100 text-gray-700 font-semibold px-4 py-2 text-sm hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                        📍
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingAddressId(address.address_id);
                            setUpdatedAddress(address.address);
                          }}
                          className="text-gray-400 hover:text-violet-600 transition-colors"
                          aria-label="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.969 2.97L7.5 19.79l-4 1 1-4L16.862 4.487Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.address_id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                      {address.address}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

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

export default MyAddress;
