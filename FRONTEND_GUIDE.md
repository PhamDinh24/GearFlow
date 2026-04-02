# 🎯 Frontend Development Guide

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Main app component
│   │   ├── routes.tsx              # Route definitions
│   │   ├── components/
│   │   │   ├── admin/              # Admin dashboard components
│   │   │   ├── common/             # Shared components
│   │   │   ├── ui/                 # UI components (shadcn)
│   │   │   └── user/               # User-specific components
│   │   ├── context/                # React contexts (Auth, Cart)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/
│   │   │   ├── api/                # API client services
│   │   │   └── base.ts             # Base API service
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   └── utils/
│   ├── styles/                     # Global styles
│   └── main.tsx                    # Entry point
```

## API Services Usage

### Import API Services

```typescript
import { productApi } from '../../services/api';
import { categoryApi } from '../../services/api';
import { brandApi } from '../../services/api';
import { orderApi } from '../../services/api';
import { cartApi } from '../../services/api';
```

### Product Examples

```typescript
// Get all products
const products = await productApi.getAllProducts(page, size);

// Search products
const results = await productApi.searchProducts(keyword);

// Filter products
const filtered = await productApi.filterProducts(brand, minPrice, maxPrice);

// Get single product
const product = await productApi.getProductById(productId);
```

### Category Examples

```typescript
// Get all categories
const categories = await categoryApi.getCategories();

// Get category by ID
const category = await categoryApi.getCategoryById(categoryId);

// Create category (Admin)
await categoryApi.createCategory({ name, description });

// Update category (Admin)
await categoryApi.updateCategory(id, { name, description });

// Delete category (Admin)
await categoryApi.deleteCategory(id);
```

### Cart Examples

```typescript
// Get cart
const cart = await cartApi.getCart();

// Add item to cart
await cartApi.addItem(variantId, quantity);

// Update item quantity
await cartApi.updateItemQuantity(variantId, quantity);

// Remove item
await cartApi.removeItem(variantId);

// Clear cart
await cartApi.clearCart();
```

### Order Examples

```typescript
// Create order
const order = await orderApi.createOrder({
  shippingAddress,
  shippingCity,
  shippingPostalCode,
  shippingPhone
});

// Get user orders
const orders = await orderApi.getUserOrders();

// Get single order
const order = await orderApi.getOrder(orderId);

// Cancel order
await orderApi.cancelOrder(orderId);

// Update order status (Admin)
await orderApi.updateOrderStatus(orderId, status);
```

## Error Handling

All API calls should be wrapped in try-catch:

```typescript
try {
  const data = await categoryApi.getCategories();
  setCategories(data);
} catch (error: any) {
  console.error('Error:', error);
  toast.error(error.message || 'An error occurred');
}
```

## Component Patterns

### List Component Pattern

```typescript
import { useState, useEffect } from 'react';
import { categoryApi } from '../../services/api';
import { toast } from 'sonner';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm delete?')) return;
    try {
      await categoryApi.deleteCategory(id);
      toast.success('Deleted successfully');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* UI here */}
    </div>
  );
}
```

## Common Components

### Button
```tsx
<Button onClick={handleClick}>Click Me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button disabled>Disabled</Button>
```

### Input
```tsx
<Input 
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Select
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Dialog
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSubmit}>Submit</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast Notifications
```typescript
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
toast.warning('Warning message');
toast.info('Info message');
```

## Form Validation

```typescript
const validateForm = () => {
  if (!formData.name?.trim()) {
    toast.error('Name is required');
    return false;
  }
  if (formData.price < 0) {
    toast.error('Price must be positive');
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  try {
    await categoryApi.createCategory(formData);
    toast.success('Created successfully');
  } catch (error: any) {
    toast.error(error.message);
  }
};
```

## Authentication

User authentication is handled via:
- `AuthContext` for global auth state
- Login endpoint returns JWT tokens
- Authenticated requests auto-include token via BaseApiService
- Protected routes check authentication state

## Typescript Tips

Always properly type your data:

```typescript
import { CategoryDTO, ProductDTO } from '../../types';

const [categories, setCategories] = useState<CategoryDTO[]>([]);
const [currentProduct, setCurrentProduct] = useState<ProductDTO | null>(null);
```

## Performance Tips

1. Use lazy loading for images
2. Pagination for large lists
3. Debounce search inputs
4. Cache API responses when appropriate
5. Use React.memo() for expensive components
6. Avoid inline styles, use CSS classes

## Debugging

Enable debug logging:
```typescript
// In base.ts, set for development only:
if (process.env.NODE_ENV === 'development') {
  console.log('API Request:', url, options);
  console.log('API Response:', data);
}
```

## Common Issues & Solutions

### API not returning expected data
- Check API_REFERENCE.md for correct endpoint
- Verify authentication token is included
- Check browser network tab for actual response

### Components not updating after API call
- Ensure state is updated after async call completes
- Check useEffect dependencies
- Verify async/await is used correctly

### Auth errors (401/403)
- Ensure token is valid and not expired
- Check user has required role for endpoint
- Re-login if token expired
