import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: 0, bin: '' });
  const [editItem, setEditItem] = useState({ name: '', sku: '', quantity: 0, bin: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const response = await axios.get('http://localhost:5000/api/inventory');
    setItems(response.data);
  };

  const handleAddItem = () => {
    setNewItem({ name: '', sku: '', quantity: 0, bin: '' });
    setShowAddModal(true);
  };

  const handleEditItem = (id) => {
    const item = items.find(item => item._id === id);
    setEditItem({ ...item });
    setSelectedItem(id);
    setShowEditModal(true);
  };

  const handleDeleteItem = (id) => {
    setSelectedItem(id);
    setShowDeleteConfirm(true);
  };

  const handleSaveAdd = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/inventory', newItem);
      setItems([...items, response.data]);
      setShowAddModal(false);
      setNewItem({ name: '', sku: '', quantity: 0, bin: '' });
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/inventory/${selectedItem}`, editItem);
      setItems(items.map(item => item._id === selectedItem ? response.data : item));
      setShowEditModal(false);
    } catch (err) {
      console.error('Error editing item:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${selectedItem}`);
      setItems(items.filter(item => item._id !== selectedItem));
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setNewItem({ name: '', sku: '', quantity: 0, bin: '' });
    setEditItem({ name: '', sku: '', quantity: 0, bin: '' });
    setSelectedItem(null);
  };

  const filteredItems = items.filter(item => 
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.sku.includes(searchTerm)) &&
    (!filterLowStock || item.quantity < 50)
  );

  return (
    <div className="p-6 ml-64">
      <h1 className="text-3xl font-bold mb-4">Inventory</h1>
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filterLowStock}
            onChange={(e) => setFilterLowStock(e.target.checked)}
            className="mr-2"
          /> Low Stock
        </label>
        <button onClick={handleAddItem} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add New Item
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Names</th>
            <th className="border p-2">Stock Keeping Units</th>
            <th className="border p-2">Quantitys</th>
            <th className="border p-2">Bins</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item._id} className={item.quantity < 50 ? 'bg-red-200' : ''}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.sku}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">{item.bin}</td>
              <td className="border p-2">
                <button onClick={() => handleEditItem(item._id)} className="bg-yellow-500 text-white p-1 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteItem(item._id)} className="bg-red-500 text-white p-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <input
              type="text"
              placeholder="mouse"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="USB-03-BLK"
              value={newItem.sku}
              onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="number"
              placeholder="0000"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Rack-12"
              value={newItem.bin}
              onChange={(e) => setNewItem({ ...newItem, bin: e.target.value })}
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

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Item</h2>
            <input
              type="text"
              placeholder="Name"
              value={editItem.name}
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="SKU"
              value={editItem.sku}
              onChange={(e) => setEditItem({ ...editItem, sku: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={editItem.quantity}
              onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Bin"
              value={editItem.bin}
              onChange={(e) => setEditItem({ ...editItem, bin: e.target.value })}
              className="p-2 border rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={handleSaveEdit} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                Save
              </button>
              <button onClick={handleCancel} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this item?</p>
            <div className="flex justify-center space-x-4 mt-4">
              <button onClick={handleDeleteConfirm} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                Yes
              </button>
              <button onClick={handleCancel} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
