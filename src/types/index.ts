export type Language = 'en' | 'te';

export interface Product {
  id: string;
  name: string;
  nameTe: string;
  category: string;
  categoryTe: string;
  price: number;
  unit: string;
  unitTe: string;
  inStock: boolean;
  stockCount: number;
  imageUrl: string;
  description?: string;
  descriptionTe?: string;
}

export interface TankerTier {
  id: string;
  capacityLiters: number;
  title: string;
  titleTe: string;
  basePrice: number;
  deliveryCharge: number;
  isPopular?: boolean;
  description: string;
  descriptionTe: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameTe: string;
  price: number;
  quantity: number;
  unit: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'rejected';

export interface Order {
  id: string;
  customerName: string;
  mobileNumber: string;
  address: string;
  landmark: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'upi' | 'store_pickup';
  status: OrderStatus;
  specialInstructions?: string;
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TankerBookingStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';

export interface TankerBooking {
  id: string;
  customerName: string;
  mobileNumber: string;
  address: string;
  landmark: string;
  capacityLiters: number;
  waterType: 'drinking_ro' | 'domestic_utility';
  requiredDate: string;
  requiredTimeSlot: string;
  basePrice: number;
  deliveryCharge: number;
  totalAmount: number;
  specialInstructions?: string;
  status: TankerBookingStatus;
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  shopName: string;
  shopNameTe: string;
  tankerName: string;
  tankerNameTe: string;
  location: string;
  locationTe: string;
  phone: string;
  whatsappPhone: string;
  upiId: string;
  googleMapsUrl: string;
  minOrderForFreeDelivery: number;
  defaultShopDeliveryCharge: number;
  workingHours: string;
  workingHoursTe: string;
}

export interface CustomerSummary {
  name: string;
  phone: string;
  address: string;
  shopOrders: number;
  tankerBookings: number;
  totalSpent: number;
  lastActivity: string;
}

export interface AnalyticsData {
  summary: {
    totalRevenue: number;
    shopRevenue: number;
    tankerRevenue: number;
    totalShopOrders: number;
    totalTankerBookings: number;
    pendingShopOrders: number;
    pendingTankerBookings: number;
    todaySales: number;
    todayShopSales: number;
    todayTankerSales: number;
    todayOrdersCount: number;
    todayBookingsCount: number;
    monthSales: number;
    monthShopSales: number;
    monthTankerSales: number;
    monthOrdersCount: number;
    monthBookingsCount: number;
    totalCustomersCount: number;
  };
  customers: CustomerSummary[];
}
