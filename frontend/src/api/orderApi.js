import axiosInstance from './axiosConfig';

export const orderApi = {
  createOrder: (userId, data) => 
    axiosInstance.post('/orders', data, { params: { userId } }),
  
  getUserOrders: (userId, page = 0, size = 10) => 
    axiosInstance.get(`/orders/user/${userId}`, { params: { page, size } }),
  
  getOrderById: (id) => 
    axiosInstance.get(`/orders/${id}`),
  
  updateOrderStatus: (id, status) => 
    axiosInstance.put(`/orders/${id}/status`, null, { params: { status } }),
};
