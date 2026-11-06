import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../context/UserContext';



const ProductDetails = () => {
  const { productId } = useParams(); // Get product ID from the URL
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const navigate = useNavigate();
  const { email, isLoggedIn } = useUser();

  const location = useLocation();
  const [compareList, setCompareList] = useState([]);


  // Fetch product details
  const fetchProductDetails = async () => {
    try {
      const { data } = await authAPI.getProductDetails(productId);
      setProduct(data);

      // Set default selections
      if (data.colors?.length > 0) setSelectedColor(data.colors[0].hex);
      if (data.providers?.length > 0) setSelectedProvider(data.providers[0]);
      if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    }
  };

    // Add to Cart handler
    const handleAddToCart = async () => {

      if (!email) {
        toast.error('You need to log in to add items to the cart.');
        return;
      }

      try {
        await authAPI.addToCart(email, productId, selectedColor, selectedProvider, selectedSize, quantity);
        toast.success('Added to cart successfully!');
      } catch (err) {
        console.error('Failed to add to cart:', err);
        toast.error('Failed to add to cart. Please try again.');
      }
    };

    // Handle product comparison
  const handleCompare = () => {
    let updatedCompareList = [...compareList];

    // Check if product is already in comparison
    if (updatedCompareList.some(item => item.id === product.id)) {
      updatedCompareList = updatedCompareList.filter(item => item.id !== product.id);
    } else {
      updatedCompareList.push(product);
    }

    if (updatedCompareList.length > 3) {
      toast.error("You can compare up to 3 products.");
      return;
    }

    setCompareList(updatedCompareList);
    localStorage.setItem('compareProducts', JSON.stringify(updatedCompareList));
    toast.success("Product added for comparison!");
  };

  useEffect(() => {
    fetchProductDetails();
    const storedCompareList = JSON.parse(localStorage.getItem('compareProducts')) || [];
    setCompareList(storedCompareList);
  }, [productId]);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <ToastContainer />

      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* Back Button */}
        <button
          onClick={() => {
            if (location.state?.previousPath) {
              navigate(location.state.previousPath); // Go to the tracked previous path
            } else {
              navigate('/products'); // Fallback to products page
            }
          }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-violet-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="grid gap-10 md:grid-cols-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {/* Product Image */}
          <div className="relative">
            {/* Favorites Icon */}
            {isLoggedIn && (
              <button
                onClick={async () => {
                  try {
                    await authAPI.addFavorite(email, product.id); // Call the addFavorite API
                    console.log(`Product ${product.id} added to favorites`);
                    toast.success("Added to favorites!");
                  } catch (err) {
                    console.error('Failed to add to favorites:', err);
                    toast.error("Failed to add to favorites.");
                  }
                }}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 text-red-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>
            )}
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div>
            <span className="inline-flex items-center rounded-full bg-violet-50 text-violet-700 text-xs font-semibold uppercase tracking-wide px-3 py-1">
              {product.category} {product.subcategory ? `· ${product.subcategory}` : ''}
            </span>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{product.name}</h1>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-amber-500 tracking-tight">
                {'★'.repeat(Math.floor(product.rating || 0))}
                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </span>
              <span className="text-sm text-gray-500">({product.rating || 'No rating'})</span>
            </div>

            <p className="mt-4 text-3xl font-bold text-gray-900">${product.price}</p>

            {/* Description */}
            <p className="mt-4 text-gray-600 leading-relaxed">
              {product.description || 'No description available'}
            </p>

            <div className="mt-6 h-px bg-gray-100" />

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-800">Color</label>
                <div className="flex gap-2 mt-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      className={`h-8 w-8 rounded-full ring-offset-2 transition ${
                        selectedColor === color.hex ? 'ring-2 ring-violet-600' : 'ring-1 ring-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      onClick={() => setSelectedColor(color.hex)}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-800">Size</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="mt-2 w-full sm:w-48 rounded-lg border-gray-200 text-sm focus:border-violet-500 focus:ring-violet-500"
                >
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Provider Selection */}
            {product.providers?.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-800">Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="mt-2 w-full sm:w-48 rounded-lg border-gray-200 text-sm focus:border-violet-500 focus:ring-violet-500"
                >
                  {product.providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-800">Quantity</label>
              <div className="mt-2 inline-flex items-center rounded-full border border-gray-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-violet-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-violet-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  if (!email) {
                    toast.error("You need to log in to proceed.");
                    return;
                  }

                  // Navigate to Buy Now (Address Selection) Page
                  navigate('/buy-now', {
                    state: {
                      products: [
                        {
                          productId,
                          productName: product.name,
                          quantity,
                          selectedColor,
                          selectedProvider,
                          selectedSize,
                          price: product.price,
                        },
                      ],
                    },
                  });
                }}
                className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black transition-colors shadow-sm"
              >
                Buy It Now
              </button>

              <button
                onClick={handleAddToCart}
                className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
              >
                Add to Cart
              </button>
              <button
                onClick={handleCompare}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors shadow-sm ${
                  compareList.some(item => item.id === product.id)
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {compareList.some(item => item.id === product.id) ? 'Remove from Compare' : 'Compare'}
              </button>
            </div>

            {/* Compare Now Button */}
            {compareList.length >= 2 && (
              <div className="mt-4">
                <button
                  onClick={() => navigate('/compare')}
                  className="rounded-full bg-indigo-50 text-indigo-700 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Compare Now ({compareList.length})
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900">Comments</h2>
          {Array.isArray(product.comments) && product.comments.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {product.comments.map((comment, index) => (
                <li key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-700">
                  {comment}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mt-3">No comments available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
