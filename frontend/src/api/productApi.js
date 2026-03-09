import axiosInstance from './axiosConfig';

export const productApi = {
  getAllProducts: (page = 0, size = 10) => 
    axiosInstance.get('/products', { params: { page, size } }),
  
  getProductById: (id) => 
    axiosInstance.get(`/products/${id}`),
  
  searchProducts: (keyword, page = 0, size = 10) => 
    axiosInstance.get('/products/search', { params: { keyword, page, size } }),
  
  filterProducts: (filters, page = 0, size = 10) => 
    axiosInstance.get('/products/filter', { params: { ...filters, page, size } }),
  
  createProduct: (data) => 
    axiosInstance.post('/products', data),
  
  updateProduct: (id, data) => 
    axiosInstance.put(`/products/${id}`, data),
  
  deleteProduct: (id) => 
    axiosInstance.delete(`/products/${id}`),
};
