import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ShopSettings } from '../types';

interface CartDrawerProps {
  settings: ShopSettings | null;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ settings, onProceedToCheckout }) => {
  const { items, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, subtotal, totalItemsCount } = useCart();
  const { language, t } = useLanguage();

  if (!isCartOpen) return null;

  const minForFree = settings?.minOrderForFreeDelivery || 300;
  const standardFee = settings?.defaultShopDeliveryCharge || 20;
  const isFreeDelivery = subtotal >= minForFree;
  const deliveryCharge = isFreeDelivery ? 0 : standardFee;
  const totalAmount = subtotal + deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {t.yourCart} ({totalItemsCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-3xl mb-4">
                  🛒
                </div>
                <h3 className="font-bold text-slate-800 text-base">{t.emptyCart}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                  {t.emptyCartSubtitle}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
                >
                  {t.continueShopping}
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.product.id}
                  className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-200"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {language === 'te' ? item.product.nameTe : item.product.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'te' ? item.product.unitTe : item.product.unit} • ₹{item.product.price}
                    </p>

                    {/* Stepper */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black text-slate-900 font-mono w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockCount}
                        className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900">
                      ₹{item.product.price * item.quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="block p-1 text-slate-400 hover:text-red-600 transition-colors ml-auto mt-2"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with totals & action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Free delivery tracker */}
              {!isFreeDelivery && (
                <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-center font-medium">
                  {language === 'te'
                    ? `ఇంకా ₹${minForFree - subtotal} కొంటే ఉచిత డెలివరీ లభిస్తుంది!`
                    : `Add ₹${minForFree - subtotal} more for FREE village delivery!`}
                </div>
              )}

              {/* Bill details */}
              <div className="space-y-1.5 text-xs sm:text-sm">
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
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t.totalAmount}</span>
                  <span className="text-emerald-800">₹{totalAmount}</span>
                </div>
              </div>

              {/* Checkout button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-700/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-1 text-xs text-slate-400 hover:text-red-600 transition-colors font-medium text-center"
              >
                {t.clearCart}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
