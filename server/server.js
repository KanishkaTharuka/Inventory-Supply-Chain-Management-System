const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authenticateToken = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = 5000;
const MONGODB_URL = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);

// MongoDB Connection
if (!MONGODB_URL) {
    console.error("MONGODB_URL is not defined.");
    process.exit(1);
}

mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const connect = mongoose.connection;
connect.once("open", () => {
    console.log("MongoDB database connection established successfully");
});

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})