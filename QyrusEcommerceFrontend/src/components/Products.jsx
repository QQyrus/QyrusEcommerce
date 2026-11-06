import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Purely decorative — no real campaigns/offers behind these, just for visual flavor.
const PERKS = [
  { icon: '🚚', title: 'Free Shipping', subtitle: 'On orders over $50' },
  { icon: '↩️', title: 'Easy Returns', subtitle: '30-day return window' },
  { icon: '🔒', title: 'Secure Payments', subtitle: '100% protected checkout' },
  { icon: '🎧', title: '24/7 Support', subtitle: "We're here to help" },
];

const SIDE_BANNERS = [
  {
    gradient: 'from-amber-500 to-orange-600',
    eyebrow: 'Limited time',
    title: 'Flat 40% Off',
    subtitle: 'On select accessories',
    emoji: '⚡',
  },
  {
    gradient: 'from-emerald-500 to-teal-600',
    eyebrow: 'Just dropped',
    title: 'New Season Arrivals',
    subtitle: 'Fresh styles every week',
    emoji: '🌿',
  },
];

// Deterministic "fake" discount so some product cards show a sale badge, purely for look & feel.
const getFakeDiscount = (id) => {
  const n = Number(id) || 0;
  if (n % 3 !== 0) return 0;
  const options = [10, 20, 30, 40];
  return options[n % options.length];
};

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
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Hero banner (decorative) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600">
        <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="container relative mx-auto px-4 md:px-6 py-12 md:py-16">
          <p className="text-violet-200 text-sm font-semibold uppercase tracking-wide">
            {searchQuery ? 'Search results' : category}
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-xl">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : subcategory && subcategory !== 'none'
              ? `${category} / ${subcategory}`
              : `End of season sale — up to 40% off ${category.toLowerCase()}'s styles`}
          </h1>
          <p className="mt-3 text-violet-100 max-w-lg">
            {searchQuery
              ? 'Here is what we found for you.'
              : 'Fresh drops added weekly. Shop the look, grab the deal.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => window.scrollTo({ top: 480, behavior: 'smooth' })}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-violet-700 font-semibold px-6 py-2.5 shadow-sm hover:bg-violet-50 transition-colors"
            >
              Shop Now
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L11.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 1 1-1.04-1.08l3.158-2.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Trust / perk strip (decorative) */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-center gap-3">
              <span className="text-2xl">{perk.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{perk.title}</p>
                <p className="text-xs text-gray-500">{perk.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 text-red-600 text-center py-3 px-4">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_260px] gap-8">
          <div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                No products found. Try a different category or search term.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {products.map((product) => {
                  const discount = getFakeDiscount(product.id);
                  const originalPrice = discount
                    ? (product.price / (1 - discount / 100)).toFixed(2)
                    : null;
                  return (
                    <div
                      key={product.id}
                      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {discount > 0 && (
                        <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 shadow-sm">
                          {discount}% OFF
                        </span>
                      )}
                      {isLoggedIn && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await authAPI.addFavorite(email, product.id); // Call the addFavorite API
                              console.log(`Product ${product.id} added to favorites`);
                              toast.success("Added to favorites!");
                            } catch (err) {
                              console.error('Failed to add to favorites:', err);
                              toast.error("Failed to add to favorites.");
                            }
                          }}
                          className="absolute top-2.5 right-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white hover:text-red-500 transition-colors"
                          aria-label="Add to favorites"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                        </button>
                      )}
                      <div
                        className="aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                        onClick={() =>
                          navigate(`/product/${product.id}`, {
                            state: { previousPath: location.pathname + location.search },
                          })
                        }
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3.5">
                        <h3 className="font-semibold text-sm text-gray-800 truncate">{product.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="font-bold text-gray-900">${product.price}</p>
                          {originalPrice && (
                            <p className="text-xs text-gray-400 line-through">${originalPrice}</p>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-amber-500 text-xs">
                          <span>★★★★☆</span>
                          <span className="text-gray-400">(4.2)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-violet-300 hover:text-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-violet-300 hover:text-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right-side promo banners (decorative) */}
          <aside className="hidden lg:block space-y-5 sticky top-20 self-start">
            {SIDE_BANNERS.map((banner) => (
              <div
                key={banner.title}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.gradient} p-6 text-white shadow-sm`}
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
                <span className="text-3xl">{banner.emoji}</span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">
                  {banner.eyebrow}
                </p>
                <p className="mt-1 text-xl font-extrabold tracking-tight">{banner.title}</p>
                <p className="mt-1 text-sm text-white/80">{banner.subtitle}</p>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Products;
