const express = require('express');
const router = express.Router();
const { getInventory, addInventory, updateItem, deleteItem } = require('../controllers/inventoryController');

router.get('/', getInventory);
router.post('/', addInventory);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;