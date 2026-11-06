import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';

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

  const rowLabelClass = "p-4 font-semibold text-sm text-gray-700 bg-gray-50/60";

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <PageHeader
        icon="⚖️"
        eyebrow="Side by side"
        title="Compare Products"
        subtitle="Line up the details and pick the one that wins."
      />

      <div className="container mx-auto px-4 md:px-6 py-10">
        {compareProducts.length === 0 ? (
          <EmptyState
            icon="⚖️"
            title="Nothing to compare yet"
            subtitle="Add up to 3 products from any product page to compare them side by side."
            actionLabel="Browse Products"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="p-4"></th>
                  {compareProducts.map((product) => (
                    <th key={product.id} className="p-4 text-center">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
                      >
                        Remove ✕
                      </button>
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className={rowLabelClass}>Product</th>
                  {compareProducts.map((product) => (
                    <th key={product.id} className="p-4 text-center">
                      <div className="h-28 w-28 mx-auto overflow-hidden rounded-xl bg-gray-100">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <p className="font-semibold text-sm text-gray-900 mt-2">{product.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className={rowLabelClass}>Price</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center font-bold text-gray-900">
                      ${product.price}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={rowLabelClass}>Category</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm text-gray-600">
                      {product.category}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={rowLabelClass}>Description</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm text-gray-500">
                      {product.description || "No description available"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={rowLabelClass}>Rating</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center text-amber-500">
                      {'★'.repeat(Math.floor(product.rating || 0)) + '☆'.repeat(5 - Math.floor(product.rating || 0))}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={rowLabelClass}>Colors Available</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {product.colors?.map((color) => (
                          <div key={color.hex} className="w-6 h-6 rounded-full ring-1 ring-gray-200" style={{ backgroundColor: color.hex }}></div>
                        )) || <span className="text-sm text-gray-400">N/A</span>}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={rowLabelClass}>Sizes Available</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm text-gray-600">
                      {product.sizes?.join(", ") || "N/A"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={rowLabelClass}>Providers</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm text-gray-600">
                      {product.providers?.join(", ") || "N/A"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={() => navigate('/products')}
            className="rounded-full bg-gray-100 text-gray-700 font-semibold px-6 py-2.5 hover:bg-gray-200 transition-colors"
          >
            Back to Products
          </button>

          {compareProducts.length > 0 && (
            <button
              onClick={clearComparison}
              className="rounded-full bg-red-50 text-red-600 font-semibold px-6 py-2.5 hover:bg-red-100 transition-colors"
            >
              Clear Comparison
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
