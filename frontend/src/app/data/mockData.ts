export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: string;
  brand: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  layout: '60%' | '65%' | '75%' | 'TKL' | 'Full-size';
  
  // Available options
  colorOptions: ColorOption[];
  keycapOptions: KeycapOption[];
  switchOptions: SwitchOption[];
  connectOptions: ConnectOption[];
  hotswapOptions: HotswapOption[];
  
  stock: number;
  variants?: any[];
}

export interface ColorOption {
  id: string;
  name: string;
  hexCode: string;
  priceModifier: number;
  inStock: boolean;
}

export interface KeycapOption {
  id: string;
  material: 'PBT' | 'ABS';
  profile: 'Cherry' | 'OEM' | 'SA' | 'XDA';
  description: string;
  priceModifier: number;
  inStock: boolean;
}

export interface SwitchOption {
  id: string;
  brand: string;
  type: 'Linear' | 'Tactile' | 'Clicky';
  description: string;
  priceModifier: number;
  inStock: boolean;
}

export interface ConnectOption {
  id: string;
  type: 'Wired' | 'Wireless' | 'Bluetooth';
  description: string;
  priceModifier: number;
  inStock: boolean;
}

export interface HotswapOption {
  id: string;
  hasHotswap: boolean;
  description: string;
  priceModifier: number;
  inStock: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  keycapMaterial: 'PBT' | 'ABS';
  keycapProfile: 'Cherry' | 'OEM' | 'SA' | 'XDA';
  switchType: 'Linear' | 'Tactile' | 'Clicky';
  switchBrand: string;
  hasHotswap: boolean;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'VNPAY' | 'COD';
  shippingAddress: string;
  customerName: string;
  items: OrderItem[];
}

