import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getUserOrders(user.id, 0, 10);
      setOrders(response.data.content);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading orders...</div></div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Orders</h1>

      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3>Order #{order.id}</h3>
                  <p style={{ color: '#666' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                    ${order.totalPrice.toFixed(2)}
                  </div>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px',
                    backgroundColor: order.status === 'DELIVERED' ? '#e8f5e9' : '#fff3e0',
                    color: order.status === 'DELIVERED' ? '#2e7d32' : '#e65100',
                    marginTop: '0.5rem'
                  }}>
                    {order.status}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                <p><strong>Items:</strong> {order.items?.length || 0} product(s)</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
