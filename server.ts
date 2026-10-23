import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { dbManager } from './server/db.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Auth middleware for protected routes
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token || !dbManager.isValidSession(token)) {
    return res.status(401).json({ error: 'Unauthorized. Admin session invalid or expired.' });
  }

  next();
}

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const isValid = dbManager.verifyAdminPassword(password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  const token = dbManager.createSession();
  const profile = dbManager.getAdminProfile();

  res.json({
    success: true,
    token,
    user: profile,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  dbManager.revokeSession(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', requireAdmin, (_req: Request, res: Response) => {
  res.json({ user: dbManager.getAdminProfile() });
});

app.post('/api/auth/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters long' });
  }

  if (!dbManager.verifyAdminPassword(currentPassword)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  dbManager.changeAdminPassword(newPassword);
  const newToken = dbManager.createSession();
  res.json({ success: true, message: 'Password updated successfully', token: newToken });
});

// ==================== SETTINGS ROUTES ====================
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(dbManager.getSettings());
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = dbManager.updateSettings(req.body);
  res.json(updated);
});

// ==================== PRODUCTS ROUTES ====================
app.get('/api/products', (_req: Request, res: Response) => {
  res.json(dbManager.getProducts());
});

app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  const { name, nameTe, category, categoryTe, price, unit, unitTe, inStock, stockCount, imageUrl, description, descriptionTe } = req.body;

  if (!name || !price || !unit) {
    return res.status(400).json({ error: 'Name, price, and unit are required' });
  }

  const newProduct = dbManager.addProduct({
    name: name.trim(),
    nameTe: (nameTe || name).trim(),
    category: category || 'General',
    categoryTe: categoryTe || 'సాధారణం',
    price: Number(price),
    unit: unit.trim(),
    unitTe: (unitTe || unit).trim(),
    inStock: inStock !== undefined ? inStock : true,
    stockCount: Number(stockCount) || 50,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: description || '',
    descriptionTe: descriptionTe || '',
  });

  res.status(201).json(newProduct);
});

app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = dbManager.updateProduct(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(updated);
});

app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const deleted = dbManager.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, message: 'Product removed' });
});

// ==================== TANKER TIERS ROUTES ====================
app.get('/api/tanker-tiers', (_req: Request, res: Response) => {
  res.json(dbManager.getTankerTiers());
});

app.put('/api/tanker-tiers', requireAdmin, (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Expected an array of tanker tiers' });
  }
  const updated = dbManager.updateTankerTiers(req.body);
  res.json(updated);
});

// ==================== ORDERS ROUTES ====================
app.get('/api/orders', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const phone = req.query.phone as string | undefined;

  const isAdmin = token ? dbManager.isValidSession(token) : false;

  if (isAdmin) {
    return res.json(dbManager.getOrders());
  }

  // If customer querying their own orders by phone
  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const userOrders = dbManager.getOrders().filter(o => o.mobileNumber.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)));
    return res.json(userOrders);
  }

  return res.status(401).json({ error: 'Unauthorized or phone parameter required.' });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = dbManager.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { customerName, mobileNumber, address, landmark, items, paymentMethod, specialInstructions } = req.body;

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }
  if (!mobileNumber || mobileNumber.replace(/[^0-9]/g, '').length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number is required' });
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ error: 'Delivery address or location is required' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  const created = dbManager.createOrder({
    customerName,
    mobileNumber,
    address,
    landmark: landmark || 'Sanganapalli',
    items,
    paymentMethod: paymentMethod || 'cod',
    specialInstructions,
  });

  res.status(201).json(created);
});

app.patch('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status, ownerNotes } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  const updated = dbManager.updateOrderStatus(req.params.id, status, ownerNotes);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

app.delete('/api/orders/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = dbManager.deleteOrder(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ success: true, message: 'Order deleted' });
});

// ==================== TANKER BOOKINGS ROUTES ====================
app.get('/api/tanker-bookings', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const phone = req.query.phone as string | undefined;

  const isAdmin = token ? dbManager.isValidSession(token) : false;

  if (isAdmin) {
    return res.json(dbManager.getTankerBookings());
  }

  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const userBookings = dbManager.getTankerBookings().filter(b => b.mobileNumber.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)));
    return res.json(userBookings);
  }

  return res.status(401).json({ error: 'Unauthorized or phone parameter required.' });
});

app.get('/api/tanker-bookings/:id', (req: Request, res: Response) => {
  const booking = dbManager.getTankerBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(booking);
});

app.post('/api/tanker-bookings', (req: Request, res: Response) => {
  const { customerName, mobileNumber, address, landmark, capacityLiters, waterType, requiredDate, requiredTimeSlot, specialInstructions } = req.body;

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }
  if (!mobileNumber || mobileNumber.replace(/[^0-9]/g, '').length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number is required' });
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ error: 'Delivery address or landmark is required' });
  }
  if (!capacityLiters) {
    return res.status(400).json({ error: 'Water tanker capacity is required' });
  }
  if (!requiredDate) {
    return res.status(400).json({ error: 'Required delivery date is required' });
  }

  const created = dbManager.createTankerBooking({
    customerName,
    mobileNumber,
    address,
    landmark: landmark || 'Sanganapalli',
    capacityLiters: Number(capacityLiters),
    waterType: waterType || 'drinking_ro',
    requiredDate,
    requiredTimeSlot: requiredTimeSlot || 'Morning (07:00 AM - 10:00 AM)',
    specialInstructions,
  });

  res.status(201).json(created);
});

app.patch('/api/tanker-bookings/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status, ownerNotes } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  const updated = dbManager.updateTankerBookingStatus(req.params.id, status, ownerNotes);
  if (!updated) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(updated);
});

app.delete('/api/tanker-bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = dbManager.deleteTankerBooking(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json({ success: true, message: 'Booking deleted' });
});

// ==================== ANALYTICS ROUTES ====================
app.get('/api/analytics', requireAdmin, (_req: Request, res: Response) => {
  res.json(dbManager.getAnalytics());
});

// ==================== VITE & STATIC HANDLING ====================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sanganapalli Shop & Srujala Tanker Service running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
