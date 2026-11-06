// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Logo from './Logo';


const Header = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); // Check if user is logged in
  const { isLoggedIn, logout } = useUser();

  const [categories, setCategories] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(''); // Track hovered category
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track if the dropdown is open
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [isaccountdropdownopen, setAccountDropdownOpen] = useState(false);


   // Update login status when the component renders or localStorage changes
  //  useEffect(() => {
  //   const checkLoginStatus = () => {
  //     setIsLoggedIn(!!localStorage.getItem('token'));
  //   };

  //   checkLoginStatus();

  //   // Optional: Listen for changes to localStorage if needed
  //   window.addEventListener('storage', checkLoginStatus);
  //   return () => {
  //     window.removeEventListener('storage', checkLoginStatus);
  //   };
  // }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const { data } = await authAPI.getCategories(); // Fetch categories
      setCategories(data.categories || {}); // Set the fetched categories
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    setIsDropdownOpen(false);
    navigate(`/products?category=${category}&subcategory=none`);
  };

  const handleSubcategoryClick = (category, subcategory) => {
    setIsDropdownOpen(false);
    navigate(`/products?category=${category}&subcategory=${subcategory}`);
  };


  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!search.trim()) {
      console.warn('Search query is empty');
      return;
    }

    try {
      const { data } = await authAPI.searchProducts(search);
      // Navigate to the products page with search results
      navigate(`/products?search=${search}`, { state: { products: data.products } });
    } catch (err) {
      console.error('Search failed:', err);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3 md:px-6">
        {/* Logo */}
        <button onClick={() => navigate('/products')} className="shrink-0">
          <Logo size="sm" />
        </button>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="relative flex flex-1 items-center max-w-2xl mx-auto"
        >
          {/* Categories Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={toggleDropdown} // Toggle dropdown visibility
              className="flex items-center gap-1 h-11 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-l-full border border-r-0 border-gray-200 hover:bg-gray-200 transition-colors"
            >
              Categories
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 min-w-[12rem] bg-white text-gray-800 shadow-xl ring-1 ring-black/5 rounded-xl z-50 overflow-hidden animate-fade-in">
                {Object.keys(categories).map((category) => (
                  <div
                    key={category}
                    className="relative group"
                    onMouseEnter={() => setHoveredCategory(category)} // Show subcategories
                    onMouseLeave={() => setHoveredCategory('')} // Hide subcategories
                  >
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors text-left"
                    >
                      {category}
                      {categories[category]?.length > 0 && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-gray-400">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    {hoveredCategory === category && categories[category]?.length > 0 && (
                      <div className="absolute left-full top-0 min-w-[12rem] bg-white text-gray-800 shadow-xl ring-1 ring-black/5 rounded-xl z-10 overflow-hidden">
                        {categories[category].map((subcategory) => (
                          <button
                            key={subcategory}
                            onClick={() => handleSubcategoryClick(category, subcategory)}
                            className="block w-full px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors text-left"
                          >
                            {subcategory}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="h-11 flex-grow border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="flex h-11 items-center justify-center rounded-r-full bg-violet-600 px-5 text-white hover:bg-violet-700 transition-colors"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3-3" />
            </svg>
          </button>
        </form>


        {/* Login Button */}
        <nav className="flex shrink-0 items-center gap-3 md:gap-4">
          <Link
            to="/select-backend"
            className="hidden lg:inline text-xs font-medium text-gray-400 hover:text-violet-600 transition-colors"
          >
            Switch Backend
          </Link>
          {!isLoggedIn ? (
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
            >
              Login
            </button>
          ) : (
            <>
              {/* Cart Icon */}
              <Link
                to="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-violet-600 transition-colors"
                aria-label="Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-violet-600 transition-colors"
                  onClick={() => setAccountDropdownOpen((prev) => !prev)}
                  aria-label="Account menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
                {isaccountdropdownopen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white text-gray-800 shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-fade-in">
                    <ul className="py-1.5">
                      <li>
                        <Link to="/account" className="block px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors">
                          Account
                        </Link>
                      </li>
                      <li>
                        <Link to="/wishlist" className="block px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors">
                          Wishlist
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-orders" className="block px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors">
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <Link to="/contact" className="block px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors">
                          Contact Us
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-address" className="block px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors">
                          My Address
                        </Link>
                      </li>
                      <li className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
