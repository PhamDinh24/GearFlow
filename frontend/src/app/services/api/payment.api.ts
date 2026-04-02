import { BaseApiService } from './base';
import { PaymentDTO } from '../../types';

class PaymentApiService extends BaseApiService {
  async createPayment(orderId: string, paymentMethod: string): Promise<PaymentDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/payment'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ orderId, paymentMethod }),
      }
    );
    return this.handleResponse<PaymentDTO>(response);
  }

  async getPaymentVnpayUrl(paymentId: string): Promise<Record<string, string>> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/payment/${paymentId}/vnpay-url`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<Record<string, string>>(response);
  }

  async getPayment(paymentId: string): Promise<PaymentDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/payment/${paymentId}`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<PaymentDTO>(response);
  }

  async verifyVnpayCallback(params: Record<string, string>): Promise<PaymentDTO> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/payment/callback?${queryString}`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<PaymentDTO>(response);
  }
}

export const paymentApi = new PaymentApiService();
