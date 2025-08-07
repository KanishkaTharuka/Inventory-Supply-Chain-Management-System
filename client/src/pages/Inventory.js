import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 
const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: 0, supplierId: '', bin: '' });
  const [editItem, setEditItem] = useState({ name: '', sku: '', quantity: 0, bin: '', supplierId: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setItems(response.data);
      setInventory(response.data);
    } catch (err) {
      setError('Error fetching inventory: ' + err.message);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      setError('Error fetching suppliers: ' + err.message);
    }
  };

  const handleAddItem = () => {
    setNewItem({ name: '', sku: '', quantity: 0, supplierId: '', bin: '' });
    setShowAddModal(true);
    setError(null);
  };

  const handleEditItem = (id) => {
    const item = items.find(item => item._id === id);
    setEditItem({ ...item });
    setSelectedItem(id);
    setShowEditModal(true);
    setError(null);
  };

  const handleDeleteItem = (id) => {
    setSelectedItem(id);
    setShowDeleteConfirm(true);
    setError(null);
  };

  const handleSaveAdd = async () => {
    try {
      if (!newItem.name || !newItem.sku || !newItem.supplierId || !newItem.bin) {
        setError('All fields (name, SKU, supplier, bin) are required.');
        return;
      }
      if (isNaN(newItem.quantity) || newItem.quantity < 0) {
        setError('Quantity must be a non-negative number.');
        return;
      }
      const response = await axios.post('http://localhost:5000/api/inventory', {
        name: newItem.name,
        sku: newItem.sku,
        quantity: Number(newItem.quantity),
        supplierId: newItem.supplierId,
        bin: newItem.bin
      });
      setItems([...items, response.data]);
      setInventory([...inventory, response.data]);
      setShowAddModal(false);
      setNewItem({ name: '', sku: '', quantity: 0, supplierId: '', bin: '' });
      setError(null);
    } catch (err) {
      setError('Error adding item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!editItem.name || !editItem.sku || !editItem.supplierId || !editItem.bin) {
        setError('All fields (name, SKU, supplier, bin) are required.');
        return;
      }
      if (isNaN(editItem.quantity) || editItem.quantity < 0) {
        setError('Quantity must be a non-negative number.');
        return;
      }
      const response = await axios.put(`http://localhost:5000/api/inventory/${selectedItem}`, editItem);
      setItems(items.map(item => item._id === selectedItem ? response.data : item));
      setInventory(inventory.map(item => item._id === selectedItem ? response.data : item));
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      setError('Error editing item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${selectedItem}`);
      setItems(items.filter(item => item._id !== selectedItem));
      setInventory(inventory.filter(item => item._id !== selectedItem));
      setShowDeleteConfirm(false);
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setNewItem({ name: '', sku: '', quantity: 0, supplierId: '', bin: '' });
    setEditItem({ name: '', sku: '', quantity: 0, bin: '', supplierId: '' });
    setSelectedItem(null);
    setError(null);
  };

  const filteredItems = items.filter(item => 
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.sku.includes(searchTerm)) &&
    (!filterLowStock || item.quantity < 50)
  );

  const getSupplierName = (supplierId) => {
    // Check if supplierId is an object (populated) or just an ID
    if (typeof supplierId === 'object' && supplierId.name) {
      return supplierId.name;
    }
    const supplier = suppliers.find(s => s._id.toString() === supplierId?.toString());
    return supplier ? supplier.name : 'N/A';
  };

  return (
    <div className="p-6 ml-64">
      <h1 className="text-3xl font-bold mb-4">Inventory</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
            <th className="border p-2">Name</th>
            <th className="border p-2">SKU</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2">Bin</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item._id} className={item.quantity < 50 ? 'bg-red-200' : ''}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.sku}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">{getSupplierName(item.supplierId)}</td>
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
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="p-2 border rounded w-full mb-2"
              required
            />
            <input
              type="text"
              placeholder="SKU"
              value={newItem.sku}
              onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
              className="p-2 border rounded w-full mb-2"
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="p-2 border rounded w-full mb-2"
              required
            />
            <select
              value={newItem.supplierId}
              onChange={(e) => setNewItem({ ...newItem, supplierId: e.target.value })}
              className="p-2 border rounded w-full mb-2"
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Bin"
              value={newItem.bin}
              onChange={(e) => setNewItem({ ...newItem, bin: e.target.value })}
              className="p-2 border rounded w-full mb-4"
              required
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
              required
            />
            <input
              type="text"
              placeholder="SKU"
              value={editItem.sku}
              onChange={(e) => setEditItem({ ...editItem, sku: e.target.value })}
              className="p-2 border rounded w-full mb-2"
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={editItem.quantity}
              onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
              className="p-2 border rounded w-full mb-2"
              required
            />
            <select
              value={editItem.supplierId}
              onChange={(e) => setEditItem({ ...editItem, supplierId: e.target.value })}
              className="p-2 border rounded w-full mb-2"
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Bin"
              value={editItem.bin}
              onChange={(e) => setEditItem({ ...editItem, bin: e.target.value })}
              className="p-2 border rounded w-full mb-4"
              required
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