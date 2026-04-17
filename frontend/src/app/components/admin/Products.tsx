import { useState, useEffect } from "react";
import { productApi, categoryApi, brandApi, stockApi, productVariantApi } from "../../services/api";
import { ProductDTO, CategoryDTO, BrandDTO, ProductVariantDTO } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AdminPageWrapper } from "./PageWrapper";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "../ui/dialog";
import { Label } from "../ui/label";
import { 
  Search, 
  Plus, 
  Edit, 
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Trash2,
  Save,
  RefreshCcw,
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  FileUp
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import mammoth from 'mammoth';

export function Products() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariantDTO | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [newStock, setNewStock] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        productApi.getProducts(0, 1000),
        categoryApi.getCategories(),
        brandApi.getBrands()
      ]);
      
      // Handle paginated response
      const productsData = Array.isArray(productsRes) ? productsRes : (productsRes.content || []);
      
      // Remove duplicates based on product ID
      const uniqueProducts = productsData.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      setProducts(uniqueProducts);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const data = filteredProducts.map(product => {
      const category = categories.find(c => c.id === product.categoryId);
      const brand = brands.find(b => b.id === product.brandId);
      const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      
      return {
        'Tên sản phẩm': product.name,
        'Mô tả': product.description || '',
        'Giá gốc': product.basePrice,
        'Danh mục': category?.name || '',
        'Thương hiệu': brand?.name || '',
        'Hỗ trợ': product.support || '',
        'URL hình ảnh': product.imageUrl || '',
        'Tồn kho': totalStock,
        'Biến thể': product.variants?.length || 0
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sản phẩm');
    XLSX.writeFile(wb, `danh-sach-san-pham-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Đã xuất file Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Danh Sách Sản Phẩm', 20, 20);
    
    let y = 40;
    filteredProducts.forEach((product, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const category = categories.find(c => c.id === product.categoryId);
      const brand = brands.find(b => b.id === product.brandId);
      const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${product.name}`, 20, y);
      doc.setFontSize(10);
      doc.text(`Giá: ${product.basePrice.toLocaleString('vi-VN')}đ | Tồn kho: ${totalStock}`, 20, y + 5);
      doc.text(`Danh mục: ${category?.name || ''} | Thương hiệu: ${brand?.name || ''}`, 20, y + 10);
      y += 20;
    });
    
    doc.save(`danh-sach-san-pham-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Đã xuất file PDF');
  };

  const exportToWord = async () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Tên sản phẩm')] }),
          new TableCell({ children: [new Paragraph('Giá gốc')] }),
          new TableCell({ children: [new Paragraph('Danh mục')] }),
          new TableCell({ children: [new Paragraph('Thương hiệu')] }),
          new TableCell({ children: [new Paragraph('Tồn kho')] })
        ]
      })
    ];

    filteredProducts.forEach(product => {
      const category = categories.find(c => c.id === product.categoryId);
      const brand = brands.find(b => b.id === product.brandId);
      const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      
      tableRows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(product.name)] }),
          new TableCell({ children: [new Paragraph(product.basePrice.toString())] }),
          new TableCell({ children: [new Paragraph(category?.name || '')] }),
          new TableCell({ children: [new Paragraph(brand?.name || '')] }),
          new TableCell({ children: [new Paragraph(totalStock.toString())] })
        ]
      }));
    });

    const table = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE }
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: 'Danh Sách Sản Phẩm', heading: 'Heading1' }),
          table
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `danh-sach-san-pham-${new Date().toISOString().split('T')[0]}.docx`;
    link.click();
    toast.success('Đã xuất file Word');
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        await importFromExcel(file);
      } else if (fileExtension === 'csv') {
        await importFromCSV(file);
      } else if (fileExtension === 'docx') {
        await importFromWord(file);
      } else {
        toast.error('Định dạng file không được hỗ trợ. Chỉ hỗ trợ .xlsx, .xls, .csv, .docx');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Lỗi khi nhập dữ liệu');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const importFromExcel = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    await processImportData(jsonData);
  };

  const importFromCSV = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            await processImportData(results.data);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: reject
      });
    });
  };

  const importFromWord = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    // Word import is more complex, for now just show the text
    toast.info('Import từ Word chưa được hỗ trợ đầy đủ. Vui lòng sử dụng Excel hoặc CSV.');
  };

  const processImportData = async (data: any[]) => {
    let successCount = 0;
    let errorCount = 0;
    
    for (const row of data) {
      try {
        // Map column names (handle different languages)
        const productData = {
          name: row['Tên sản phẩm'] || row['Name'] || row['name'],
          description: row['Mô tả'] || row['Description'] || row['description'] || '',
          basePrice: parseFloat(row['Giá gốc'] || row['Price'] || row['price'] || '0'),
          categoryId: findCategoryId(row['Danh mục'] || row['Category'] || row['category']),
          brandId: findBrandId(row['Thương hiệu'] || row['Brand'] || row['brand']),
          support: row['Hỗ trợ'] || row['Support'] || row['support'] || '',
          imageUrl: row['URL hình ảnh'] || row['Image URL'] || row['imageUrl'] || ''
        };
        
        if (productData.name && productData.basePrice > 0) {
          await productApi.createProduct(productData);
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error importing row:', row, error);
        errorCount++;
      }
    }
    
    toast.success(`Đã nhập ${successCount} sản phẩm thành công, ${errorCount} lỗi`);
    loadData();
  };

  const findCategoryId = (categoryName: string): string => {
    if (!categoryName) return '';
    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    return category?.id || '';
  };

  const findBrandId = (brandName: string): string => {
    if (!brandName) return '';
    const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
    return brand?.id || '';
  };

  const handleUpdateStock = async () => {
    if (!selectedVariant || newStock < 0) {
      toast.error('Số lượng không hợp lệ');
      return;
    }

    try {
      await stockApi.updateStock(selectedVariant.id, newStock);
      toast.success('Cập nhật tồn kho thành công');
      setShowStockDialog(false);
      
      // Immediate UI update
      setProducts(prev => prev.map(p => ({
        ...p,
        variants: p.variants?.map(v => 
          v.id === selectedVariant.id ? { ...v, stock: newStock, availableStock: newStock } : v
        )
      })));
      
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          variants: editingProduct.variants?.map(v => 
            v.id === selectedVariant.id ? { ...v, stock: newStock, availableStock: newStock } : v
          )
        });
      }
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast.error(error.message || 'Không thể cập nhật tồn kho');
    }
  };

  const handleCreateVariant = async (variantData: Partial<ProductVariantDTO>) => {
    if (!editingProduct) return;

    try {
      const newVariant = await productVariantApi.createVariant(editingProduct.id, variantData);
      toast.success('Thêm biến thể thành công');
      setShowVariantDialog(false);
      
      // Immediate UI update
      const updatedVariants = [...(editingProduct.variants || []), newVariant];
      setEditingProduct({ ...editingProduct, variants: updatedVariants });
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...p, variants: updatedVariants } : p
      ));
    } catch (error: any) {
      console.error('Error creating variant:', error);
      toast.error(error.message || 'Không thể thêm biến thể');
    }
  };

  const handleUpdateVariant = async (variantData: Partial<ProductVariantDTO>) => {
    if (!editingProduct || !editingVariant) return;

    try {
      await productVariantApi.updateVariant(editingProduct.id, editingVariant.id, variantData);
      toast.success('Cập nhật biến thể thành công');
      setShowVariantDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error updating variant:', error);
      toast.error(error.message || 'Không thể cập nhật biến thể');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!editingProduct) return;
    if (!confirm('Bạn có chắc muốn xóa biến thể này?')) return;

    try {
      await productVariantApi.deleteVariant(editingProduct.id, variantId);
      toast.success('Xóa biến thể thành công');
      
      // Immediate UI update
      const updatedVariants = (editingProduct.variants || []).filter(v => v.id !== variantId);
      setEditingProduct({ ...editingProduct, variants: updatedVariants });
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...p, variants: updatedVariants } : p
      ));
    } catch (error: any) {
      console.error('Error deleting variant:', error);
      toast.error(error.message || 'Không thể xóa biến thể');
    }
  };

  const handleCreateProduct = async (productData: Partial<ProductDTO>) => {
    try {
      const newProduct = await productApi.createProduct(productData);
      toast.success('Thêm sản phẩm thành công');
      setShowDialog(false);
      // Immediate UI update
      setProducts(prev => [newProduct, ...prev]);
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Không thể thêm sản phẩm');
    }
  };

  const handleUpdateProduct = async (productData: Partial<ProductDTO>) => {
    if (!editingProduct) return;

    try {
      const updatedProduct = await productApi.updateProduct(editingProduct.id, productData);
      toast.success('Cập nhật sản phẩm thành công');
      setShowDialog(false);
      // Immediate UI update
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...p, ...updatedProduct } : p
      ));
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Không thể cập nhật sản phẩm');
    }
  };

  const handleSmartImport = async () => {
    if (!importText.trim()) {
      toast.error('Vui lòng nhập nội dung cần nhập');
      return;
    }

    try {
      setImporting(true);
      const rows = importText.split('\n\n'); // Split by double newline for product blocks
      let successCount = 0;
      
      for (const block of rows) {
        if (!block.trim()) continue;
        
        const lines = block.split('\n');
        const name = lines[0].trim();
        const priceLine = lines.find(l => l.toLowerCase().includes('giá'));
        const categoryLine = lines.find(l => l.toLowerCase().includes('danh mục'));
        const brandLine = lines.find(l => l.toLowerCase().includes('thương hiệu'));
        const supportLine = lines.find(l => l.toLowerCase().includes('hỗ trợ'));
        
        const price = priceLine ? parseInt(priceLine.replace(/[^0-9]/g, '')) : 0;
        const categoryName = categoryLine ? categoryLine.split(':')[1]?.trim() : '';
        const brandName = brandLine ? brandLine.split(':')[1]?.trim() : '';
        const support = supportLine ? supportLine.split(':')[1]?.trim() : '';
        
        const categoryId = findCategoryId(categoryName);
        const brandId = findBrandId(brandName);
        
        if (name && price > 0 && categoryId && brandId) {
          try {
            const newProduct = await productApi.createProduct({
              name,
              basePrice: price,
              categoryId,
              brandId,
              support,
              description: block.substring(block.indexOf(name) + name.length).trim()
            });
            setProducts(prev => [newProduct, ...prev]);
            successCount++;
          } catch (e) {
            console.error('Failed to import product:', name, e);
          }
        }
      }
      
      toast.success(`Đã nhập thành công ${successCount} sản phẩm`);
      setShowImportDialog(false);
      setImportText('');
    } catch (error: any) {
      toast.error('Lỗi khi xử lý dữ liệu nhập');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await productApi.deleteProduct(productId);
      toast.success('Xóa sản phẩm thành công');
      // Immediate UI update
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Không thể xóa sản phẩm');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const stats = {
    total: products.length,
    inStock: products.filter(p => {
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      return totalStock > 10;
    }).length,
    lowStock: products.filter(p => {
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      return totalStock > 0 && totalStock <= 10;
    }).length,
    outOfStock: products.filter(p => {
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      return totalStock === 0;
    }).length,
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Hết hàng</Badge>;
    } else if (stock <= 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Sắp hết</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Còn hàng</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Đang tải...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper 
      title="Quản Lý Sản Phẩm" 
      description="Quản lý sản phẩm, biến thể và tồn kho"
      actions={(
        <>
          <Button onClick={loadData} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={exportToExcel} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button onClick={exportToPDF} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button onClick={exportToWord} variant="outline">
            <File className="w-4 h-4 mr-2" />
            Xuất Word
          </Button>
          <Button onClick={() => setShowImportDialog(true)} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <FileUp className="w-4 h-4 mr-2" />
            Nhập nhanh
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('file-import')?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Nhập dữ liệu
          </Button>
          <input
            id="file-import"
            type="file"
            accept=".xlsx,.xls,.csv,.docx"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <Button onClick={() => { setEditingProduct(null); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </>
      )}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng Sản Phẩm</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Còn Hàng</p>
                <p className="text-2xl font-bold">{stats.inStock}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sắp Hết</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hết Hàng</p>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle>Danh Sách Sản Phẩm</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button onClick={() => { setEditingProduct(null); setShowDialog(true); }} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sản Phẩm
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded px-4 py-2 min-w-[200px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Sản Phẩm</th>
                  <th className="text-left p-4 font-semibold">Danh Mục</th>
                  <th className="text-left p-4 font-semibold">Thương Hiệu</th>
                  <th className="text-left p-4 font-semibold">Giá Gốc</th>
                  <th className="text-left p-4 font-semibold">Biến Thể</th>
                  <th className="text-left p-4 font-semibold">Tồn Kho</th>
                  <th className="text-left p-4 font-semibold">Trạng Thái</th>
                  <th className="text-left p-4 font-semibold">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const category = categories.find(c => c.id === product.categoryId);
                  const brand = brands.find(b => b.id === product.brandId);
                  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.imageUrl || 'https://via.placeholder.com/50'} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.support}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{category?.name || '-'}</td>
                      <td className="p-4">{brand?.name || '-'}</td>
                      <td className="p-4 font-semibold">{product.basePrice.toLocaleString('vi-VN')}đ</td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {product.variants?.length || 0} biến thể
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">{totalStock}</span>
                      </td>
                      <td className="p-4">
                        {getStockBadge(totalStock)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setEditingProduct(product); setShowDialog(true); }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Sửa
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchQuery || categoryFilter !== 'ALL' 
                ? 'Không tìm thấy sản phẩm nào' 
                : 'Chưa có sản phẩm nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Update Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent aria-describedby="stock-dialog-description">
          <DialogHeader>
            <DialogTitle>Cập Nhật Tồn Kho</DialogTitle>
            <DialogDescription id="stock-dialog-description">
              Nhập số lượng tồn kho mới cho biến thể
            </DialogDescription>
          </DialogHeader>
          {selectedVariant && (
            <div className="space-y-4">
              <div>
                <Label>Biến thể</Label>
                <div className="text-sm text-gray-600 mt-1">
                  {selectedVariant.color} - {selectedVariant.switchType}
                </div>
              </div>
              <div>
                <Label>Tồn kho hiện tại: {selectedVariant.stock ?? selectedVariant.availableStock ?? 0}</Label>
                {selectedVariant.availableStock !== undefined && selectedVariant.availableStock !== selectedVariant.stock && (
                  <div className="text-xs text-gray-500 mt-1">
                    Khả dụng: {selectedVariant.availableStock} (Đã đặt trước: {(selectedVariant.stock ?? 0) - selectedVariant.availableStock})
                  </div>
                )}
                <Input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>Hủy</Button>
            <Button onClick={handleUpdateStock}>Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="product-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </DialogTitle>
            <DialogDescription id="product-dialog-description">
              {editingProduct ? 'Cập nhật thông tin sản phẩm' : 'Tạo sản phẩm mới'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            categories={categories}
            brands={brands}
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => setShowDialog(false)}
          />
          {editingProduct && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Biến Thể & Tồn Kho</Label>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingVariant(null);
                    setShowVariantDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm Biến Thể
                </Button>
              </div>
              <div className="space-y-2">
                {editingProduct.variants && editingProduct.variants.length > 0 ? (
                  editingProduct.variants.map(variant => {
                    const stock = variant.stock ?? variant.availableStock ?? 0;
                    const available = variant.availableStock ?? 0;
                    return (
                      <div key={variant.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {variant.color} - {variant.switchType}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Kết nối: {variant.connectionType} | Keycap: {variant.keycapSet}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">Tồn kho:</span>
                            <span className={`text-sm font-bold ${
                              available === 0 ? 'text-red-600' : 
                              available <= 10 ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              {stock}
                            </span>
                            {available !== stock && (
                              <span className="text-xs text-gray-500">
                                (Khả dụng: {available})
                              </span>
                            )}
                            {getStockBadge(available)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVariant(variant);
                              setNewStock(stock);
                              setShowDialog(false);
                              setShowStockDialog(true);
                            }}
                          >
                            Tồn Kho
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingVariant(variant);
                              setShowVariantDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteVariant(variant.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">Không có biến thể</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Variant Edit/Create Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent aria-describedby="variant-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Chỉnh Sửa Biến Thể' : 'Thêm Biến Thể Mới'}
            </DialogTitle>
            <DialogDescription id="variant-dialog-description">
              {editingVariant ? 'Cập nhật thông tin biến thể' : 'Tạo biến thể mới'}
            </DialogDescription>
          </DialogHeader>
          <VariantForm
            variant={editingVariant}
            onSubmit={editingVariant ? handleUpdateVariant : handleCreateVariant}
            onCancel={() => setShowVariantDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Smart Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="smart-import-description">
          <DialogHeader>
            <DialogTitle>Nhập Nhanh Sản Phẩm (Smart Import)</DialogTitle>
            <DialogDescription id="smart-import-description">
              Dán nội dung từ Word hoặc Excel vào đây. Định dạng mỗi sản phẩm ngăn cách bằng 2 dấu xuống dòng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 space-y-2">
              <p className="font-bold">Mẫu định dạng chuẩn:</p>
              <pre className="font-mono">
                Bàn phím cơ Keychron K2{"\n"}
                Giá: 1.500.000{"\n"}
                Danh mục: Bàn phím cơ{"\n"}
                Thương hiệu: Keychron{"\n"}
                Hỗ trợ: Windows/macOS{"\n"}
                Mô tả chi tiết...
              </pre>
            </div>
            <textarea
              className="w-full h-64 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Dán dữ liệu vào đây..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Hủy</Button>
            <Button onClick={handleSmartImport} disabled={importing}>
              {importing ? 'Đang xử lý...' : 'Bắt đầu Nhập'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
}


// Product Form Component
interface ProductFormProps {
  product: ProductDTO | null;
  categories: CategoryDTO[];
  brands: BrandDTO[];
  onSubmit: (data: Partial<ProductDTO>) => void;
  onCancel: () => void;
}

function ProductForm({ product, categories, brands, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<ProductDTO>>({
    name: product?.name || '',
    description: product?.description || '',
    basePrice: product?.basePrice || 0,
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || '',
    support: product?.support || '',
    imageUrl: product?.imageUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Tên sản phẩm *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="basePrice">Giá gốc *</Label>
          <Input
            id="basePrice"
            type="number"
            min="0"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="categoryId">Danh mục *</Label>
          <select
            id="categoryId"
            className="w-full border rounded px-3 py-2"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="brandId">Thương hiệu *</Label>
          <select
            id="brandId"
            className="w-full border rounded px-3 py-2"
            value={formData.brandId}
            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
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
        <Label htmlFor="description">Mô tả</Label>
        <textarea
          id="description"
          className="w-full border rounded px-3 py-2 min-h-[100px]"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="support">Hỗ trợ</Label>
        <Input
          id="support"
          value={formData.support}
          onChange={(e) => setFormData({ ...formData, support: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="imageUrl">URL hình ảnh</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          {product ? 'Cập Nhật' : 'Thêm Mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Variant Form Component
interface VariantFormProps {
  variant: ProductVariantDTO | null;
  onSubmit: (data: Partial<ProductVariantDTO>) => void;
  onCancel: () => void;
}

function VariantForm({ variant, onSubmit, onCancel }: VariantFormProps) {
  const [formData, setFormData] = useState<Partial<ProductVariantDTO>>({
    switchType: variant?.switchType || '',
    color: variant?.color || '',
    keycapSet: variant?.keycapSet || '',
    connectionType: variant?.connectionType || '',
    priceModifier: variant?.priceModifier || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="switchType">Loại switch</Label>
          <Input
            id="switchType"
            value={formData.switchType}
            onChange={(e) => setFormData({ ...formData, switchType: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="color">Màu sắc</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="keycapSet">Bộ keycap</Label>
          <Input
            id="keycapSet"
            value={formData.keycapSet}
            onChange={(e) => setFormData({ ...formData, keycapSet: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="connectionType">Kết nối</Label>
          <select
            id="connectionType"
            className="w-full border rounded px-3 py-2"
            value={formData.connectionType}
            onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
          >
            <option value="">Chọn loại kết nối</option>
            <option value="USB">USB</option>
            <option value="Bluetooth">Bluetooth</option>
            <option value="Wireless">Wireless</option>
          </select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="priceModifier">Điều chỉnh giá</Label>
          <Input
            id="priceModifier"
            type="number"
            step="0.01"
            value={formData.priceModifier}
            onChange={(e) => setFormData({ ...formData, priceModifier: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          {variant ? 'Cập Nhật' : 'Thêm Mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}