export interface OrderItem {
  productName: string;
  variantColor: string;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  adminReply?: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  country: string;
  isActive: boolean;
  productCount: number;
  website?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  type: 'layout' | 'connection' | 'switch';
  isActive: boolean;
  productCount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'blocked';
  role: 'user' | 'admin';
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'GearFlow Elite 75% RGB',
    description: 'Bàn phím cơ 75% cao cấp với đèn RGB per-key, hot-swappable PCB, switch Gateron Yellow Pro. Case nhôm CNC, gasket mount mang lại trải nghiệm gõ êm ái.',
    basePrice: 1990000,
    image: 'https://images.unsplash.com/photo-1643869094397-962f806fe3ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjBSR0IlMjBnYW1pbmd8ZW58MXx8fHwxNzczNzc2MjI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Keyboard',
    brand: 'GearFlow',
    layout: '75%',
    isNew: true,
    isBestSeller: true,
    isActive: true,
    stock: 15,
    colorOptions: [
      { id: 'c1', name: 'Đen', hexCode: '#1a1a1a', priceModifier: 0, inStock: true },
      { id: 'c2', name: 'Trắng', hexCode: '#F5F5F5', priceModifier: 50000, inStock: true },
      { id: 'c3', name: 'Xám', hexCode: '#4A5568', priceModifier: 0, inStock: true },
    ],
    keycapOptions: [
      { id: 'k1', material: 'PBT', profile: 'Cherry', description: 'PBT Double-shot Cherry profile - Bền bỉ, không bóng nhờn', priceModifier: 200000, inStock: true },
      { id: 'k2', material: 'ABS', profile: 'OEM', description: 'ABS OEM profile - Tiêu chuẩn, giá tốt', priceModifier: 0, inStock: true },
      { id: 'k3', material: 'PBT', profile: 'SA', description: 'PBT SA profile - Cao, cổ điển', priceModifier: 350000, inStock: true },
    ],
    switchOptions: [
      { id: 's1', brand: 'Gateron Yellow Pro', type: 'Linear', description: 'Linear mượt mà, không tiếng click - Phù hợp gaming', priceModifier: 0, inStock: true },
      { id: 's2', brand: 'Gateron Brown', type: 'Tactile', description: 'Tactile nhẹ, phản hồi vừa phải - Đa năng', priceModifier: 50000, inStock: true },
      { id: 's3', brand: 'Cherry MX Red', type: 'Linear', description: 'Cherry MX Red - Linear chính hãng Đức', priceModifier: 300000, inStock: true },
    ],
    connectOptions: [
      { id: 'cn1', type: 'Wired', description: 'Kết nối USB-C có dây - Ổn định', priceModifier: 0, inStock: true },
      { id: 'cn2', type: 'Wireless', description: 'Wireless 2.4GHz - Không dây nhanh', priceModifier: 200000, inStock: true },
      { id: 'cn3', type: 'Bluetooth', description: 'Bluetooth 5.1 - Kết nối đa thiết bị', priceModifier: 150000, inStock: true },
    ],
    hotswapOptions: [
      { id: 'h1', hasHotswap: true, description: 'Hot-swap PCB - Thay switch không cần hàn', priceModifier: 200000, inStock: true },
      { id: 'h2', hasHotswap: false, description: 'PCB hàn cố định - Giá tốt hơn', priceModifier: 0, inStock: true },
    ],
    variants: [],
  },
  {
    id: '2',
    name: 'GearFlow Pure White TKL',
    description: 'Bàn phím TKL tenkeyless thiết kế tối giản, keycap PBT Double-shot, switch Cherry MX Brown. Hoàn hảo cho văn phòng và làm việc tại nhà.',
    basePrice: 1590000,
    image: 'https://images.unsplash.com/photo-1640484862843-03c8c0c49d96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjB3aGl0ZXxlbnwxfHx8fDE3NzM3NzYyMjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Keyboard',
    brand: 'GearFlow',
    layout: 'TKL',
    isBestSeller: true,
    isActive: true,
    stock: 20,
    colorOptions: [
      { id: 'c4', name: 'Trắng tinh', hexCode: '#FFFFFF', priceModifier: 0, inStock: true },
      { id: 'c5', name: 'Trắng xám', hexCode: '#F7FAFC', priceModifier: 0, inStock: true },
    ],
    keycapOptions: [
      { id: 'k4', material: 'PBT', profile: 'Cherry', description: 'PBT Cherry profile cao cấp', priceModifier: 150000, inStock: true },
      { id: 'k5', material: 'ABS', profile: 'OEM', description: 'ABS OEM tiêu chuẩn', priceModifier: 0, inStock: true },
    ],
    switchOptions: [
      { id: 's4', brand: 'Cherry MX Brown', type: 'Tactile', description: 'Tactile chuẩn văn phòng', priceModifier: 200000, inStock: true },
      { id: 's5', brand: 'Cherry MX Blue', type: 'Clicky', description: 'Clicky âm thanh đặc trưng', priceModifier: 200000, inStock: true },
      { id: 's6', brand: 'Gateron Brown', type: 'Tactile', description: 'Tactile giá tốt', priceModifier: 0, inStock: true },
    ],
    connectOptions: [
      { id: 'cn4', type: 'Wired', description: 'USB-C có dây', priceModifier: 0, inStock: true },
    ],
    hotswapOptions: [
      { id: 'h3', hasHotswap: true, description: 'Hot-swap PCB', priceModifier: 150000, inStock: true },
      { id: 'h4', hasHotswap: false, description: 'PCB hàn cố định', priceModifier: 0, inStock: true },
    ],
    variants: [],
  },
  {
    id: '3',
    name: 'GearFlow Aurora 65% Pink',
    description: 'Bàn phím 65% phong cách aesthetic với tone màu hồng pastel, RGB underglow. Trang bị switch linear Gateron Milky Yellow, stab Durock V2.',
    basePrice: 1890000,
    image: 'https://images.unsplash.com/photo-1608617878675-4d9df7cb7f92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjBwaW5rJTIwYWVzdGhldGljfGVufDF8fHx8MTc3Mzc3NjIyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Keyboard',
    brand: 'GearFlow',
    layout: '65%',
    isNew: true,
    isActive: true,
    stock: 10,
    colorOptions: [
      { id: 'c6', name: 'Hồng', hexCode: '#FFC0CB', priceModifier: 100000, inStock: true },
      { id: 'c7', name: 'Hồng nhạt', hexCode: '#FFB6C1', priceModifier: 100000, inStock: true },
      { id: 'c8', name: 'Trắng', hexCode: '#FFFFFF', priceModifier: 0, inStock: true },
    ],
    keycapOptions: [
      { id: 'k6', material: 'PBT', profile: 'SA', description: 'PBT SA profile cao - Phong cách cổ điển', priceModifier: 300000, inStock: true },
      { id: 'k7', material: 'PBT', profile: 'Cherry', description: 'PBT Cherry profile', priceModifier: 150000, inStock: true },
      { id: 'k8', material: 'ABS', profile: 'OEM', description: 'ABS OEM', priceModifier: 0, inStock: true },
    ],
    switchOptions: [
      { id: 's7', brand: 'Gateron Milky Yellow', type: 'Linear', description: 'Linear mượt, âm thanh êm', priceModifier: 100000, inStock: true },
      { id: 's8', brand: 'Gateron Brown', type: 'Tactile', description: 'Tactile nhẹ nhàng', priceModifier: 50000, inStock: true },
    ],
    connectOptions: [
      { id: 'cn5', type: 'Wired', description: 'USB-C', priceModifier: 0, inStock: true },
      { id: 'cn6', type: 'Bluetooth', description: 'Bluetooth 5.1', priceModifier: 200000, inStock: true },
    ],
    hotswapOptions: [
      { id: 'h5', hasHotswap: true, description: 'Hot-swap', priceModifier: 200000, inStock: true },
      { id: 'h6', hasHotswap: false, description: 'Hàn cố định', priceModifier: 0, inStock: true },
    ],
    variants: [],
  },
  {
    id: '4',
    name: 'GearFlow Pro Blue Switch Edition',
    description: 'Bàn phím full-size 104 phím với Cherry MX Blue switches, mang lại âm thanh click đặc trưng. Keycap ABS Doubleshot, LED backlight trắng.',
    basePrice: 2190000,
    image: 'https://images.unsplash.com/photo-1729501309405-5710375095cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjBibHVlJTIwc3dpdGNoZXN8ZW58MXx8fHwxNzczNzc2MjI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Keyboard',
    brand: 'Cherry',
    layout: 'Full-size',
    isNew: true,
    isActive: true,
    stock: 7,
    colorOptions: [
      { id: 'c9', name: 'Xanh navy', hexCode: '#2C5282', priceModifier: 100000, inStock: true },
      { id: 'c10', name: 'Đen', hexCode: '#1a1a1a', priceModifier: 0, inStock: true },
    ],
    keycapOptions: [
      { id: 'k9', material: 'ABS', profile: 'OEM', description: 'ABS Doubleshot OEM', priceModifier: 100000, inStock: true },
      { id: 'k10', material: 'PBT', profile: 'Cherry', description: 'PBT Cherry', priceModifier: 250000, inStock: true },
    ],
    switchOptions: [
      { id: 's9', brand: 'Cherry MX Blue', type: 'Clicky', description: 'Cherry MX Blue chính hãng', priceModifier: 300000, inStock: true },
      { id: 's10', brand: 'Kailh Box White', type: 'Clicky', description: 'Kailh Box White giá tốt', priceModifier: 100000, inStock: true },
    ],
    connectOptions: [
      { id: 'cn7', type: 'Wired', description: 'USB-C braided cable', priceModifier: 0, inStock: true },
    ],
    hotswapOptions: [
      { id: 'h7', hasHotswap: true, description: 'Hot-swap PCB', priceModifier: 200000, inStock: true },
      { id: 'h8', hasHotswap: false, description: 'Hàn cố định', priceModifier: 0, inStock: true },
    ],
    variants: [],
  },
  {
    id: '5',
    name: 'GearFlow Compact 60%',
    description: 'Bàn phím 60% siêu compact, tiết kiệm không gian tối đa. Hot-swap socket, switch Kailh Box White, foam mod sẵn. Case nhựa chất lượng cao với nhiều màu sắc.',
    basePrice: 1290000,
    image: 'https://images.unsplash.com/photo-1749814252321-e9a275a5ee80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwbWVjaGFuaWNhbCUyMGtleWJvYXJkJTIwdGtsfGVufDF8fHx8MTc3Mzc3NjIyOHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Keyboard',
    brand: 'Kailh',
    layout: '60%',
    isBestSeller: true,
    isActive: true,
    stock: 4,
    colorOptions: [
      { id: 'c11', name: 'Đen', hexCode: '#1a1a1a', priceModifier: 0, inStock: true },
      { id: 'c12', name: 'Trắng', hexCode: '#FFFFFF', priceModifier: 0, inStock: true },
      { id: 'c13', name: 'Xanh dương', hexCode: '#4299E1', priceModifier: 50000, inStock: true },
    ],
    keycapOptions: [
      { id: 'k11', material: 'PBT', profile: 'XDA', description: 'PBT XDA uniform profile', priceModifier: 200000, inStock: true },
      { id: 'k12', material: 'ABS', profile: 'Cherry', description: 'ABS Cherry profile', priceModifier: 0, inStock: true },
    ],
    switchOptions: [
      { id: 's11', brand: 'Kailh Box White', type: 'Clicky', description: 'Kailh Box White click sắc nét', priceModifier: 100000, inStock: true },
      { id: 's12', brand: 'Gateron Red', type: 'Linear', description: 'Gateron Red linear nhẹ', priceModifier: 0, inStock: true },
      { id: 's13', brand: 'Gateron Yellow', type: 'Linear', description: 'Gateron Yellow phổ biến', priceModifier: 50000, inStock: true },
    ],
    connectOptions: [
      { id: 'cn8', type: 'Wired', description: 'USB-C detachable', priceModifier: 0, inStock: true },
    ],
    hotswapOptions: [
      { id: 'h9', hasHotswap: true, description: 'Hot-swap socket', priceModifier: 150000, inStock: true },
      { id: 'h10', hasHotswap: false, description: 'Hàn sẵn', priceModifier: 0, inStock: true },
    ],
    variants: [],
  },
  {
    id: '6',
    name: 'GearFlow Wireless Pro',
    description: 'Bàn phím không dây cao cấp với Bluetooth 5.1 và USB-C. Pin lithium 4000mAh sử dụng lên đến 3 tháng. Switch Gateron G Pro Yellow, triple mode connectivity.',
    basePrice: 2690000,
    image: 'https://images.unsplash.com/photo-1694405145070-e58cc29771fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMG1lY2hhbmljYWwlMjBrZXlib2FyZHxlbnwxfHx8fDE3NzM3NzYyMjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Keyboard',
    brand: 'Gateron',
    layout: '75%',
    isNew: true,
    isBestSeller: true,
    isActive: true,
    stock: 6,
    colorOptions: [
      { id: 'c14', name: 'Đen', hexCode: '#1A202C', priceModifier: 0, inStock: true },
      { id: 'c15', name: 'Trắng', hexCode: '#FFFFFF', priceModifier: 100000, inStock: true },
    ],
    keycapOptions: [
      { id: 'k13', material: 'PBT', profile: 'Cherry', description: 'PBT Cherry doubleshot', priceModifier: 200000, inStock: true },
      { id: 'k14', material: 'ABS', profile: 'OEM', description: 'ABS OEM', priceModifier: 0, inStock: true },
    ],
    switchOptions: [
      { id: 's14', brand: 'Gateron G Pro Yellow', type: 'Linear', description: 'Gateron G Pro Yellow pre-lubed', priceModifier: 200000, inStock: true },
      { id: 's15', brand: 'Gateron G Pro Brown', type: 'Tactile', description: 'Gateron G Pro Brown tactile', priceModifier: 200000, inStock: true },
    ],
    connectOptions: [
      { id: 'cn9', type: 'Wired', description: 'USB-C', priceModifier: 0, inStock: true },
      { id: 'cn10', type: 'Wireless', description: 'Wireless 2.4GHz', priceModifier: 200000, inStock: true },
      { id: 'cn11', type: 'Bluetooth', description: 'Bluetooth 5.1 (3 devices)', priceModifier: 300000, inStock: true },
    ],
    hotswapOptions: [
      { id: 'h11', hasHotswap: true, description: 'Hot-swap PCB', priceModifier: 300000, inStock: true },
      { id: 'h12', hasHotswap: false, description: 'Hàn cố định', priceModifier: 0, inStock: true },
    ],
    variants: [],
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    userId: 'u1',
    date: '2026-03-15',
    total: 4380000,
    status: 'delivered',
    paymentMethod: 'VNPAY',
    shippingAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
    customerName: 'Nguyễn Văn An',
    items: [
      { productName: 'GearFlow Elite 75% RGB', variantColor: 'Đen', quantity: 1, price: 2490000 },
      { productName: 'GearFlow Pure White TKL', variantColor: 'Trắng', quantity: 1, price: 1890000 },
    ],
  },
  {
    id: 'ORD002',
    userId: 'u1',
    date: '2026-03-10',
    total: 3290000,
    status: 'shipped',
    paymentMethod: 'COD',
    shippingAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
    customerName: 'Nguyễn Văn An',
    items: [
      { productName: 'GearFlow Wireless Pro', variantColor: 'Đen', quantity: 1, price: 3290000 },
    ],
  },
  {
    id: 'ORD003',
    userId: 'u2',
    date: '2026-03-05',
    total: 4280000,
    status: 'processing',
    paymentMethod: 'VNPAY',
    shippingAddress: '456 Lê Lợi, Q3, TP.HCM',
    customerName: 'Trần Thị Bình',
    items: [
      { productName: 'GearFlow Aurora 65% Pink', variantColor: 'Hồng', quantity: 1, price: 2290000 },
      { productName: 'GearFlow Aurora 65% Pink', variantColor: 'Hồng nhạt', quantity: 1, price: 1990000 },
    ],
  },
  {
    id: 'ORD004',
    userId: 'u3',
    date: '2026-04-01',
    total: 2190000,
    status: 'pending',
    paymentMethod: 'COD',
    shippingAddress: '789 Trần Hưng Đạo, Q5, TP.HCM',
    customerName: 'Lê Văn Cường',
    items: [
      { productName: 'GearFlow Compact 60%', variantColor: 'Xanh dương', quantity: 1, price: 1590000 },
    ],
  },
  {
    id: 'ORD005',
    userId: 'u4',
    date: '2026-04-05',
    total: 5380000,
    status: 'delivered',
    paymentMethod: 'VNPAY',
    shippingAddress: '321 Nguyễn Đình Chiểu, Q3, TP.HCM',
    customerName: 'Phạm Thị Dung',
    items: [
      { productName: 'GearFlow Wireless Pro', variantColor: 'Trắng', quantity: 1, price: 2990000 },
      { productName: 'GearFlow Elite 75% RGB', variantColor: 'Xám', quantity: 1, price: 2390000 },
    ],
  },
];

