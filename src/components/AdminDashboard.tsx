import React, { useState, useEffect } from 'react';
import {
  Lock, LogOut, ShoppingBag, Droplets, Package, DollarSign,
  TrendingUp, Users, Settings, Plus, Edit2, Trash2, CheckCircle2,
  XCircle, Clock, Truck, Phone, MessageCircle, AlertCircle, RefreshCw, Key, ShieldCheck
} from 'lucide-react';
import { Product, TankerTier, Order, TankerBooking, ShopSettings, AnalyticsData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AdminDashboardProps {
  settings: ShopSettings | null;
  onRefreshSettings: () => void;
  onRefreshProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ settings, onRefreshSettings, onRefreshProducts }) => {
  const { language, t } = useLanguage();
  const { isAuthenticated, login, logout, isLoading: authLoading } = useAuth();

  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<'orders' | 'tankers' | 'products' | 'pricing' | 'sales' | 'settings'>('orders');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [tankerBookings, setTankerBookings] = useState<TankerBooking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tankerTiers, setTankerTiers] = useState<TankerTier[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Filters for orders & bookings
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [tankerFilter, setTankerFilter] = useState<string>('all');

  // Edit / Add Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    nameTe: '',
    category: 'Rice & Grains',
    categoryTe: 'బియ్యం & ధాన్యాలు',
    price: 100,
    unit: '1 kg',
    unitTe: '1 కేజీ',
    inStock: true,
    stockCount: 50,
    imageUrl: '',
    description: '',
    descriptionTe: '',
  });

  // Notes update modal
  const [noteModalTarget, setNoteModalTarget] = useState<{ type: 'order' | 'tanker'; id: string; currentNotes: string } | null>(null);
  const [noteText, setNoteText] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ShopSettings | null>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Password change state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Fetch all admin data when authenticated
  const loadAllData = async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    try {
      const [ordList, tnkList, prodList, tierList, analData] = await Promise.all([
        api.getOrders(),
        api.getTankerBookings(),
        api.getProducts(),
        api.getTankerTiers(),
        api.getAnalytics(),
      ]);
      setOrders(ordList);
      setTankerBookings(tnkList);
      setProducts(prodList);
      setTankerTiers(tierList);
      setAnalytics(analData);
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await login(passwordInput);
      setPasswordInput('');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Order status updater
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await loadAllData();
    } catch (e) {
      alert('Failed to update order status');
    }
  };

  // Tanker status updater
  const handleUpdateTankerStatus = async (bookingId: string, status: TankerBooking['status']) => {
    try {
      await api.updateTankerBookingStatus(bookingId, status);
      await loadAllData();
    } catch (e) {
      alert('Failed to update tanker status');
    }
  };

  // Save Owner Note
  const handleSaveNote = async () => {
    if (!noteModalTarget) return;
    try {
      if (noteModalTarget.type === 'order') {
        const ord = orders.find(o => o.id === noteModalTarget.id);
        if (ord) await api.updateOrderStatus(noteModalTarget.id, ord.status, noteText);
      } else {
        const bkg = tankerBookings.find(b => b.id === noteModalTarget.id);
        if (bkg) await api.updateTankerBookingStatus(noteModalTarget.id, bkg.status, noteText);
      }
      setNoteModalTarget(null);
      await loadAllData();
    } catch {
      alert('Failed to save remarks');
    }
  };

  // Product save (create or update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productForm);
      } else {
        await api.createProduct(productForm);
      }
      setEditingProduct(null);
      setIsAddProductOpen(false);
      await loadAllData();
      onRefreshProducts();
    } catch {
      alert('Failed to save product');
    }
  };

  // Product delete
  const handleDeleteProduct = async (id: string) => {
    if (confirm(t.deleteConfirm)) {
      try {
        await api.deleteProduct(id);
        await loadAllData();
        onRefreshProducts();
      } catch {
        alert('Failed to delete product');
      }
    }
  };

  // Open edit product modal
  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      nameTe: prod.nameTe,
      category: prod.category,
      categoryTe: prod.categoryTe,
      price: prod.price,
      unit: prod.unit,
      unitTe: prod.unitTe,
      inStock: prod.inStock,
      stockCount: prod.stockCount,
      imageUrl: prod.imageUrl,
      description: prod.description || '',
      descriptionTe: prod.descriptionTe || '',
    });
    setIsAddProductOpen(true);
  };

  // Open add new product modal
  const openAddNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      nameTe: '',
      category: 'Rice & Grains',
      categoryTe: 'బియ్యం & ధాన్యాలు',
      price: 100,
      unit: '1 kg',
      unitTe: '1 కేజీ',
      inStock: true,
      stockCount: 50,
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      description: '',
      descriptionTe: '',
    });
    setIsAddProductOpen(true);
  };

  // Tanker tier rate update
  const handleUpdateTankerTierPrice = (id: string, basePrice: number, deliveryCharge: number) => {
    setTankerTiers(prev =>
      prev.map(t => (t.id === id ? { ...t, basePrice, deliveryCharge } : t))
    );
  };

  const handleSaveTankerTiers = async () => {
    try {
      await api.updateTankerTiers(tankerTiers);
      alert('Tanker rates updated successfully');
      await loadAllData();
    } catch {
      alert('Failed to update tanker rates');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      await api.updateSettings(settingsForm);
      setSettingsSaved(true);
      onRefreshSettings();
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch {
      alert('Failed to update settings');
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      await api.changePassword(currPassword, newPassword);
      setPasswordMsg({ text: 'Password successfully changed!', success: true });
      setCurrPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Failed to change password', success: false });
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // Filtered tanker bookings
  const filteredTankers = tankerBookings.filter(b => {
    if (tankerFilter === 'all') return true;
    return b.status === tankerFilter;
  });

  // If not authenticated, render Login Card
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            {t.adminTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
            {t.adminSubtitle}
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Owner Access Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (default: admin)"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Default password: <span className="font-mono font-bold text-slate-700">admin</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : t.loginButton}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Store Owner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Sanganapalli Shop & Tanker Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage village grocery inventory, water fleet dispatch, customer logs, and sales.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAllData}
            disabled={loadingData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-red-600/80 hover:bg-red-600 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t.todaySales}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{analytics.summary.todaySales.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {analytics.summary.todayOrdersCount} orders • {analytics.summary.todayBookingsCount} tankers
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t.monthSales}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{analytics.summary.monthSales.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Shop: ₹{analytics.summary.monthShopSales} • Tanker: ₹{analytics.summary.monthTankerSales}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t.totalRevenue}
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              ₹{analytics.summary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {analytics.summary.totalShopOrders} shop + {analytics.summary.totalTankerBookings} tanker
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t.activePending}
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
              {analytics.summary.pendingShopOrders + analytics.summary.pendingTankerBookings}
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              {analytics.summary.pendingShopOrders} shop orders • {analytics.summary.pendingTankerBookings} tankers
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.tabOrders} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tankers')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'tankers'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>{t.tabTankers} ({tankerBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'products'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.tabProducts} ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'pricing'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t.tabPricing}</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'sales'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t.tabSales}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t.tabSettings}</span>
        </button>
      </div>

      {/* ================= TAB 1: SHOP ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Status Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {['all', 'pending', 'accepted', 'packing', 'out_for_delivery', 'delivered', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap ${
                  orderFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-sm">No orders matching this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-slate-900 text-base">{order.id}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleString()} • Pay via: <span className="font-bold uppercase">{order.paymentMethod}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Bill Total</span>
                        <p className="text-lg font-black text-slate-900">₹{order.totalAmount}</p>
                      </div>
                      <a
                        href={`tel:${order.mobileNumber}`}
                        className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Customer details & Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{order.customerName} • <span className="font-mono">{order.mobileNumber}</span></p>
                      <p className="text-slate-600 mt-1">{order.address}, {order.landmark}</p>
                      {order.specialInstructions && (
                        <p className="mt-1 italic text-amber-800 bg-amber-50 p-2 rounded-lg">
                          Customer note: "{order.specialInstructions}"
                        </p>
                      )}
                      {order.ownerNotes && (
                        <p className="mt-1 font-medium text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                          Your notes: "{order.ownerNotes}"
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Items ({order.items.length}):</span>
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between py-0.5 border-b border-slate-100">
                            <span className="text-slate-700">{it.quantity}x {it.productName}</span>
                            <span className="font-mono font-semibold">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500 mr-1">{t.updateStatus}:</span>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'packing')}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg"
                        >
                          Mark Packing
                        </button>
                      )}
                      {order.status === 'packing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                        >
                          Mark Out for Delivery
                        </button>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setNoteModalTarget({ type: 'order', id: order.id, currentNotes: order.ownerNotes || '' });
                        setNoteText(order.ownerNotes || '');
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      {order.ownerNotes ? 'Edit Remarks' : '+ Add Remarks'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: WATER TANKERS ================= */}
      {activeTab === 'tankers' && (
        <div className="space-y-4">
          {/* Tanker Status Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {['all', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setTankerFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap ${
                  tankerFilter === st
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredTankers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-sm">No tanker bookings matching this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTankers.map(bkg => (
                <div
                  key={bkg.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-sky-900 text-base">{bkg.id}</span>
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-800">
                          {bkg.capacityLiters.toLocaleString()}L • {bkg.waterType === 'drinking_ro' ? 'Drinking RO' : 'Domestic Bore'}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          bkg.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          bkg.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          bkg.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {bkg.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Delivery requested on: <span className="font-bold text-slate-800">{bkg.requiredDate}</span> ({bkg.requiredTimeSlot})
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Booking Amount</span>
                        <p className="text-lg font-black text-sky-900">₹{bkg.totalAmount}</p>
                      </div>
                      <a
                        href={`tel:${bkg.mobileNumber}`}
                        className="p-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl border border-sky-200"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">{bkg.customerName} • <span className="font-mono">{bkg.mobileNumber}</span></p>
                    <p className="text-slate-600">{bkg.address}, {bkg.landmark}</p>
                    {bkg.specialInstructions && (
                      <p className="italic text-amber-800 bg-amber-50 p-2 rounded-lg mt-1">
                        Special Instructions: "{bkg.specialInstructions}"
                      </p>
                    )}
                    {bkg.ownerNotes && (
                      <p className="font-medium text-sky-900 bg-sky-50 p-2 rounded-lg mt-1">
                        Driver / Tanker Info: "{bkg.ownerNotes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500 mr-1">{t.updateStatus}:</span>
                      {bkg.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateTankerStatus(bkg.id, 'confirmed')}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg"
                          >
                            Confirm Booking
                          </button>
                          <button
                            onClick={() => handleUpdateTankerStatus(bkg.id, 'cancelled')}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {bkg.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateTankerStatus(bkg.id, 'dispatched')}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                        >
                          Dispatch Tanker
                        </button>
                      )}
                      {bkg.status === 'dispatched' && (
                        <button
                          onClick={() => handleUpdateTankerStatus(bkg.id, 'delivered')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setNoteModalTarget({ type: 'tanker', id: bkg.id, currentNotes: bkg.ownerNotes || '' });
                        setNoteText(bkg.ownerNotes || '');
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      {bkg.ownerNotes ? 'Edit Driver/Tanker Notes' : '+ Assign Driver / Tanker Note'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: PRODUCTS & STOCK ================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Grocery Inventory ({products.length})</h3>
            <button
              onClick={openAddNewProduct}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewProduct}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between space-x-3"
              >
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{prod.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{prod.nameTe}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-black text-slate-900 text-sm">₹{prod.price}</span>
                    <span className="text-[11px] text-slate-500">/ {prod.unit}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      prod.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {prod.inStock ? `${prod.stockCount} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1 shrink-0">
                  <button
                    onClick={() => openEditProduct(prod)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: TANKER RATES ================= */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Manage Tanker Capacities & Rates</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure base pricing and delivery charges for different water tanker sizes.
            </p>
          </div>

          <div className="space-y-4">
            {tankerTiers.map(tier => (
              <div
                key={tier.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    {tier.capacityLiters.toLocaleString()} Liters Tanker
                  </h4>
                  <p className="text-xs text-slate-500">{tier.titleTe}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Base Rate (₹)</label>
                    <input
                      type="number"
                      value={tier.basePrice}
                      onChange={(e) => handleUpdateTankerTierPrice(tier.id, Number(e.target.value), tier.deliveryCharge)}
                      className="w-24 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={tier.deliveryCharge}
                      onChange={(e) => handleUpdateTankerTierPrice(tier.id, tier.basePrice, Number(e.target.value))}
                      className="w-24 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveTankerTiers}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
          >
            Save Tanker Rates
          </button>
        </div>
      )}

      {/* ================= TAB 5: SALES & CUSTOMERS ================= */}
      {activeTab === 'sales' && analytics && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">Revenue Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase">Shop Grocery Revenue</span>
                <p className="text-2xl font-black text-emerald-950 mt-1">₹{analytics.summary.shopRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-700 mt-1">{analytics.summary.totalShopOrders} total orders processed</p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                <span className="text-xs font-bold text-sky-800 uppercase">Srujala Water Tanker Revenue</span>
                <p className="text-2xl font-black text-sky-950 mt-1">₹{analytics.summary.tankerRevenue.toLocaleString()}</p>
                <p className="text-xs text-sky-700 mt-1">{analytics.summary.totalTankerBookings} water tanker dispatches</p>
              </div>
            </div>
          </div>

          {/* Customer directory */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Village Customer Records ({analytics.customers.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Address & Landmark</th>
                    <th className="p-3">Orders</th>
                    <th className="p-3">Tankers</th>
                    <th className="p-3">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {analytics.customers.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 font-mono">{c.phone}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{c.address}</td>
                      <td className="p-3 font-semibold">{c.shopOrders}</td>
                      <td className="p-3 font-semibold">{c.tankerBookings}</td>
                      <td className="p-3 font-black text-emerald-800">₹{c.totalSpent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: SETTINGS ================= */}
      {activeTab === 'settings' && settingsForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Settings Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900">{t.contactSettings}</h3>

            {settingsSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                Settings saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (Call Now)</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Number (with country code e.g. 919876543210)</label>
                <input
                  type="text"
                  value={settingsForm.whatsappPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">UPI ID for shop QR payments</label>
                <input
                  type="text"
                  value={settingsForm.upiId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Google Maps URL</label>
                <input
                  type="text"
                  value={settingsForm.googleMapsUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Free Delivery Minimum (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.minOrderForFreeDelivery}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minOrderForFreeDelivery: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.defaultShopDeliveryCharge}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultShopDeliveryCharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
              >
                {t.saveSettings}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900">{t.changePasswordTitle}</h3>

            {passwordMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${
                passwordMsg.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.currentPassword}</label>
                <input
                  type="password"
                  required
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.newPassword}</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? t.editProduct : t.addNewProduct}
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.productNameEn} *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.productNameTe} (Telugu)</label>
                <input
                  type="text"
                  value={productForm.nameTe}
                  onChange={(e) => setProductForm({ ...productForm, nameTe: e.target.value })}
                  placeholder="e.g. సోనా మసూరి బియ్యం"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-telugu"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.categoryLabel}</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Rice & Grains">Rice & Grains (బియ్యం & ధాన్యాలు)</option>
                    <option value="Oils & Ghee">Oils & Ghee (నూనెలు & నెయ్యి)</option>
                    <option value="Dals & Pulses">Dals & Pulses (పప్పులు)</option>
                    <option value="Spices & Masalas">Spices & Masalas (మసాలాలు)</option>
                    <option value="Dairy & Essentials">Dairy & Essentials (పాలు & నిత్యవసరాలు)</option>
                    <option value="Household & Pooja">Household & Pooja (గృహ & పూజ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.priceLabel} *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.unitLabel}</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="e.g. 1 kg / 1L"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.stockCountLabel}</label>
                  <input
                    type="number"
                    value={productForm.stockCount}
                    onChange={(e) => setProductForm({ ...productForm, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.imageUrlLabel}</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="inStockCheck" className="font-bold text-slate-800">
                  {t.inStockToggle}
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  {t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes / Remarks Modal */}
      {noteModalTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-2">
              {noteModalTarget.type === 'order' ? 'Store Order Remarks' : 'Water Tanker / Driver Notes'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Visible to customer on their tracking page (e.g. driver details, expected arrival time).
            </p>

            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Tanker AP03-T-4411 assigned. Driver Shankar arriving by 8:30 AM."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => setNoteModalTarget(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
              >
                {t.saveNotes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
