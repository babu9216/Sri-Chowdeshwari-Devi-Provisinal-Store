import { Product, TankerTier, Order, TankerBooking, ShopSettings, AnalyticsData } from '../types';

const TOKEN_KEY = 'sanganapalli_admin_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Auth
  async login(password: string): Promise<{ success: boolean; token: string; user: { name: string; email: string } }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      clearAuthToken();
    }
  },

  async checkAuth(): Promise<boolean> {
    const token = getAuthToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/me', { headers: getHeaders() });
      return res.ok;
    } catch {
      return false;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; token: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update password');
    }
    const data = await res.json();
    setAuthToken(data.token);
    return data;
  },

  // Settings
  async getSettings(): Promise<ShopSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<ShopSettings>): Promise<ShopSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update settings');
    }
    return res.json();
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete product');
    }
  },

  // Tanker Tiers
  async getTankerTiers(): Promise<TankerTier[]> {
    const res = await fetch('/api/tanker-tiers');
    if (!res.ok) throw new Error('Failed to fetch tanker tiers');
    return res.json();
  },

  async updateTankerTiers(tiers: TankerTier[]): Promise<TankerTier[]> {
    const res = await fetch('/api/tanker-tiers', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(tiers),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update tanker tiers');
    }
    return res.json();
  },

  // Orders
  async createOrder(orderData: {
    customerName: string;
    mobileNumber: string;
    address: string;
    landmark: string;
    items: Order['items'];
    paymentMethod: Order['paymentMethod'];
    specialInstructions?: string;
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateOrderStatus(id: string, status: Order['status'], ownerNotes?: string): Promise<Order> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, ownerNotes }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async deleteOrder(id: string): Promise<void> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete order');
  },

  // Tanker Bookings
  async createTankerBooking(bookingData: {
    customerName: string;
    mobileNumber: string;
    address: string;
    landmark: string;
    capacityLiters: number;
    waterType: 'drinking_ro' | 'domestic_utility';
    requiredDate: string;
    requiredTimeSlot: string;
    specialInstructions?: string;
  }): Promise<TankerBooking> {
    const res = await fetch('/api/tanker-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to book tanker');
    }
    return res.json();
  },

  async getTankerBookings(): Promise<TankerBooking[]> {
    const res = await fetch('/api/tanker-bookings', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load tanker bookings');
    return res.json();
  },

  async getTankerBookingById(id: string): Promise<TankerBooking> {
    const res = await fetch(`/api/tanker-bookings/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Booking not found');
    return res.json();
  },

  async updateTankerBookingStatus(id: string, status: TankerBooking['status'], ownerNotes?: string): Promise<TankerBooking> {
    const res = await fetch(`/api/tanker-bookings/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, ownerNotes }),
    });
    if (!res.ok) throw new Error('Failed to update booking status');
    return res.json();
  },

  async deleteTankerBooking(id: string): Promise<void> {
    const res = await fetch(`/api/tanker-bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete booking');
  },

  // Search by Phone or ID
  async trackAny(query: string): Promise<{ order?: Order; booking?: TankerBooking; error?: string }> {
    const clean = query.trim();
    if (!clean) return { error: 'Query empty' };

    if (clean.toUpperCase().startsWith('ORD-')) {
      try {
        const order = await this.getOrderById(clean);
        return { order };
      } catch {
        return { error: 'Order not found' };
      }
    }

    if (clean.toUpperCase().startsWith('TNK-')) {
      try {
        const booking = await this.getTankerBookingById(clean);
        return { booking };
      } catch {
        return { error: 'Tanker booking not found' };
      }
    }

    // Try fetching by phone number
    const cleanDigits = clean.replace(/[^0-9]/g, '');
    if (cleanDigits.length >= 10) {
      try {
        const [ordersRes, bookingsRes] = await Promise.all([
          fetch(`/api/orders?phone=${cleanDigits}`),
          fetch(`/api/tanker-bookings?phone=${cleanDigits}`),
        ]);
        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

        if (orders.length > 0) return { order: orders[0] };
        if (bookings.length > 0) return { booking: bookings[0] };
      } catch {
        // ignore
      }
    }

    return { error: 'No matching record found' };
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch('/api/analytics', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  },
};
