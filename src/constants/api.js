const BASE_URL = 'http://192.168.31.104:3000';
//192.168.90.56
//192.168.1.8
//192.168.1.5

const API_ENDPOINTS = {
  CATEGORIES: `${BASE_URL}/api/categories`,
  DISHES: (categoryId) => categoryId === 'all' ? `${BASE_URL}/api/dishes` : `${BASE_URL}/api/dishes/${categoryId}`,
  CART: `${BASE_URL}/api/cart`,
  ADD_TO_CART: `${BASE_URL}/api/cart/add`,
  UPDATE_CART: `${BASE_URL}/api/cart/update`,
  REMOVE_FROM_CART: (dishId) => `${BASE_URL}/api/cart/remove/${dishId}`,
  SEARCH: (query) => `${BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
  ORDER: `${BASE_URL}/api/order`,
  ORDERS: `${BASE_URL}/api/orders`,
  ORDER_HISTORY: `${BASE_URL}/api/orders/history`,
  CANCEL_ORDER: (orderId) => `${BASE_URL}/api/orders/${orderId}/cancel`,
  UPDATE_ORDER_STATUS: (orderId) => `${BASE_URL}/api/orders/admin/orders/${orderId}/status`,
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  USER: (userId) => `${BASE_URL}/api/user/${userId}`,
  
  // API quên mật khẩu
  FORGOT_PASSWORD: `${BASE_URL}/api/auth/forgot-password`,  // Gửi OTP qua email
  VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp`,           // Xác thực mã OTP
  RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password`,    // Đặt lại mật khẩu mới
};

console.log("API Endpoints:", API_ENDPOINTS);

export { BASE_URL, API_ENDPOINTS };