export const mockWishlist = ['1', '3', '5'];

export const mockReviews: Review[] = [
  {
    id: 'rv1',
    productId: '1',
    userId: 'u1',
    userName: 'Nguyễn Văn An',
    rating: 5,
    comment: 'Bàn phím tuyệt vời! Switch Gateron Yellow Pro siêu mượt, gõ rất thích. Case nhôm chắc chắn, không rung khi gõ mạnh. Rất hài lòng!',
    date: '2026-03-20',
    status: 'approved',
    adminReply: 'Cảm ơn bạn đã tin tưởng GearFlow! Chúc bạn gõ phím vui vẻ.',
  },
  {
    id: 'rv2',
    productId: '1',
    userId: 'u2',
    userName: 'Trần Thị Bình',
    rating: 4,
    comment: 'Sản phẩm tốt, đúng mô tả. Hot-swap rất tiện. Chỉ tiếc là hộp đóng gói chưa chắc chắn lắm, nhưng không ảnh hưởng đến chất lượng.',
    date: '2026-03-22',
    status: 'approved',
  },
  {
    id: 'rv3',
    productId: '2',
    userId: 'u3',
    userName: 'Lê Văn Cường',
    rating: 5,
    comment: 'Mua làm quà tặng bạn gái, cô ấy rất thích màu trắng tinh tế. Giao hàng nhanh, đóng gói cẩn thận.',
    date: '2026-03-18',
    status: 'approved',
  },
  {
    id: 'rv4',
    productId: '3',
    userId: 'u4',
    userName: 'Phạm Thị Dung',
    rating: 5,
    comment: 'Bàn phím hồng quá xinh! Màu sắc đúng với ảnh, switch linear êm ái. Mình dùng để làm việc văn phòng, rất phù hợp.',
    date: '2026-03-15',
    status: 'approved',
  },
  {
    id: 'rv5',
    productId: '6',
    userId: 'u1',
    userName: 'Nguyễn Văn An',
    rating: 4,
    comment: 'Wireless hoạt động tốt, kết nối ổn định. Pin dùng được lâu thật sự. Chỉ hơi nặng một chút so với keyboard thường.',
    date: '2026-04-01',
    status: 'pending',
  },
  {
    id: 'rv6',
    productId: '4',
    userId: 'u5',
    userName: 'Hoàng Minh Tuấn',
    rating: 3,
    comment: 'Switch Blue quá ồn, không phù hợp nếu ở cùng người khác. Nhưng nếu bạn thích tiếng click thì rất tuyệt.',
    date: '2026-04-10',
    status: 'pending',
  },
  {
    id: 'rv7',
    productId: '5',
    userId: 'u6',
    userName: 'Vũ Thị Lan',
    rating: 4,
    comment: 'Compact 60% rất tiện mang theo. Giá hợp lý cho chất lượng. Hotswap socket chắc chắn.',
    date: '2026-04-08',
    status: 'approved',
  },
  {
    id: 'rv8',
    productId: '2',
    userId: 'u7',
    userName: 'Đỗ Văn Nam',
    rating: 2,
    comment: 'Màu trắng không trắng bằng hình ảnh. Keycap hơi mờ sau một thời gian dùng.',
    date: '2026-04-12',
    status: 'rejected',
  },
];

