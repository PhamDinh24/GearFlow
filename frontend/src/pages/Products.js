import React, { useState, useEffect, useContext } from 'react';
import { productApi } from '../api/productApi';
import { CartContext } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    switchType: '',
  });
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchProducts();
  }, [page, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;
      if (filters.brand || filters.minPrice || filters.maxPrice || filters.switchType) {
        response = await productApi.filterProducts(filters, page, 10);
      } else {
        response = await productApi.getAllProducts(page, 10);
      }
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  if (loading) return <div className="container"><div className="loading">Loading products...</div></div>;

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>Mechanical Keyboards</h1>

      {error && <div className="error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <h3>Filters</h3>
          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              placeholder="e.g., Corsair"
            />
          </div>
          <div className="form-group">
            <label>Min Price</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Max Price</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="10000"
            />
          </div>
          <div className="form-group">
            <label>Switch Type</label>
            <select name="switchType" value={filters.switchType} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="LINEAR">Linear</option>
              <option value="TACTILE">Tactile</option>
              <option value="CLICKY">Clicky</option>
            </select>
          </div>
        </div>

        <div>
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">⌨️</div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-brand">{product.brand}</div>
                  <div className="product-price">${product.price}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Stock: {product.stock}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={page === i ? 'active' : ''}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
