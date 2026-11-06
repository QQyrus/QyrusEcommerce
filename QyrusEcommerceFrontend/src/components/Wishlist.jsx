import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

const Wishlist = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { email } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Fetch product IDs from getFavorites
        const { data } = await authAPI.getFavorites(email);
        // data.favorites is an array of product IDs

        // 2. Fetch product details for each ID
        const productDetailsPromises = data.favorites.map((productId) =>
          authAPI.getProductDetails(productId)
        );
        const products = await Promise.all(productDetailsPromises);

        // 3. Store the products in local state
        setFavorites(products.map((response) => response.data));
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setError("Failed to fetch wishlist.");
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchFavorites();
    }
  }, [email]);

  // Remove item from favorites
  const handleRemoveFavorite = async (productId) => {
    setError("");
    try {
      await authAPI.removeFavorite(email, productId);
      // Filter out the removed product from local state
      setFavorites((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      console.error("Failed to remove product from favorites:", err);
      setError("Failed to remove product from favorites.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon="❤️"
        eyebrow="Saved for later"
        title="My Wishlist"
        subtitle="Everything you've favorited, all in one place."
      />

      <div className="container mx-auto px-4 md:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-center py-3 px-4">{error}</div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() =>
                      navigate(`/product/${product.id}`, {
                        state: { previousPath: "/wishlist" },
                      })
                    }
                  />
                </div>
                <div className="p-3.5">
                  <h2 className="font-semibold text-sm text-gray-800 truncate">{product.name}</h2>
                  <p className="mt-1 font-bold text-gray-900">${product.price}</p>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveFavorite(product.id)}
                    className="mt-2 w-full rounded-full bg-red-50 text-red-600 text-sm font-semibold py-2 hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="💔"
            title="Your wishlist is empty"
            subtitle="Tap the heart icon on any product to save it here for later."
            actionLabel="Browse Products"
            onAction={() => navigate('/products')}
          />
        )}
      </div>
    </div>
  );
};

export default Wishlist;
