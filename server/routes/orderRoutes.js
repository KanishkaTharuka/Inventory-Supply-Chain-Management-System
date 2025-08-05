const express = require('express');
const router = express.Router();
const { getOrders, addOrder, updateOrderStatus, processReturn } = require('../controllers/orderController');

router.get('/', getOrders);
router.post('/', addOrder);
router.put('/:id', updateOrderStatus);
router.post('/:id/return', processReturn);

module.exports = router;