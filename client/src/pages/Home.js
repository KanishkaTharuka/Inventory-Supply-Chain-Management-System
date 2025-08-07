import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inventory Metrics
  const [availableQty, setAvailableQty] = useState(0);
  const [inDeliveryQty, setInDeliveryQty] = useState(0);
  const [reorderSkus, setReorderSkus] = useState(0);
  const [totalSkus, setTotalSkus] = useState(0);
  const [availablePercentage, setAvailablePercentage] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [receiveValue, setReceiveValue] = useState(0);
  const [receiveQty, setReceiveQty] = useState(0);
  const [avgNetProfit, setAvgNetProfit] = useState(0);
  const [ordersValue, setOrdersValue] = useState(0);
  const [ordersQty, setOrdersQty] = useState(0);
  const [inventoryTrend, setInventoryTrend] = useState([]);

  // Financial Metrics
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [profit, setProfit] = useState(0);
  const [financialTrend, setFinancialTrend] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryRes, ordersRes, suppliersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/inventory'),
          axios.get('http://localhost:5000/api/orders'),
          axios.get('http://localhost:5000/api/suppliers'),
        ]);

        setInventory(inventoryRes.data);
        setOrders(ordersRes.data);
        setSuppliers(suppliersRes.data);
        processData(inventoryRes.data, ordersRes.data, suppliersRes.data);
      } catch (err) {
        setError('Failed to fetch data: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (inventoryData, ordersData, suppliersData) => {
    // Inventory Metrics
    const totalAvailable = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
    setAvailableQty(totalAvailable);
    
    const deliveryItems = ordersData.filter(o => o.status === 'Shipped');
    setInDeliveryQty(deliveryItems.reduce((sum, item) => sum + item.quantity, 0));
    
    const lowStockItems = inventoryData.filter(item => item.quantity < (item.reorderLevel || 10));
    setReorderSkus(lowStockItems.length);
    setTotalSkus(inventoryData.length);
    
    const receivedValue = suppliersData.reduce((sum, supplier) => 
      sum + (supplier.poStatus === 'Delivered' ? supplier.products.length : 0), 0);
    setAvailablePercentage(Math.round((totalAvailable / (totalAvailable + receivedValue)) * 100));
    
    const totalStockValue = inventoryData.reduce((sum, item) => 
      sum + (item.quantity * item.purchasePrice), 0);
    setStockValue(totalStockValue);
    
    const incomingValue = suppliersData.reduce((sum, supplier) => 
      sum + (supplier.poStatus === 'Awaiting' ? supplier.products.length * 100 : 0), 0);
    setReceiveValue(incomingValue);
    setReceiveQty(suppliersData.filter(s => s.poStatus === 'Awaiting').length);
    
    // Profit Calculation
    const profits = inventoryData.map(item => item.salesPrice - item.purchasePrice);
    const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
    setAvgNetProfit(avgProfit.toFixed(2));
    
    // Orders and Financial Calculations
    const completedOrders = ordersData.filter(o => o.status === 'Delivered');
    const incomeTotal = completedOrders.reduce((sum, order) => {
      const item = inventoryData.find(i => i._id === order.productId);
      return sum + (item ? order.quantity * item.salesPrice : 0);
    }, 0);
    setIncome(incomeTotal);
    
    const expensesTotal = inventoryData.reduce((sum, item) => 
      sum + (item.quantity * item.purchasePrice), 0);
    setExpenses(expensesTotal);
    
    setProfit(incomeTotal - expensesTotal);
    setOrdersValue(incomeTotal);
    setOrdersQty(completedOrders.length);
    
    // Mock trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    setInventoryTrend(months.map(month => ({
      month,
      value: Math.floor(Math.random() * 2000) - 1000
    })));
    
    setFinancialTrend(months.map(month => ({
      month,
      income: Math.floor(incomeTotal * Math.random() * 0.3),
      expenses: Math.floor(expensesTotal * Math.random() * 0.3)
    })));
  };

  if (loading) {
    return (
      <div className="p-6 ml-64 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 ml-64 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    );
  }

  // Chart data for inventory trend
  const trendChartData = {
    labels: inventoryTrend.map(item => item.month),
    datasets: [
      {
        label: 'In vs Out [Qty]',
        data: inventoryTrend.map(item => item.value),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for financial trend
  const financialTrendData = {
    labels: financialTrend.map(item => item.month),
    datasets: [
      {
        label: 'Income',
        data: financialTrend.map(item => item.income),
        borderColor: 'rgba(74, 222, 128, 1)',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: financialTrend.map(item => item.expenses),
        borderColor: 'rgba(248, 113, 113, 1)',
        backgroundColor: 'rgba(248, 113, 113, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Pie chart data for income vs expenses
  const incomeExpenseData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: [
          'rgba(74, 222, 128, 0.7)',
          'rgba(248, 113, 113, 0.7)'
        ],
        borderColor: [
          'rgba(74, 222, 128, 1)',
          'rgba(248, 113, 113, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="p-6 ml-64 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Inventory Dashboard</h1>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Available Qty */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Available [Qty]</div>
          <div className="text-2xl font-bold">{availableQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        {/* In Delivery */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">In Delivery [Qty]</div>
          <div className="text-2xl font-bold">{inDeliveryQty.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        {/* Reorder SKUs */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Reorder [SKUs]</div>
          <div className="text-2xl font-bold">{reorderSkus.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        {/* Total SKUs */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Total [SKUs]</div>
          <div className="text-2xl font-bold">{totalSkus.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Second Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Available Percentage */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Available Qty</div>
          <div className="text-2xl font-bold mb-2">{availablePercentage}%</div>
          <div className="text-gray-400 text-xs">of Received + In Delivery</div>
        </div>

        {/* Stock Value */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Stock Value [$]</div>
          <div className="text-2xl font-bold">{stockValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        {/* Receive In */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Receive (in) [$]</div>
          <div className="text-2xl font-bold">{receiveValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-gray-400 text-xs mt-1">{receiveQty} Qty</div>
        </div>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Income */}
        <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-gray-400 text-sm mb-1">Income [$]</div>
          <div className="text-2xl font-bold text-green-400">
            {income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
          <div className="text-gray-400 text-sm mb-1">Expenses [$]</div>
          <div className="text-2xl font-bold text-red-400">
            {expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Profit */}
        <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="text-gray-400 text-sm mb-1">Profit [$]</div>
          <div className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Inventory Trend Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Inventory Trend</h2>
          <div className="h-64">
            <Line 
              data={trendChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Financial Trend Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Financial Trend</h2>
          <div className="h-64">
            <Line 
              data={financialTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Income vs Expenses Pie Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
          <div className="h-64">
            <Pie 
              data={incomeExpenseData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                }
              }}
            />
          </div>
        </div>

        {/* Sales Activity */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">SALES ACTIVITY</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Confirmed Orders</span>
              <span className="font-bold">{orders.filter(o => o.status === 'Pending').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shipped Today</span>
              <span className="font-bold">{orders.filter(o => {
                const today = new Date();
                const orderDate = new Date(o.createdAt || new Date());
                return o.status === 'Shipped' && 
                  orderDate.toDateString() === today.toDateString();
              }).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Revenue</span>
              <span className="font-bold">${income.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">TOP SELLING ITEMS</h2>
          {inventory
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 3)
            .map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <span className="text-gray-400 truncate">{item.name}</span>
                <span className="font-bold">{item.quantity} units</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;