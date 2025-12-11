import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('Men'); // Default category
  const [subcategory, setSubcategory] = useState('none'); // Default subcategory
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const { email, isLoggedIn } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

    // Fetch products based on search query
    const fetchSearchResults = async (query) => {
      setLoading(true);
      setError('');
      try {
        const { data } = await authAPI.searchProducts(query);
        setProducts(data.products || []);
        setTotalPages(1); // Search results usually don't require pagination
      } catch (err) {
        setError('Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };
  


  // Fetch products from the API
  const fetchProducts = async (selectedCategory, selectedSubcategory) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.getProducts(selectedCategory, selectedSubcategory, page);
      setProducts(data.products || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Extract query parameters from the URL
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      category: params.get('category') || 'Men',
      subcategory: params.get('subcategory'),
      search: params.get('search'),
    };
  };

  // Handle changes in URL query parameters
  useEffect(() => {
    const { category: queryCategory, subcategory: querySubcategory, search: querySearch } = getQueryParams();

    if (querySearch) {
      // Handle search query
      setSearchQuery(querySearch);
      fetchSearchResults(querySearch);
    } else {
      // Handle category and subcategory
      const categoryToFetch = queryCategory || 'Men';
      const subcategoryToFetch = querySubcategory || 'none';
      setCategory(categoryToFetch);
      setSubcategory(subcategoryToFetch);
      fetchProducts(categoryToFetch, subcategoryToFetch);
    }
  }, [location.search, page]);




  return (
    <div className="container mx-auto p-6">
      {/* Toast Notifications */}
      <ToastContainer />
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {loading ? (
        <div className="text-center">Loading products...</div>
      ) : (
        <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative bg-white p-4 rounded-lg shadow hover:shadow-lg transition z-10"
            >
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
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>

                </button>
              )}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded cursor-pointer"
                onClick={() =>
                  navigate(`/product/${product.id}`, {
                    state: { previousPath: location.pathname + location.search },
                  })
                }
              />
              <h3 className="mt-4 font-bold text-lg">{product.name}</h3>
              <p className="text-gray-700">${product.price}</p>
              {/* {isLoggedIn && (
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => console.log('Adding to cart:', product)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => console.log('Buying now:', product)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Buy Now
                  </button>
                </div>
              )} */}
            </div>
          ))}
        </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
