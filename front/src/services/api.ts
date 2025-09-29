// front/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  console.log('🔑 Токен из localStorage:', token ? 'есть' : 'нет');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('📤 Отправляем запрос с токеном:', config.url);
  } else {
    console.log('❌ Токен отсутствует для запроса:', config.url);
  }
  return config;
});

// Добавляем обработку ошибок
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data || error.message);
    // Перехват 401: очищаем токен и редиректим на страницу логина
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('auth_token');
      } catch {}
      // Избежать бесконечного редиректа, если уже на /login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Авторизация
  sendOtp: (phone: string) => {
    console.log('📤 Отправляем OTP для телефона:', phone);
    return api.post('/auth/send-otp', { phone }).then(res => {
      console.log('✅ OTP отправлен:', res.data);
      return res.data;
    });
  },
  verifyOtp: (phone: string, code: string) => {
    console.log('📤 Проверяем OTP:', phone, code);
    return api.post('/auth/verify-otp', { phone, code }).then(res => {
      console.log('✅ OTP проверен:', res.data);
      return res.data;
    });
  },
  
  // Заказы
  getOrders: () => api.get('/orders').then(res => res.data),
  getOrder: (id: number) => api.get(`/orders/${id}`).then(res => res.data),
  updateOrderStatus: (id: number, status: string) => api.patch(`/orders/${id}/status`, { status }).then(res => res.data),
  
    // Продукты
    getProducts: (filters?: { search?: string; categoryId?: number; subcategoryId?: number; isAvailable?: boolean }) => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters?.subcategoryId) params.append('subcategoryId', filters.subcategoryId.toString());
      if (filters?.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : '/products';
      return api.get(url).then(res => res.data);
    },
  getProduct: (id: number) => api.get(`/products/${id}`).then(res => res.data),
  createProduct: (product: any) => api.post('/products', product).then(res => res.data),
  updateProduct: (id: number, product: any) => api.put(`/products/${id}`, product).then(res => res.data),
  deleteProduct: (id: number) => api.delete(`/products/${id}`).then(res => res.data),
  getProductsByCategory: (categoryId: number) => api.get(`/products/category/${categoryId}`).then(res => res.data),
  getProductsBySubcategory: (subcategoryId: number) => api.get(`/products/subcategory/${subcategoryId}`).then(res => res.data),
  
  // Пользователи
  getUsers: () => api.get('/users').then(res => res.data),
  getUser: (id: number) => api.get(`/users/${id}`).then(res => res.data),
  
  // Статистика
  getStats: () => api.get('/stats').then(res => res.data),

  updateUserRole: (id: number, role: 'user' | 'admin' | 'owner') => 
    api.patch(`/users/${id}/role`, { role }).then(res => res.data),
  
  blockUser: (id: number) => 
    api.patch(`/users/${id}/block`).then(res => res.data),
  
  unblockUser: (id: number) => 
    api.patch(`/users/${id}/unblock`).then(res => res.data),
  
  toggleUserStatus: (id: number) => 
    api.patch(`/users/${id}/toggle-status`).then(res => res.data),

  // Категории
  getCategories: () => api.get('/categories').then(res => res.data),
  getCategory: (id: number) => api.get(`/categories/${id}`).then(res => res.data),
  createCategory: (category: any) => api.post('/categories', category).then(res => res.data),
  updateCategory: (id: number, category: any) => api.put(`/categories/${id}`, category).then(res => res.data),
  deleteCategory: (id: number) => api.delete(`/categories/${id}`).then(res => res.data),

  // Подкатегории
  getSubcategories: () => api.get('/subcategories').then(res => res.data),
  getSubcategory: (id: number) => api.get(`/subcategories/${id}`).then(res => res.data),
  getSubcategoriesByCategory: (categoryId: number) => api.get(`/categories/${categoryId}/subcategories`).then(res => res.data),
  createSubcategory: (subcategory: any) => api.post('/subcategories', subcategory).then(res => res.data),
  updateSubcategory: (id: number, subcategory: any) => api.put(`/subcategories/${id}`, subcategory).then(res => res.data),
  deleteSubcategory: (id: number) => api.delete(`/subcategories/${id}`).then(res => res.data),

  // Отзывы
  getLatestReviews: ({ offset = 0, limit = 20 }: { offset?: number; limit?: number }) =>
    api.get(`/reviews/latest?offset=${offset}&limit=${limit}`).then(res => res.data),
  getProductReviews: (productId: number, { offset = 0, limit = 10 }: { offset?: number; limit?: number } = {}) =>
    api.get(`/reviews/product/${productId}?offset=${offset}&limit=${limit}`).then(res => res.data),
  createReview: (payload: any) => api.post('/reviews', payload).then(res => res.data),
  hideReview: (id: number) => api.patch(`/reviews/${id}/hide`).then(res => res.data),
  unhideReview: (id: number) => api.patch(`/reviews/${id}/unhide`).then(res => res.data),
};

export default api;