export const mockBrands: Brand[] = [
  { id: 'b1', name: 'GearFlow', description: 'Thương hiệu bàn phím cơ nội địa hàng đầu Việt Nam', country: 'Việt Nam', isActive: true, productCount: 6, website: 'https://gearflow.vn' },
  { id: 'b2', name: 'Cherry', description: 'Nhà sản xuất switch cơ học huyền thoại từ Đức, nổi tiếng với dòng Cherry MX', country: 'Đức', isActive: true, productCount: 2, website: 'https://cherry.de' },
  { id: 'b3', name: 'Gateron', description: 'Hãng switch cơ học hàng đầu Trung Quốc, nổi tiếng với chất lượng cao và giá tốt', country: 'Trung Quốc', isActive: true, productCount: 3, website: 'https://gateron.com' },
  { id: 'b4', name: 'Kailh', description: 'Nhà sản xuất switch cơ học với nhiều lựa chọn độc đáo như Kailh Box', country: 'Trung Quốc', isActive: true, productCount: 1, website: 'https://kailhswitch.com' },
  { id: 'b5', name: 'Akko', description: 'Thương hiệu bàn phím cơ trẻ trung với thiết kế đẹp và giá phải chăng', country: 'Trung Quốc', isActive: true, productCount: 0, website: 'https://en.akkogear.com' },
  { id: 'b6', name: 'Keychron', description: 'Bàn phím cơ wireless cao cấp được ưa chuộng trong cộng đồng creator', country: 'Hồng Kông', isActive: false, productCount: 0, website: 'https://keychron.com' },
];

