import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState({ customer: '', date: '', status: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({ productId: '', quantity: 0, customer: '' });
  const [returnDetails, setReturnDetails] = useState({ orderId: '', items: [], reason: '' });
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchInventoryItems();
  }, []);

  const fetchOrders = async () => {
    const response = await axios.get('http://localhost:5000/api/orders');
    setOrders(response.data);
  };

  const fetchInventoryItems = async () => {
    const response = await axios.get('http://localhost:5000/api/inventory');
    setInventoryItems(response.data);
  };

  const handleAddOrder = () => {
    setNewOrder({ productId: '', quantity: 0, customer: '' });
    setShowAddModal(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${id}`, { status: newStatus });
      setOrders(orders.map(order => order._id === id ? response.data : order));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSaveAdd = async () => {
    try {
      // Check if we have enough inventory
      const product = inventoryItems.find(item => item._id === newOrder.productId);
      if (!product) {
        alert('Product not found');
        return;
      }

      if (product.quantity < newOrder.quantity) {
        alert(`Not enough inventory! Only ${product.quantity} units available.`);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/orders', newOrder);
      setOrders([...orders, response.data]);

      // Update inventory quantity
      const updatedProduct = {
        ...product,
        quantity: product.quantity - newOrder.quantity
      };

      await axios.put(`http://localhost:5000/api/inventory/${product._id}`, updatedProduct);
      
      // Check if inventory is low after order
      if (updatedProduct.quantity <= 50) { // You can adjust this threshold
        alert(`Low inventory alert: ${product.name} has only ${updatedProduct.quantity} units left!`);
      }

      // Refresh inventory items
      fetchInventoryItems();
      
      setShowAddModal(false);
      setNewOrder({ productId: '', quantity: 0, customer: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding order');
    }
  };

  const handleReturnOrder = (id) => {
    const order = orders.find(order => order._id === id);
    setReturnDetails({ orderId: order.orderId, items: order.productId?.name || 'N/A', reason: '' });
    setSelectedOrder(id);
    setShowReturnModal(true);
  };

  const handleSaveReturn = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/orders/${selectedOrder}/return`, {
        orderId: returnDetails.orderId,
        items: returnDetails.items,
        reason: returnDetails.reason
      });
      setOrders(orders.map(order => order._id === selectedOrder ? response.data.order : order));
      setShowReturnModal(false);
      setReturnDetails({ orderId: '', items: [], reason: '' });
    } catch (err) {
      console.error('Error processing return:', err.response?.data?.message || err.message);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowReturnModal(false);
    setNewOrder({ productId: '', quantity: 0, customer: '' });
    setReturnDetails({ orderId: '', items: [], reason: '' });
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(filter.customer.toLowerCase()) &&
    (!filter.date || order.date?.includes(filter.date)) &&
    (!filter.status || order.status === filter.status)
  );

  return (
    <div className="p-6 ml-64">
      <h1 className="text-3xl font-bold mb-4">Orders</h1>
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Filter by customer..."
          value={filter.customer}
          onChange={(e) => setFilter({ ...filter, customer: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Filter by date..."
          value={filter.date}
          onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          className="p-2 border rounded"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Returned">Returned</option>
        </select>
        <button onClick={handleAddOrder} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add New Order
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Customer</th>
            <th className="border p-2">Product</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order._id}>
              <td className="border p-2">{order.customer}</td>
              <td className="border p-2">{order.productId?.name || 'N/A'}</td>
              <td className="border p-2">{order.quantity}</td>
              <td className="border p-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Returned">Returned</option>
                </select>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleReturnOrder(order._id)}
                  className="bg-yellow-500 text-white p-1 rounded mr-2"
                  disabled={order.status !== 'Delivered'}
                >
                  Return
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Order</h2>
            <select
              value={newOrder.productId}
              onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            >
              <option value="">Select Product</option>
              {inventoryItems.map(item => (
                <option 
                  key={item._id} 
                  value={item._id}
                  className={item.quantity <= 10 ? 'text-red-600' : ''}
                >
                  {item.name} ({item.quantity} in stock)
                  {item.quantity <= 10 ? ' - Low Stock!' : ''}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Customer"
              value={newOrder.customer}
              onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
              className="p-2 border rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={handleSaveAdd} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                Save
              </button>
              <button onClick={handleCancel} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Order Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Process Return</h2>
            <input
              type="text"
              placeholder="Order ID"
              value={returnDetails.orderId}
              readOnly
              className="p-2 border rounded w-full mb-2 bg-gray-100"
            />
            <input
              type="text"
              placeholder="Items"
              value={returnDetails.items}
              readOnly
              className="p-2 border rounded w-full mb-2 bg-gray-100"
            />
            <input
              type="text"
              placeholder="Reason for Return"
              value={returnDetails.reason}
              onChange={(e) => setReturnDetails({ ...returnDetails, reason: e.target.value })}
              className="p-2 border rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={handleSaveReturn} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                Submit Return
              </button>
              <button onClick={handleCancel} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;