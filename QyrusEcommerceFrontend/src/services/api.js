// src/services/api.js
import axios from 'axios';

// Each backend's URL already points at its context path behind the gateway
// (e.g. `${GATEWAY_URL}/java`), baked in at Docker build time.
const GATEWAY_TOKEN = import.meta.env.VITE_GATEWAY_TOKEN;

// The gateway secret may or may not already include the "Bearer " prefix.
const GATEWAY_AUTH_HEADER = GATEWAY_TOKEN
  ? (GATEWAY_TOKEN.startsWith('Bearer ') ? GATEWAY_TOKEN : `Bearer ${GATEWAY_TOKEN}`)
  : undefined;

// Each backend implements the same REST contract; the user picks which one
// the UI talks to on the "/select-backend" page.
export const BACKENDS = {
  java: {
    label: 'Java (Spring Boot)',
    url: import.meta.env.VITE_JAVA_API_URL || 'http://localhost:9893',
  },
  csharp: {
    label: 'C# (.NET)',
    url: import.meta.env.VITE_CSHARP_API_URL || 'http://localhost:9892',
  },
  python: {
    label: 'Python (FastAPI)',
    url: import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:9891',
  },
};

const BACKEND_STORAGE_KEY = 'selectedBackend';

export const getSelectedBackend = () => localStorage.getItem(BACKEND_STORAGE_KEY);

export const setSelectedBackend = (key) => {
  if (!BACKENDS[key]) throw new Error(`Unknown backend: ${key}`);
  localStorage.setItem(BACKEND_STORAGE_KEY, key);
  api.defaults.baseURL = BACKENDS[key].url;
};

const initialBackend = getSelectedBackend();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BACKENDS[initialBackend]?.url || BACKENDS.java.url,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Authorization carries the gateway token so requests can pass through the
// gateway to reach the backends. The per-user token (set after login/signup)
// isn't read by any backend today, but is still forwarded in a custom header
// in case that changes.
api.interceptors.request.use((config) => {
  if (GATEWAY_AUTH_HEADER) {
    config.headers.Authorization = GATEWAY_AUTH_HEADER;
  }

  const userToken = localStorage.getItem('token');
  if (userToken) {
    config.headers['X-User-Token'] = userToken;
  }

  return config;
});

export const authAPI = {
  login: (email, password) => {
    return api.post('/auth/login/', { email, password });
  },

  signup: (email, password) => {
    return api.post('/auth/signup/', { email, password });
  },

  verifyEmail: (otp, token) => {
    return api.post('/auth/verify-email/', { otp, token });
  },

  forgotPassword: (email) => {
    return api.post('/auth/forgot-password/', { email });
  },

  resetPassword: (newPassword, otp, token) => {
    return api.post('/auth/reset-password/', { 
      password: newPassword, 
      otp, 
      token 
    });
  },

  // Get products by category and page
  getProducts: (category, subcategory, page) => {
    return api.get('/get-products/', { params: { category, subcategory, page } }); // Query params
  },

  // Search products across all categories
  searchProducts: (query) => {
    return api.get('/search-products/', { params: { query } }); // Query param
  },

  getCategories: () => {
    return api.get('/get-product-categories/'); // API call to fetch categories
  },

  getProductDetails: (productId) => {
    return api.get(`/get-product-details/${productId}`);
  },

  addToCart: (email, productId, color, provider, size, quantity) => {
    return api.post('/add-to-cart/', {
      email,
      product_id: productId,
      color,
      provider,
      size,
      quantity,
    });
  },

  getCart: (email) => {
    return api.get('/get-cart/', { params: {email} });
  },

  getAccountDetails: (email) => {
    return api.get("/get-account-details/", { params: { email } });
  },
  
  updateAccountDetails: (email, details) => {
    return api.post("/update-account-details/", { email, ...details });
  },

  removeFromCart: (email, cartItemId) => {
    return api.delete('/remove-from-cart/', {
      data: { email, cart_item_id: cartItemId }, // Email and cartItemId in the request body
    });
  },

  addFavorite: (email, productId) => {
    return api.post('/add-favorite/', {
      email,
      product_id: productId,
    });
  },

  getFavorites: (email) => {
    return api.get('/get-favorites/', { params: { email } });
  },

  removeFavorite: (email, productId) => {
    return api.delete('/remove-favorite/', {
      data: { email, product_id: productId },
    });
  },

  recordContact: (email, comments) => {
    return api.post('/record-contact/', {
      email,
      comments,
    });
  },

  // Add a new address
createAddress: (email, address) => {
  return api.post('/create-address/', {
    email,
    address,
  });
},

// Get all addresses for a user
getAddresses: (email) => {
  return api.get('/get-addresses/', {
    params: { email },
  });
},

// Delete an address
deleteAddress: (email, addressId) => {
  return api.delete('/delete-address/', {
    data: { email, addressId },
  });
},

// Update an address
updateAddress: (email, addressId, newAddress) => {
  return api.put('/update-address/', {
    email,
    addressId,
    newAddress,
  });
},

createOrder: async (orderData) => {
  return await api.post('/create-order/', orderData);
},

getOrders: async (email) => {
  return await api.get(`/get-orders/?email=${email}`);
},

cancelOrder: async (orderId, email) => {
  return await api.post("cancel-order/", { orderId, email });
},

  
};

export default api;
