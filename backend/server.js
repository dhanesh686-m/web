const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickshopp';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully.');
    initDb();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Schemas & Models
const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, default: 'active' }
});

const shopSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  owner_id: { type: String, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  rating: { type: Number, default: 5.0 }
});

const itemSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  shop_id: { type: String, ref: 'Shop', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

const orderItemSchema = new mongoose.Schema({
  item_id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customer_id: { type: String, ref: 'User', required: true },
  customer_name: { type: String, required: true },
  shop_id: { type: String, ref: 'Shop', required: true },
  shop_name: { type: String, required: true },
  subtotal: { type: Number, required: true },
  delivery_fee: { type: Number, default: 3.50 },
  total: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, required: true }, // pending, preparing, ready, delivering, delivered
  delivery_boy_id: { type: String, ref: 'User', default: null },
  delivery_boy_name: { type: String, default: null },
  timestamp: { type: String, required: true },
  items: [orderItemSchema]
});

const User = mongoose.model('User', userSchema);
const Shop = mongoose.model('Shop', shopSchema);
const Item = mongoose.model('Item', itemSchema);
const Order = mongoose.model('Order', orderSchema);

// Database Seeding Logic
async function initDb() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial MongoDB mock data...');

      // 1. Seed Users
      const mockUsers = [
        { _id: "u-admin", email: "admin@swiftdrop.com", password: "admin123", name: "System Admin", role: "admin", status: "active" },
        { _id: "u-grocer", email: "grocer@swiftdrop.com", password: "pass123", name: "Arthur Dent", role: "shopkeeper", status: "active" },
        { _id: "u-chef", email: "chef@swiftdrop.com", password: "pass123", name: "Chef Ramsay", role: "shopkeeper", status: "active" },
        { _id: "u-pharma", email: "pharma@swiftdrop.com", password: "pass123", name: "Dr. Elizabeth", role: "shopkeeper", status: "active" },
        { _id: "u-rider1", email: "rider1@swiftdrop.com", password: "pass123", name: "Speedy Gonzalez", role: "delivery", status: "active" },
        { _id: "u-rider2", email: "rider2@swiftdrop.com", password: "pass123", name: "Flash Gordon", role: "delivery", status: "active" },
        { _id: "u-customer", email: "customer@swiftdrop.com", password: "pass123", name: "Alice Cooper", role: "customer", status: "active" }
      ];
      await User.insertMany(mockUsers);

      // 2. Seed Shops
      const mockShops = [
        { _id: "s-freshmart", owner_id: "u-grocer", name: "FreshMart Organic Grocery", category: "grocery", description: "Farm-to-table organic produce, fresh dairy, and daily bakery bread items.", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600", rating: 4.8 },
        { _id: "s-burgerfusion", owner_id: "u-chef", name: "Burger Fusion", category: "food", description: "Gourmet, flame-grilled burgers, seasoned fries, and premium craft milkshakes.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600", rating: 4.9 },
        { _id: "s-medicare", owner_id: "u-pharma", name: "Medicare Plus Pharmacy", category: "pharmacy", description: "Your local pharmacy stocking essential medicines, wellness vitamins, and first aid kits.", image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=600", rating: 4.7 },
        { _id: "s-sugarbliss", owner_id: "u-grocer", name: "Sugar Bliss Bakery", category: "sweets", description: "Fresh daily donuts, artisanal pastries, slice cakes, and customized macarons.", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600", rating: 4.6 }
      ];
      await Shop.insertMany(mockShops);

      // 3. Seed Items
      const mockItems = [
        // FreshMart
        { _id: "i-avocado", shop_id: "s-freshmart", name: "Organic Hass Avocados", description: "Ripe, creamy, and loaded with healthy nutrients. Pack of 2.", price: 4.99, quantity: 45, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=300" },
        { _id: "i-milk", shop_id: "s-freshmart", name: "Whole Farm Milk 1L", description: "Organic full cream milk pasteurized from pasture-fed cows.", price: 2.49, quantity: 80, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300" },
        { _id: "i-sourdough", shop_id: "s-freshmart", name: "Artisanal Sourdough Bread", description: "Freshly baked sourdough loaf with a crispy crust and soft airy crumb.", price: 3.80, quantity: 15, image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=300" },
        
        // Burger Fusion
        { _id: "i-truffleburger", shop_id: "s-burgerfusion", name: "Double Truffle Burger", description: "Two flame-grilled beef patties, white cheddar cheese, and black truffle aioli.", price: 12.99, quantity: 30, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300" },
        { _id: "i-cajunfries", shop_id: "s-burgerfusion", name: "Spicy Cajun Fries", description: "Crispy skin-on potato fries tossed in our signature Cajun spice mix.", price: 4.50, quantity: 100, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=300" },
        { _id: "i-caramelshake", shop_id: "s-burgerfusion", name: "Salted Caramel Shake", description: "Creamy vanilla bean ice cream blended with homemade salted caramel sauce.", price: 6.00, quantity: 25, image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=300" },

        // Medicare Plus
        { _id: "i-vitaminc", shop_id: "s-medicare", name: "Vitamin C Tablets 90pk", description: "Supports healthy immune function. 1000mg chewable tablets.", price: 15.99, quantity: 50, image: "https://images.unsplash.com/photo-1616679911721-fe6eec18fcd5?auto=format&fit=crop&q=80&w=300" },
        { _id: "i-firstaid", shop_id: "s-medicare", name: "Pocket First Aid Kit", description: "Contains bandages, antiseptic wipes, gauze pads, and medical tape.", price: 8.99, quantity: 12, image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=300" },

        // Sugar Bliss
        { _id: "i-redvelvet", shop_id: "s-sugarbliss", name: "Red Velvet Cake Slice", description: "Rich layers of cocoa red velvet cake with velvety cream cheese frosting.", price: 5.50, quantity: 20, image: "https://images.unsplash.com/photo-1616031037011-08ad40013136?auto=format&fit=crop&q=80&w=300" },
        { _id: "i-croissant", shop_id: "s-sugarbliss", name: "Almond Butter Croissant", description: "Flaky butter pastry baked with sweet frangipane almond cream.", price: 3.75, quantity: 40, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=300" }
      ];
      await Item.insertMany(mockItems);

      console.log('Seeding mock data finished successfully.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// REST API - AUTHENTICATION
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const cleanedEmail = (email || '').trim().toLowerCase();

  try {
    const user = await User.findOne({ email: new RegExp('^' + cleanedEmail + '$', 'i'), password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account deactivated or suspended' });
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  const cleanedEmail = (email || '').trim().toLowerCase();

  if (!name || !cleanedEmail || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existingUser = await User.findOne({ email: new RegExp('^' + cleanedEmail + '$', 'i') });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const userId = `u-${Date.now()}`;
    const user = new User({
      _id: userId,
      email: cleanedEmail,
      password,
      name: name.trim(),
      role: role || 'customer',
      status: 'active'
    });
    await user.save();

    // Auto-create shop if registered as a shopkeeper
    if (user.role === 'shopkeeper') {
      const shopId = `s-${Date.now()}`;
      const shop = new Shop({
        _id: shopId,
        owner_id: userId,
        name: `${user.name}'s Store`,
        category: 'grocery',
        description: 'Setup your fresh shop catalog profile here.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
        rating: 5.0
      });
      await shop.save();
    }

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REST API - SHOPS & ITEMS
app.get('/api/shops', async (req, res) => {
  const category = req.query.category || 'all';
  try {
    let shops;
    if (category === 'all') {
      shops = await Shop.find();
    } else {
      shops = await Shop.find({ category });
    }
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/shops/:shopId', async (req, res) => {
  const { shopId } = req.params;
  try {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const items = await Item.find({ shop_id: shopId });
    res.json({ shop, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shops', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, category, description, image } = req.body;

  try {
    const shop = await Shop.findOne({ owner_id: userId });
    if (!shop) {
      return res.status(403).json({ error: 'Store not found or you are not the owner' });
    }

    shop.name = name;
    shop.category = category;
    shop.description = description;
    shop.image = image;
    await shop.save();

    res.json({ success: true, message: 'Shop profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: itemId, name, description, price, quantity, image } = req.body;

  try {
    const shop = await Shop.findOne({ owner_id: userId });
    if (!shop) {
      return res.status(403).json({ error: 'Merchant shop not configured' });
    }

    const shopId = shop._id;

    if (itemId) {
      // Edit item
      const item = await Item.findOne({ _id: itemId, shop_id: shopId });
      if (!item) {
        return res.status(403).json({ error: 'Product not found or unauthorized' });
      }

      item.name = name;
      item.description = description;
      item.price = Number(price);
      item.quantity = Number(quantity);
      item.image = image;
      await item.save();

      res.json({ success: true, id: item._id });
    } else {
      // Add item
      const newItemId = `i-${Date.now()}`;
      const item = new Item({
        _id: newItemId,
        shop_id: shopId,
        name,
        description,
        price: Number(price),
        quantity: Number(quantity),
        image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'
      });
      await item.save();

      res.json({ success: true, id: item._id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:itemId', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { itemId } = req.params;

  try {
    const shop = await Shop.findOne({ owner_id: userId });
    if (!shop) {
      return res.status(403).json({ error: 'Merchant shop not configured' });
    }

    const result = await Item.deleteOne({ _id: itemId, shop_id: shop._id });
    if (result.deletedCount === 0) {
      return res.status(403).json({ error: 'Product not found or unauthorized' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REST API - ORDERS MANAGEMENT
app.post('/api/orders', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { shopId, items: cartItems, address } = req.body;

  if (!shopId || !cartItems || !cartItems.length || !address) {
    return res.status(400).json({ error: 'Missing order details' });
  }

  try {
    const customer = await User.findById(userId);
    if (!customer) {
      return res.status(401).json({ error: 'Invalid customer account' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const orderId = `ord-${Date.now()}`;
    let subtotal = 0.0;
    const dbItems = [];

    // Check quantities and deduct stock in a loop
    for (const cartItem of cartItems) {
      const dbItem = await Item.findOne({ _id: cartItem.itemId, shop_id: shopId });
      if (!dbItem) {
        throw new Error(`Product ${cartItem.itemId} not found in this shop`);
      }

      const qtyOrdered = Number(cartItem.quantity);
      if (dbItem.quantity < qtyOrdered) {
        throw new Error(`Insufficient stock for ${dbItem.name}. Only ${dbItem.quantity} available.`);
      }

      // Perform deduction atomically on this document
      const updateResult = await Item.updateOne(
        { _id: cartItem.itemId, quantity: { $gte: qtyOrdered } },
        { $inc: { quantity: -qtyOrdered } }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(`Concurrency stock check failed for ${dbItem.name}. Please try again.`);
      }

      subtotal += dbItem.price * qtyOrdered;
      dbItems.push({
        item_id: cartItem.itemId,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qtyOrdered
      });
    }

    const deliveryFee = 3.50;
    const total = subtotal + deliveryFee;
    
    // Formatting time similar to server.py
    const formatTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutes} ${ampm}, Today`;
    };

    const timestamp = formatTime();

    const order = new Order({
      _id: orderId,
      customer_id: userId,
      customer_name: customer.name,
      shop_id: shopId,
      shop_name: shop.name,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      address,
      status: 'pending',
      timestamp,
      items: dbItems
    });

    await order.save();
    res.status(201).json({ success: true, orderId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let orders = [];

    if (user.role === 'customer') {
      orders = await Order.find({ customer_id: userId }).sort({ _id: -1 });
    } else if (user.role === 'shopkeeper') {
      const shop = await Shop.findOne({ owner_id: userId });
      if (shop) {
        orders = await Order.find({ shop_id: shop._id }).sort({ _id: -1 });
      }
    } else if (user.role === 'delivery') {
      const isOnline = req.query.isOnline === 'true';
      
      // Rider's own orders
      const myOrders = await Order.find({ delivery_boy_id: userId }).sort({ _id: -1 });
      orders = [...myOrders];

      // Unassigned ready orders near you
      if (isOnline) {
        const availableJobs = await Order.find({ status: 'ready', delivery_boy_id: null }).sort({ _id: -1 });
        orders = [...orders, ...availableJobs];
      }
    } else if (user.role === 'admin') {
      orders = await Order.find().sort({ _id: -1 });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:orderId', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { orderId } = req.params;
  const { status: nextStatus } = req.body;

  if (!nextStatus) {
    return res.status(400).json({ error: 'Missing status update' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'shopkeeper') {
      const shop = await Shop.findOne({ owner_id: userId });
      if (!shop || order.shop_id !== shop._id) {
        return res.status(403).json({ error: 'Unauthorized to modify order for this store' });
      }

      if (!['preparing', 'ready'].includes(nextStatus)) {
        return res.status(403).json({ error: 'Invalid status workflow for merchants' });
      }

      order.status = nextStatus;
      await order.save();
    } else if (user.role === 'delivery') {
      if (nextStatus === 'delivering' && !order.delivery_boy_id) {
        // Accept ready job
        order.status = 'ready';
        order.delivery_boy_id = userId;
        order.delivery_boy_name = user.name;
        await order.save();
      } else if (['delivering', 'delivered'].includes(nextStatus) && order.delivery_boy_id === userId) {
        order.status = nextStatus;
        await order.save();
      } else {
        return res.status(403).json({ error: 'Unauthorized to modify delivery details' });
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized status operation' });
    }

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REST API - ADMIN DASHBOARD
app.get('/api/admin/stats', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const admin = await User.findOne({ _id: userId, role: 'admin' });
    if (!admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length ? revenueResult[0].totalRevenue : 0.0;

    res.json({
      users: totalUsers,
      shops: totalShops,
      orders: deliveredOrders,
      revenue: totalRevenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const admin = await User.findOne({ _id: userId, role: 'admin' });
    if (!admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const rawUsers = await User.find({ role: { $ne: 'admin' } });
    const users = [];

    for (const u of rawUsers) {
      let shopName = '-';
      if (u.role === 'shopkeeper') {
        const shop = await Shop.findOne({ owner_id: u._id });
        shopName = shop ? shop.name : 'No shop configured';
      }
      users.push({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        shopName
      });
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:targetUserId', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { targetUserId } = req.params;

  try {
    const admin = await User.findOne({ _id: userId, role: 'admin' });
    if (!admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    targetUser.status = nextStatus;
    await targetUser.save();

    res.json({ success: true, status: nextStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend SPA index for any non-API GET requests (supports client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Boot Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
