import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ComparePage = () => {
  const [compareProducts, setCompareProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCompareList = JSON.parse(localStorage.getItem('compareProducts')) || [];
    setCompareProducts(storedCompareList);
  }, []);

  // Fetch product details if any are missing
  useEffect(() => {
    const fetchProductDetails = async () => {
      const updatedProducts = await Promise.all(
        compareProducts.map(async (product) => {
          if (!product.description || !product.price) {
            try {
              const { data } = await authAPI.getProductDetails(product.id);
              return { ...data, id: product.id }; // Merge with existing data
            } catch (err) {
              console.error(`Failed to fetch product ${product.id}:`, err);
              return product;
            }
          }
          return product;
        })
      );
      setCompareProducts(updatedProducts);
      localStorage.setItem('compareProducts', JSON.stringify(updatedProducts));
    };

    if (compareProducts.length > 0) {
      fetchProductDetails();
    }
  }, [compareProducts]);

  // Remove a product from comparison
  const removeProduct = (productId) => {
    const updatedProducts = compareProducts.filter((product) => product.id !== productId);
    setCompareProducts(updatedProducts);
    localStorage.setItem('compareProducts', JSON.stringify(updatedProducts));
    toast.info("Product removed from comparison.");
  };

  // Clear all compared products
  const clearComparison = () => {
    setCompareProducts([]);
    localStorage.removeItem('compareProducts');
    toast.success("Comparison list cleared.");
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />

      <h1 className="text-3xl font-bold text-center mb-6">Compare Products</h1>

      {compareProducts.length === 0 ? (
        <p className="text-center text-gray-500">No products selected for comparison.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4"></th>
                {compareProducts.map((product) => (
                  <th key={product.id} className="p-4 text-center">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove ❌
                    </button>
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-100">
                <th className="p-4">Product</th>
                {compareProducts.map((product) => (
                  <th key={product.id} className="p-4 text-center">
                    <img src={product.image} alt={product.name} className="w-32 h-32 object-cover mx-auto" />
                    <p className="font-bold mt-2">{product.name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 font-semibold">Price</td>
                {compareProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    ${product.price}
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-100">
                <td className="p-4 font-semibold">Category</td>
                {compareProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.category}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold">Description</td>
                {compareProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center text-sm text-gray-600">
                    {product.description || "No description available"}
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-100">
                <td className="p-4 font-semibold">Rating</td>
                {compareProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {'★'.repeat(Math.floor(product.rating || 0)) + '☆'.repeat(5 - Math.floor(product.rating || 0))}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold">Colors Available</td>
                {compareProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="flex justify-center space-x-2">
                      {product.colors?.map((color) => (
                        <div key={color.hex} className="w-6 h-6 rounded-full border" style={{ backgroundColor: color.hex }}></div>
                      )) || "N/A"}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-100">
                <td className="p-4 font-semibold">Sizes Available</td>
                {compareProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.sizes?.join(", ") || "N/A"}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold">Providers</td>
                {compareProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.providers?.join(", ") || "N/A"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Products
        </button>

        {compareProducts.length > 0 && (
          <button
            onClick={clearComparison}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Comparison
          </button>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
