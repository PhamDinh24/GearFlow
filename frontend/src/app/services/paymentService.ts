import api from './http';

export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VNPayParams {
  paymentUrl: string;
  vnp_SecureHash: string;
}

export const paymentService = {
  async createPayment(orderId: string, paymentMethod: 'VNPAY' | 'COD'): Promise<Payment> {
    const response = await api.post('/payment', {
      orderId,
      paymentMethod,
    });
    return response.data;
  },

  async getVNPayUrl(paymentId: string): Promise<VNPayParams> {
    const response = await api.get(`/payment/${paymentId}/vnpay-url`);
    return response.data;
  },

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await api.get(`/payment/${paymentId}`);
    return response.data;
  },

  async verifyPayment(params: Record<string, string>): Promise<Payment> {
    const response = await api.get('/payment/callback', { params });
    return response.data;
  },

  buildVNPayUrl(params: VNPayParams): string {
    // Backend now returns the complete pre-built URL
    return params.paymentUrl;
  },
};