export const mockCategories: Category[] = [
  { id: 'cat1', name: '60%', description: 'Layout 60% siêu compact, chỉ giữ lại các phím cơ bản', type: 'layout', isActive: true, productCount: 1 },
  { id: 'cat2', name: '65%', description: 'Layout 65% compact với các phím điều hướng', type: 'layout', isActive: true, productCount: 1 },
  { id: 'cat3', name: '75%', description: 'Layout 75% cân bằng giữa compact và đầy đủ', type: 'layout', isActive: true, productCount: 2 },
  { id: 'cat4', name: 'TKL', description: 'Tenkeyless - loại bỏ numpad, giữ đầy đủ các phím còn lại', type: 'layout', isActive: true, productCount: 1 },
  { id: 'cat5', name: 'Full-size', description: 'Layout đầy đủ 104 phím với numpad', type: 'layout', isActive: true, productCount: 1 },
  { id: 'cat6', name: 'Có dây (Wired)', description: 'Kết nối USB-C có dây, ổn định và không lag', type: 'connection', isActive: true, productCount: 6 },
  { id: 'cat7', name: 'Không dây (Wireless)', description: 'Kết nối 2.4GHz không dây tốc độ cao', type: 'connection', isActive: true, productCount: 2 },
  { id: 'cat8', name: 'Bluetooth', description: 'Bluetooth 5.1 kết nối đa thiết bị', type: 'connection', isActive: true, productCount: 3 },
  { id: 'cat9', name: 'Linear', description: 'Switch Linear - nhấn mượt mà, không có điểm bật', type: 'switch', isActive: true, productCount: 4 },
  { id: 'cat10', name: 'Tactile', description: 'Switch Tactile - có điểm bật nhẹ, phản hồi rõ ràng', type: 'switch', isActive: true, productCount: 3 },
  { id: 'cat11', name: 'Clicky', description: 'Switch Clicky - có tiếng click đặc trưng', type: 'switch', isActive: true, productCount: 2 },
];

