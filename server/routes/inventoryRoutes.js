const express = require('express');
const router = express.Router();
const { getItems, addItem, updateItem, deleteItem } = require('../controllers/inventoryController');

router.get('/', getItems);
router.post('/', addItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;