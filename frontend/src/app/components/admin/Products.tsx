import { useState, useEffect } from "react";
import { productApi, categoryApi, brandApi, stockApi, productVariantApi } from "../../services/api";
import { ProductDTO, CategoryDTO, BrandDTO, ProductVariantDTO } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Pagination } from "../ui/pagination";
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
import { 
  exportToExcel, 
  exportToPDF, 
  exportToWord,
  exportToExcelTable,
  formatDateForExport,
  formatCurrencyForExport,
  generateFilename
} from "../../utils/exportUtils";

const ITEMS_PER_PAGE = 12;

export function Products() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
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
      
      // Sort products by createdAt (newest first) if available, otherwise by name
      const sortedProducts = uniqueProducts.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.name.localeCompare(b.name);
      });
      
      setProducts(sortedProducts);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcelHandler = () => {
    const metadata = {
      'Hệ thống': 'GearFlow Management',
      'Ngày xuất': formatDateForExport(new Date().toISOString()),
      'Người xuất': 'Administrator',
      'Tổng số': `${filteredProducts.length} sản phẩm`,
    };

    const headers = ['STT', 'Tên sản phẩm', 'Giá gốc', 'Danh mục', 'Thương hiệu', 'Tồn kho', 'Biến thể', 'Trạng thái'];
    
    const data = filteredProducts.map((product, index) => {
      const category = categories.find(c => c.id === product.categoryId);
      const brand = brands.find(b => b.id === product.brandId);
      const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      
      return [
        index + 1,
        product.name,
        formatCurrencyForExport(product.basePrice),
        category?.name || '-',
        brand?.name || '-',
        totalStock,
        product.variants?.length || 0,
        totalStock === 0 ? 'Hết hàng' : totalStock <= 10 ? 'Sắp hết' : 'Còn hàng',
      ];
    });

    const result = exportToExcelTable(
      'DANH SÁCH SẢN PHẨM',
      metadata,
      headers,
      data,
      generateFilename('danh-sach-san-pham')
    );
    
    if (result.success) {
      toast.success('Đã xuất file Excel thành công');
    } else {
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  const exportToPDFHandler = () => {
    const headers = ['Tên sản phẩm', 'Giá gốc', 'Danh mục', 'Thương hiệu', 'Tồn kho', 'Biến thể', 'Ngày tạo'];
    const data = filteredProducts.map((product) => {
      const category = categories.find(c => c.id === product.categoryId);
      const brand = brands.find(b => b.id === product.brandId);
      const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      
      return [
        product.name,
        formatCurrencyForExport(product.basePrice),
        category?.name || '-',
        brand?.name || '-',
        String(totalStock),
        `${product.variants?.length || 0} biến thể`,
        product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : '-',
      ];
    });

    const result = exportToPDF(
      'Danh Sách Sản Phẩm',
      headers,
      data,
      generateFilename('danh-sach-san-pham')
    );
    
    if (result.success) {
      toast.success('Đã xuất file PDF thành công');
    } else {
      toast.error('Lỗi khi xuất file PDF');
    }
  };

  const exportToWordHandler = async () => {
    const headers = ['Tên sản phẩm', 'Giá gốc', 'Danh mục', 'Thương hiệu', 'Tồn kho', 'Biến thể', 'Ngày tạo'];
    const data = filteredProducts.map((product) => {
      const category = categories.find(c => c.id === product.categoryId);
      const brand = brands.find(b => b.id === product.brandId);
      const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      
      return [
        product.name,
        formatCurrencyForExport(product.basePrice),
        category?.name || '-',
        brand?.name || '-',
        String(totalStock),
        `${product.variants?.length || 0} biến thể`,
        product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : '-',
      ];
    });

    const result = await exportToWord(
      'Danh Sách Sản Phẩm',
      headers,
      data,
      generateFilename('danh-sach-san-pham')
    );
    
    if (result.success) {
      toast.success('Đã xuất file Word thành công');
    } else {
      toast.error('Lỗi khi xuất file Word');
    }
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

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

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
          <Button onClick={exportToExcelHandler} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button onClick={exportToPDFHandler} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button onClick={exportToWordHandler} variant="outline">
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
      {/* Stats Cards - Enhanced with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Tổng Sản Phẩm</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.total}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Tất cả sản phẩm</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-green-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Còn Hàng</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.inStock}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Tồn kho tốt</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-yellow-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Sắp Hết</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.lowStock}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Cần nhập thêm</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '45%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-red-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Hết Hàng</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.outOfStock}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Cần nhập ngay</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '25%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table - Enhanced */}
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Danh Sách Sản Phẩm</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">{filteredProducts.length} sản phẩm</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button onClick={() => { setEditingProduct(null); setShowDialog(true); }} size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sản Phẩm
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
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
              className="border rounded-lg px-4 py-2 min-w-[200px] bg-white hover:border-blue-400 transition-colors"
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
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Sản Phẩm</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Danh Mục</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Thương Hiệu</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Giá Gốc</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Biến Thể</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Tồn Kho</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Trạng Thái</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => {
                  const category = categories.find(c => c.id === product.categoryId);
                  const brand = brands.find(b => b.id === product.brandId);
                  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={product.imageUrl || 'https://via.placeholder.com/50'} 
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow border-2 border-gray-100"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                              <Package className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{product.support}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 font-medium">
                          {category?.name || '-'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-medium">
                          {brand?.name || '-'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {product.basePrice.toLocaleString('vi-VN')}đ
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold">
                          {product.variants?.length || 0} biến thể
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={`text-2xl font-black ${
                          totalStock === 0 ? 'text-red-600' :
                          totalStock <= 10 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>{totalStock}</span>
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
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Sửa
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="hover:shadow-lg transition-all"
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
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                {searchQuery || categoryFilter !== 'ALL' 
                  ? 'Không tìm thấy sản phẩm nào' 
                  : 'Chưa có sản phẩm nào'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
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
