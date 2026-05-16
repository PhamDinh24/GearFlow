import api from './http';

export const imageService = {
  /**
   * Upload an image for a product
   * @param productId The ID of the product
   * @param file The image file to upload
   * @returns The URL of the uploaded image
   */
  async uploadProductImage(productId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/images/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.imageUrl;
  },

  /**
   * Upload an image for a user
   * @param userId The ID of the user
   * @param file The image file to upload
   * @returns The URL of the uploaded image
   */
  async uploadUserImage(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/images/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.imageUrl;
  },

  /**
   * Delete a product's image
   * @param productId The ID of the product
   */
  async deleteProductImage(productId: string): Promise<void> {
    await api.delete(`/images/products/${productId}`);
  },

  /**
   * Delete a user's image
   * @param userId The ID of the user
   */
  async deleteUserImage(userId: string): Promise<void> {
    await api.delete(`/images/users/${userId}`);
  },
};
