import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!shippingAddress.trim()) {
      setError('Please enter shipping address');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress,
      };

      await orderApi.createOrder(user.id, orderData);
      clearCart();
      setError(null);
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      setError('Failed to place order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h1>Your Cart is Empty</h1>
        <p style={{ marginBottom: '2rem' }}>Add some keyboards to get started!</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>

      {error && <div className="error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ color: '#666' }}>${item.price}</div>
              </div>
              <div className="cart-item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                />
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <div style={{ fontWeight: 'bold', marginRight: '1rem' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1rem' }}>Order Summary</h2>
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Shipping:</span>
              <span>Free</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="form-group">
            <label>Shipping Address</label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your shipping address"
              rows="4"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCheckout}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
