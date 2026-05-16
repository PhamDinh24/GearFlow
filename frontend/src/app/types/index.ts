// Auth Types
export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

// User Types
export interface UserDTO {
  id: string;
  username: string;
  phone: string;
  address: string;
  imageUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  brandId: string;
  support?: string;
  imageUrl?: string;
  layout?: string;
  connectionType?: string;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariantDTO[];
  attributes?: ProductAttributeDTO[];
  averageRating?: number;
  reviewCount?: number;
  stock: number;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  switchType?: string;
  color?: string;
  keycapSet?: string;
  connectionType?: string;
  priceModifier: number;
  availableStock: number;
  inStock: boolean;
  stock: number;
}

export interface ProductAttributeDTO {
  id: string;
  productId: string;
  name: string;
  value: string;
  attrName: string;
  attrValue: string;
  priceAdjustment?: number;
  attributeDefinitionId?: string;
  displayName?: string;
  type?: string;
  unit?: string;
}

export interface AttributeDefinitionDTO {
  id: string;
  name: string;
  displayName: string;
  type: string;
  unit?: string;
  filterable: boolean;
  variantAttribute: boolean;
  displayOrder: number;
  createdAt: string;
}

// Brand & Category Types
export interface BrandDTO {
  id: string;
  name: string;
  description?: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
}

// Cart Types
export interface CartItemDTO {
  variantId: string;
  productId: string;
  productName: string;
  imageUrl?: string;
  variantDetails?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartDTO {
  id: string;
  userId: string;
  items: CartItemDTO[];
  totalPrice: number;
  totalItems: number;
}

// Order Types
export interface OrderDTO {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingPhone?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemDTO[];
}

export interface OrderItemDTO {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderRequest {
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
}

// Payment Types
export interface PaymentDTO {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

// Review Types
export interface ReviewDTO {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

// Wishlist Types
export interface WishlistDTO {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  addedAt: string;
}

// Shipping Address Types
export interface ShippingAddressDTO {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Pagination Types
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
