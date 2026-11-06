import React, { useState } from "react";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";
import PageHeader from './PageHeader';

const ContactUs = () => {
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { email } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authAPI.recordContact(email, comments);
      setSuccess("Thank you for your feedback! We will get back to you soon.");
      setComments(""); // Clear the comments field after successful submission
    } catch (err) {
      setError("Failed to submit your comments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon="✉️"
        eyebrow="We're listening"
        title="Contact Us"
        subtitle="Questions, feedback, or just want to say hi? Drop us a note."
      />

      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="max-w-3xl mx-auto grid md:grid-cols-[1fr_200px] gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm py-2 px-3">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm py-2 px-3">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="comments" className="block text-sm font-semibold text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="6"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                  placeholder="Write your comments here..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-violet-600 text-white font-semibold px-6 py-2.5 hover:bg-violet-700 disabled:opacity-60 transition-colors"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-2xl">⏱️</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">Fast response</p>
              <p className="text-xs text-gray-500">We typically reply within 24 hours.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-2xl">💬</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">We read everything</p>
              <p className="text-xs text-gray-500">Every message reaches a real person.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
