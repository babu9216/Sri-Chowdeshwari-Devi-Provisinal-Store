import React, { useState } from 'react';
import { X, CheckCircle, Copy, Check, MessageCircle, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Order, ShopSettings } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings | null;
  onTrackOrder: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, settings, onTrackOrder }) => {
  const { items, subtotal, toOrderItems, clearCart } = useCart();
  const { language, t } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'store_pickup'>('cod');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const minForFree = settings?.minOrderForFreeDelivery || 300;
  const standardFee = settings?.defaultShopDeliveryCharge || 20;
  const isFreeDelivery = subtotal >= minForFree || paymentMethod === 'store_pickup';
  const deliveryCharge = isFreeDelivery ? 0 : standardFee;
  const totalAmount = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage(language === 'te' ? 'దయచేసి మీ పేరు నమోదు చేయండి' : 'Please enter your name');
      return;
    }

    const cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(language === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!address.trim()) {
      setErrorMessage(language === 'te' ? 'దయచేసి డెలివరీ చిరునామా నమోదు చేయండి' : 'Please enter delivery address');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await api.createOrder({
        customerName: customerName.trim(),
        mobileNumber: cleanPhone,
        address: address.trim(),
        landmark: landmark.trim() || 'Sanganapalli',
        items: toOrderItems(),
        paymentMethod,
        specialInstructions: specialInstructions.trim(),
      });

      setCreatedOrder(order);
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order. Please check and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Build WhatsApp share message
  const getWhatsAppUrl = () => {
    if (!createdOrder) return '#';
    const waPhone = settings?.whatsappPhone || '919876543210';
    const itemsList = createdOrder.items
      .map(i => `• ${i.productName} (${i.quantity} x ₹${i.price} = ₹${i.quantity * i.price})`)
      .join('\n');

    const msg = `*🛒 NEW SANGANAPALLI SHOP ORDER*\n` +
      `*Order ID:* ${createdOrder.id}\n` +
      `*Customer:* ${createdOrder.customerName}\n` +
      `*Phone:* ${createdOrder.mobileNumber}\n` +
      `*Address:* ${createdOrder.address}\n` +
      `*Landmark:* ${createdOrder.landmark}\n` +
      `*Payment:* ${createdOrder.paymentMethod.toUpperCase()}\n\n` +
      `*ITEMS:*\n${itemsList}\n\n` +
      `*Subtotal:* ₹${createdOrder.subtotal}\n` +
      `*Delivery Fee:* ₹${createdOrder.deliveryCharge}\n` +
      `*TOTAL PAYABLE:* ₹${createdOrder.totalAmount}\n\n` +
      (createdOrder.specialInstructions ? `*Notes:* ${createdOrder.specialInstructions}\n\n` : '') +
      `Please confirm my order delivery!`;

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {createdOrder ? (
          /* Confirmation Screen */
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {t.orderSuccessTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs mx-auto">
                {t.orderSuccessMessage}
              </p>
            </div>

            {/* Order ID Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {t.yourOrderId}
              </p>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="font-mono text-lg font-black text-emerald-800">
                  {createdOrder.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {createdOrder.items.length} {language === 'te' ? 'వస్తువులు' : 'items'} • ₹{createdOrder.totalAmount} ({createdOrder.paymentMethod.toUpperCase()})
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md flex items-center justify-center space-x-2 text-sm transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t.sendToWhatsapp}</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onTrackOrder(createdOrder.id);
                }}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm transition-all shadow-xs"
              >
                {t.trackYourOrder}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                {t.continueShopping}
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{items.length} {language === 'te' ? 'వస్తువులు' : 'Items'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.checkoutTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {language === 'te'
                  ? 'సంగనపల్లి గ్రామ డెలివరీ కోసం మీ చిరునామా నమోదు చేయండి.'
                  : 'Enter delivery details for fast doorstep delivery in Sanganapalli.'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customerName} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.mobileNumber} *
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder={t.mobilePlaceholder}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Address & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.deliveryAddress} *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.addressPlaceholder}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.landmark}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={t.landmarkPlaceholder}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`flex flex-col items-center text-center p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="sr-only"
                    />
                    <span className="text-base mb-0.5">💵</span>
                    <span>{language === 'te' ? 'నగదు (COD)' : 'Cash (COD)'}</span>
                  </label>

                  <label
                    className={`flex flex-col items-center text-center p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="sr-only"
                    />
                    <span className="text-base mb-0.5">📱</span>
                    <span>{language === 'te' ? 'యూపీఐ (UPI)' : 'UPI on Delivery'}</span>
                  </label>

                  <label
                    className={`flex flex-col items-center text-center p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                      paymentMethod === 'store_pickup'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="store_pickup"
                      checked={paymentMethod === 'store_pickup'}
                      onChange={() => setPaymentMethod('store_pickup')}
                      className="sr-only"
                    />
                    <span className="text-base mb-0.5">🏬</span>
                    <span>{language === 'te' ? 'షాప్ పికప్' : 'Store Pickup'}</span>
                  </label>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.specialInstructions}
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t.instructionsPlaceholder}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Bill Summary */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t.deliveryFee}</span>
                  <span className={isFreeDelivery ? 'font-bold text-emerald-700' : 'font-semibold text-slate-900'}>
                    {isFreeDelivery ? t.free : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>{t.totalAmount}</span>
                  <span className="text-emerald-800">₹{totalAmount}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-700/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50"
              >
                <span>{isSubmitting ? t.submitting : t.submitOrder}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
