import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiService, ProductDTO } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    categoryId: '',
    brandId: '',
    support: '',
    imageUrl: '',
    stock: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const productsRes = await apiService.getProducts();
      setProducts(productsRes.content || []);
      
      try {
        const categoriesRes = await apiService.getCategories();
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      } catch (e) {
        console.log('Categories not available');
        setCategories([]);
      }
      
      try {
        const brandsRes = await apiService.getBrands();
        setBrands(Array.isArray(brandsRes) ? brandsRes : []);
      } catch (e) {
        console.log('Brands not available');
        setBrands([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: ProductDTO) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        basePrice: product.basePrice || 0,
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        support: product.support || '',
        imageUrl: product.imageUrl || '',
        stock: product.stock || 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        basePrice: 0,
        categoryId: '',
        brandId: '',
        support: '',
        imageUrl: '',
        stock: 0
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, formData);
      } else {
        await apiService.createProduct(formData);
      }
      setShowDialog(false);
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await apiService.deleteProduct(id);
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Lỗi khi xóa sản phẩm');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản Lý Sản Phẩm</h1>
        <Button onClick={() => handleOpenDialog()}>+ Thêm Sản Phẩm</Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Hình Ảnh</th>
                  <th className="text-left p-4">Tên Sản Phẩm</th>
                  <th className="text-left p-4">Danh Mục</th>
                  <th className="text-left p-4">Thương Hiệu</th>
                  <th className="text-left p-4">Giá</th>
                  <th className="text-left p-4">Tồn Kho</th>
                  <th className="text-left p-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <img 
                        src={product.imageUrl || '/placeholder.png'} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">
                      {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                    </td>
                    <td className="p-4">
                      {brands.find(b => b.id === product.brandId)?.name || 'N/A'}
                    </td>
                    <td className="p-4">${product.basePrice.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={product.stock < 10 ? 'text-red-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                        >
                          Sửa
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tên Sản Phẩm</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Mô Tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giá Cơ Bản</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>

              <div>
                <Label>Tồn Kho</Label>
                <Input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Danh Mục</Label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Thương Hiệu</Label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.brandId}
                  onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Hỗ Trợ (OS)</Label>
              <Input
                value={formData.support}
                onChange={(e) => setFormData({...formData, support: e.target.value})}
                placeholder="Windows, Mac, Linux"
              />
            </div>

            <div>
              <Label>URL Hình Ảnh</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {editingProduct ? 'Cập Nhật' : 'Thêm Mới'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