export const mockCustomers: Customer[] = [
  { id: 'C001', name: 'Nguyễn Văn An', email: 'user@gearflow.vn', phone: '0912345678', totalOrders: 3, totalSpent: 7670000, joinDate: '2025-01-15', status: 'active', role: 'user' },
  { id: 'C002', name: 'Trần Thị Bình', email: 'tranthib@example.com', phone: '0923456789', totalOrders: 8, totalSpent: 18450000, joinDate: '2025-02-20', status: 'active', role: 'user' },
  { id: 'C003', name: 'Lê Văn Cường', email: 'levanc@example.com', phone: '0934567890', totalOrders: 5, totalSpent: 12300000, joinDate: '2025-03-10', status: 'active', role: 'user' },
  { id: 'C004', name: 'Phạm Thị Dung', email: 'phamthid@example.com', phone: '0945678901', totalOrders: 15, totalSpent: 32890000, joinDate: '2024-12-05', status: 'active', role: 'user' },
  { id: 'C005', name: 'Hoàng Minh Tuấn', email: 'hoangvane@example.com', phone: '0956789012', totalOrders: 3, totalSpent: 8500000, joinDate: '2026-01-20', status: 'active', role: 'user' },
  { id: 'C006', name: 'Vũ Thị Lan', email: 'vuthilan@example.com', phone: '0967890123', totalOrders: 6, totalSpent: 15200000, joinDate: '2025-06-10', status: 'active', role: 'user' },
  { id: 'C007', name: 'Đỗ Văn Nam', email: 'dovannam@example.com', phone: '0978901234', totalOrders: 2, totalSpent: 4500000, joinDate: '2026-02-05', status: 'blocked', role: 'user' },
  { id: 'A001', name: 'Admin GearFlow', email: 'admin@gearflow.vn', phone: '0901234567', totalOrders: 0, totalSpent: 0, joinDate: '2024-01-01', status: 'active', role: 'admin' },
];

export const mockRevenueData = [
  { month: 'T1', revenue: 45000000, orders: 28 },
  { month: 'T2', revenue: 52000000, orders: 33 },
  { month: 'T3', revenue: 48000000, orders: 30 },
  { month: 'T4', revenue: 61000000, orders: 38 },
  { month: 'T5', revenue: 55000000, orders: 35 },
  { month: 'T6', revenue: 67000000, orders: 42 },
  { month: 'T7', revenue: 72000000, orders: 45 },
  { month: 'T8', revenue: 69000000, orders: 43 },
  { month: 'T9', revenue: 78000000, orders: 49 },
  { month: 'T10', revenue: 85000000, orders: 53 },
  { month: 'T11', revenue: 92000000, orders: 58 },
  { month: 'T12', revenue: 98000000, orders: 61 },
];
