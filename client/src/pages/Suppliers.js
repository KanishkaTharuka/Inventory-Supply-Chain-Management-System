import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: { email: '', phone: '' }, products: [] });
  const [editSupplier, setEditSupplier] = useState({ name: '', contact: { email: '', phone: '' }, products: [] });
  const [selectedSupplierItems, setSelectedSupplierItems] = useState([]);
  const [showItemsModal, setShowItemsModal] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const response = await axios.get('http://localhost:5000/api/suppliers');
    setSuppliers(response.data);
  };

  const fetchSupplierItems = async (supplierId) => {
    const response = await axios.get(`http://localhost:5000/api/inventory?supplierId=${supplierId}`);
    setSelectedSupplierItems(response.data);
    setShowItemsModal(true);
  };

  const handleAddSupplier = () => {
    setNewSupplier({ name: '', contact: { email: '', phone: '' }, products: [] });
    setShowAddModal(true);
  };

  const handleEditSupplier = (id) => {
    const supplier = suppliers.find(sup => sup._id === id);
    setEditSupplier({ ...supplier });
    setSelectedSupplier(id);
    setShowEditModal(true);
  };

  const handleDeleteSupplier = (id) => {
    setSelectedSupplier(id);
    setShowDeleteConfirm(true);
  };

  // const handleSendPO = async (id) => {
  //   try {
  //     const response = await axios.post(`http://localhost:5000/api/suppliers/${id}/send-po`);
  //     setSuppliers(suppliers.map(sup => sup._id === id ? response.data : sup));
  //   } catch (err) {
  //     console.error('Error sending PO:', err.response?.data?.message || err.message);
  //   }
  // };

  const handleSaveAdd = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/suppliers', newSupplier);
      setSuppliers([...suppliers, response.data]);
      setShowAddModal(false);
      setNewSupplier({ name: '', contact: { email: '', phone: '' }, products: [] });
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/suppliers/${selectedSupplier}`, editSupplier);
      setSuppliers(suppliers.map(sup => sup._id === selectedSupplier ? response.data : sup));
      setShowEditModal(false);
    } catch (err) {
      console.error('Error editing supplier:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/suppliers/${selectedSupplier}`);
      setSuppliers(suppliers.filter(sup => sup._id !== selectedSupplier));
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setShowItemsModal(false);
    setNewSupplier({ name: '', contact: { email: '', phone: '' }, products: [] });
    setEditSupplier({ name: '', contact: { email: '', phone: '' }, products: [] });
    setSelectedSupplier(null);
    setSelectedSupplierItems([]);
  };

  return (
    <div className="p-6 ml-64">
      <h1 className="text-3xl font-bold mb-4">Suppliers</h1>
      <button onClick={handleAddSupplier} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4">
        Add New Supplier
      </button>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Products</th>
            <th className="border p-2">PO Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier._id}>
              <td className="border p-2">{supplier.name}</td>
              <td className="border p-2">{supplier.contact.email} {supplier.contact.phone && `| ${supplier.contact.phone}`}</td>
              <td className="border p-2">{supplier.products.join(', ')}</td>
              <td className="border p-2">{supplier.poStatus}</td>
              <td className="border p-2">
                <button onClick={() => handleEditSupplier(supplier._id)} className="bg-yellow-500 text-white p-1 rounded mr-2">
                  Edit
                </button>
                <button onClick={() => handleDeleteSupplier(supplier._id)} className="bg-red-500 text-white p-1 rounded mr-2">
                  Delete
                </button>
                {/* <button onClick={() => handleSendPO(supplier._id)} className="bg-green-500 text-white p-1 rounded mr-2">
                  Send PO
                </button> */}
                <button onClick={() => fetchSupplierItems(supplier._id)} className="bg-blue-500 text-white p-1 rounded">
                  View Items
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Supplier</h2>
            <input
              type="text"
              placeholder="Name"
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newSupplier.contact.email}
              onChange={(e) => setNewSupplier({ ...newSupplier, contact: { ...newSupplier.contact, email: e.target.value } })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newSupplier.contact.phone}
              onChange={(e) => setNewSupplier({ ...newSupplier, contact: { ...newSupplier.contact, phone: e.target.value } })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Products (comma-separated)"
              value={newSupplier.products.join(',')}
              onChange={(e) => setNewSupplier({ ...newSupplier, products: e.target.value.split(',') })}
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

      {/* Edit Supplier Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Supplier</h2>
            <input
              type="text"
              placeholder="Name"
              value={editSupplier.name}
              onChange={(e) => setEditSupplier({ ...editSupplier, name: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={editSupplier.contact.email}
              onChange={(e) => setEditSupplier({ ...editSupplier, contact: { ...editSupplier.contact, email: e.target.value } })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Phone"
              value={editSupplier.contact.phone}
              onChange={(e) => setEditSupplier({ ...editSupplier, contact: { ...editSupplier.contact, phone: e.target.value } })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Products (comma-separated)"
              value={editSupplier.products.join(',')}
              onChange={(e) => setEditSupplier({ ...editSupplier, products: e.target.value.split(',') })}
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
            <p>Are you sure you want to delete this supplier?</p>
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

      {/* View Items Modal */}
      {showItemsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Items Supplied by {suppliers.find(s => s._id === selectedSupplier)?.name}</h2>
            <ul>
              {selectedSupplierItems.map(item => (
                <li key={item._id} className="border-b py-2">{item.name} (Qty: {item.quantity}, SKU: {item.sku})</li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button onClick={handleCancel} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;