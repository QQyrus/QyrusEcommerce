import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useUser } from '../context/UserContext';
import PageHeader from './PageHeader';

const fieldInputClass =
  "p-2.5 border border-gray-200 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

const AccountPage = () => {
  const [accountDetails, setAccountDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    country: "",
  });
  const [countries] = useState(["India", "USA", "Canada", "UK", "Australia"]); // Add more countries as needed
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoggedIn, email, logout } = useUser();

  // Fetch account details
  const fetchAccountDetails = async () => {
    try {
      const { data } = await authAPI.getAccountDetails(email);
      setAccountDetails(data);
      setFormData({
        name: data.name,
        age: data.age,
        phone: data.phone,
        country: data.country,
      });
    } catch (err) {
      setError("Failed to fetch account details");
    }
  };

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      await authAPI.updateAccountDetails(email, formData);
      setAccountDetails(formData); // Update UI with new details
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      setError("Failed to update account details");
    } finally {
      setLoading(false);
    }
  };

  const initials = (accountDetails?.name || email || '?').trim().charAt(0).toUpperCase();

  const Field = ({ label, name, type = "text" }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {isEditing ? (
        name === "country" ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className={fieldInputClass}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className={fieldInputClass}
          />
        )
      ) : (
        <p className="text-gray-900 py-2">{accountDetails?.[name] || '—'}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader icon="👤" eyebrow="Your profile" title="Account Details" subtitle={email} />

      <div className="container mx-auto px-4 md:px-6 py-10 max-w-2xl">
        {!accountDetails ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xl font-bold shadow-sm">
                  {initials}
                </span>
                <div>
                  <p className="font-bold text-gray-900">{accountDetails.name || 'Your Account'}</p>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 hover:bg-gray-200 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center py-2">
                {error}
              </div>
            )}

            <div className="space-y-5 divide-y divide-gray-100">
              <Field label="Name" name="name" />
              <div className="pt-5">
                <Field label="Age" name="age" type="number" />
              </div>
              <div className="pt-5">
                <Field label="Phone" name="phone" />
              </div>
              <div className="pt-5">
                <Field label="Country" name="country" />
              </div>

              {/* Save and Cancel Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-5">
                  <button
                    onClick={handleUpdate}
                    className="rounded-full bg-violet-600 text-white font-semibold px-5 py-2.5 hover:bg-violet-700 disabled:opacity-60 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-full bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

};

export default AccountPage;
