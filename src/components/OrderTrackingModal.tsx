import React, { useState, useEffect } from 'react';
import { Search, Phone, CheckCircle2, Clock, Truck, Package, XCircle, AlertCircle, ShoppingBag, Droplets, MapPin, X } from 'lucide-react';
import { Order, TankerBooking, ShopSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface OrderTrackingModalProps {
  initialQuery?: string;
  onClose?: () => void;
  settings: ShopSettings | null;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ initialQuery = '', onClose, settings }) => {
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [booking, setBooking] = useState<TankerBooking | null>(null);

  const performLookup = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    setOrder(null);
    setBooking(null);

    try {
      const res = await api.trackAny(query.trim());
      if (res.order) {
        setOrder(res.order);
      } else if (res.booking) {
        setBooking(res.booking);
      } else {
        setError(t.noRecordsFound);
      }
    } catch {
      setError(t.noRecordsFound);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performLookup(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchQuery);
  };

  const getOrderStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'accepted': return 2;
      case 'packing': return 3;
      case 'out_for_delivery': return 4;
      case 'delivered': return 5;
      case 'rejected': return -1;
      default: return 1;
    }
  };

  const getTankerStatusStep = (status: TankerBooking['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'dispatched': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 1;
    }
  };

  const ownerPhone = settings?.phone || '9876543210';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.trackingTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.trackingSubtitle}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'te' ? 'ఉదా: ORD-SANGA-1021 లేదా TNK-SRU-2041 లేదా 9876543210' : 'e.g. ORD-SANGA-1021, TNK-SRU-2041, or 10-digit mobile number'}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? '...' : t.trackButton}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm flex items-start space-x-3 mb-8">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{language === 'te' ? 'స్టేటస్ కనుగొనబడలేదు' : 'Record Not Found'}</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Shop Order Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {language === 'te' ? 'కిరాణా ఆర్డర్' : 'Shop Grocery Order'}
                </span>
                <h3 className="text-xl font-black text-slate-900 font-mono">
                  {order.id}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
              <div className="text-lg font-black text-emerald-800">₹{order.totalAmount}</div>
            </div>
          </div>

          {/* Progress Timeline */}
          {order.status === 'rejected' ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-bold">{t.statusRejected}</p>
                <p className="text-xs">{order.ownerNotes || 'Order could not be fulfilled.'}</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-5 gap-1 relative text-center">
                {/* Connecting track line */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-6 h-1 bg-emerald-600 transition-all -z-0"
                  style={{ width: `${((getOrderStatusStep(order.status) - 1) / 4) * 85}%` }}
                />

                {/* Step 1: Placed */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getOrderStatusStep(order.status) >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    1
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{t.statusPending}</span>
                </div>

                {/* Step 2: Accepted */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getOrderStatusStep(order.status) >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    2
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{t.statusAccepted}</span>
                </div>

                {/* Step 3: Packing */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getOrderStatusStep(order.status) >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    3
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{t.statusPacking}</span>
                </div>

                {/* Step 4: Out for Delivery */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getOrderStatusStep(order.status) >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    4
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{t.statusOutForDelivery}</span>
                </div>

                {/* Step 5: Delivered */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getOrderStatusStep(order.status) >= 5 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    ✓
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{t.statusDelivered}</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Details & Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {language === 'te' ? 'డెలివరీ చిరునామా' : 'Delivery Address'}
              </h4>
              <p className="font-bold text-slate-900 text-sm">{order.customerName} ({order.mobileNumber})</p>
              <p className="text-xs text-slate-600 mt-1">{order.address}</p>
              <p className="text-xs text-slate-500">{order.landmark}</p>
              {order.ownerNotes && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                  <span className="font-bold">{language === 'te' ? 'షాప్ ఓనర్ సందేశం' : 'Store Update'}:</span> {order.ownerNotes}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {language === 'te' ? 'ఆర్డర్ చేసిన వస్తువులు' : 'Ordered Items'}
              </h4>
              <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-800">
                      {item.quantity}x {language === 'te' ? item.productNameTe : item.productName}
                    </span>
                    <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Need help footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {language === 'te' ? 'ఆర్డర్ గురించి సందేహాలుంటే సంప్రదించండి:' : 'Need assistance with this order?'}
            </span>
            <a
              href={`tel:${ownerPhone}`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{ownerPhone}</span>
            </a>
          </div>
        </div>
      )}

      {/* Water Tanker Booking Display */}
      {booking && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <Droplets className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {language === 'te' ? 'సృజల వాటర్ ట్యాంకర్ బుకింగ్' : 'Srujala Water Tanker'}
                </span>
                <h3 className="text-xl font-black text-slate-900 font-mono">
                  {booking.id}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500">{booking.requiredDate} ({booking.requiredTimeSlot})</span>
              <div className="text-lg font-black text-sky-800">₹{booking.totalAmount}</div>
            </div>
          </div>

          {/* Progress Timeline */}
          {booking.status === 'cancelled' ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-bold">{t.statusCancelled}</p>
                <p className="text-xs">{booking.ownerNotes || 'Booking could not be accommodated.'}</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-4 gap-1 relative text-center">
                <div className="absolute top-4 left-8 right-8 h-1 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-8 h-1 bg-sky-600 transition-all -z-0"
                  style={{ width: `${((getTankerStatusStep(booking.status) - 1) / 3) * 82}%` }}
                />

                {/* Step 1: Received */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getTankerStatusStep(booking.status) >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    1
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{t.statusPending}</span>
                </div>

                {/* Step 2: Confirmed */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getTankerStatusStep(booking.status) >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    2
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{language === 'te' ? 'ధృవీకరించబడింది' : 'Confirmed'}</span>
                </div>

                {/* Step 3: Dispatched */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getTankerStatusStep(booking.status) >= 3 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    3
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{t.statusDispatched}</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    getTankerStatusStep(booking.status) >= 4 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    ✓
                  </div>
                  <span className="text-[11px] font-bold mt-2 text-slate-800">{t.statusDelivered}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tanker Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'te' ? 'ట్యాంకర్ వివరాలు' : 'Tanker Specifications'}
              </span>
              <div className="flex justify-between">
                <span className="text-slate-600">{language === 'te' ? 'పరిమాణం' : 'Capacity'}:</span>
                <span className="font-bold text-sky-800">{booking.capacityLiters.toLocaleString()} {t.liters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{language === 'te' ? 'నీటి రకం' : 'Water Quality'}:</span>
                <span className="font-bold text-slate-900">
                  {booking.waterType === 'drinking_ro' ? 'Drinking RO Purified' : 'Domestic Bore Water'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{language === 'te' ? 'డెలివరీ సమయం' : 'Time Slot'}:</span>
                <span className="font-medium text-slate-900">{booking.requiredTimeSlot}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'te' ? 'డెలివరీ లొకేషన్' : 'Destination'}
              </span>
              <p className="font-bold text-slate-900">{booking.customerName} ({booking.mobileNumber})</p>
              <p className="text-slate-600 text-xs">{booking.address}</p>
              <p className="text-slate-500 text-xs">{booking.landmark}</p>
              {booking.specialInstructions && (
                <p className="text-xs italic text-amber-900 bg-amber-50 p-2 rounded-lg mt-1">
                  "{booking.specialInstructions}"
                </p>
              )}
            </div>
          </div>

          {booking.ownerNotes && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900">
              <span className="font-bold">{language === 'te' ? 'ట్యాంకర్ డ్రైవర్ / ఓనర్ సమాచారం' : 'Driver / Tanker Info'}:</span> {booking.ownerNotes}
            </div>
          )}

          {/* Contact driver */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {language === 'te' ? 'ట్యాంకర్ డెలివరీ ఫోన్ నంబర్:' : 'Direct tanker dispatch helpline:'}
            </span>
            <a
              href={`tel:${ownerPhone}`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300 rounded-xl text-xs font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{ownerPhone}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
