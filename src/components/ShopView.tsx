import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, ShoppingCart, Check, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { Product, ShopSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface ShopViewProps {
  products: Product[];
  settings: ShopSettings | null;
  onOpenCheckout: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ products, settings, onOpenCheckout }) => {
  const { language, t } = useLanguage();
  const { items, addToCart, updateQuantity, totalItemsCount, subtotal, setIsCartOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Compute categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Filter products based on search query & category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.nameTe.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.categoryTe.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.descriptionTe && product.descriptionTe.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const getItemQuantityInCart = (productId: string) => {
    const item = items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const freeThreshold = settings?.minOrderForFreeDelivery || 300;
  const deliveryCharge = settings?.defaultShopDeliveryCharge || 20;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Free Delivery Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'తాజా సరుకులు • ఉత్తమ ధరలు' : 'Daily Fresh Provisions'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.shopTitle}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            {t.shopSubtitle}
          </p>
        </div>

        {/* Free Delivery alert pill */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-2xl shadow-sm flex items-center space-x-3 text-xs sm:text-sm font-semibold max-w-md">
          <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
            🚚
          </div>
          <div>
            <p className="font-bold">
              {language === 'te'
                ? `సంగనపల్లిలో ₹${freeThreshold} పైన ఆర్డర్లకు ఉచిత డెలివరీ!`
                : `Free village delivery on orders above ₹${freeThreshold}!`}
            </p>
            <p className="text-[11px] text-emerald-100 font-normal">
              {language === 'te'
                ? `తక్కువ ఆర్డర్లకు నామమాత్రపు ఛార్జ్: ₹${deliveryCharge}`
                : `Below ₹${freeThreshold}: Standard delivery ₹${deliveryCharge}`}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="space-y-4 mb-8">
        {/* Search Input */}
        <div className="relative max-w-xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills (horizontal scrollable on mobile) */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.allCategories} ({products.length})
          </button>

          {categories.map(cat => {
            // Find sample te name
            const sample = products.find(p => p.category === cat);
            const label = language === 'te' ? (sample?.categoryTe || cat) : cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs my-6">
          <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-2xl mb-3">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {language === 'te' ? 'ఎటువంటి వస్తువులు కనుగొనబడలేదు' : 'No grocery items found'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {language === 'te'
              ? 'మీరు వెతుకుతున్న పేరు మార్చి లేదా కేటగిరీ మార్చి ప్రయత్నించండి.'
              : 'Try searching with another keyword or select a different category.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            {language === 'te' ? 'అన్ని వస్తువులు చూడండి' : 'Show All Items'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {filteredProducts.map(product => {
            const quantityInCart = getItemQuantityInCart(product.id);
            const isOutOfStock = !product.inStock || product.stockCount <= 0;

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Stock badge */}
                    <div className="absolute top-2 left-2">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-600 text-white shadow-xs">
                          {t.outOfStock}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700 text-white shadow-xs">
                          {t.inStock}
                        </span>
                      )}
                    </div>

                    {/* Category pill */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-slate-700 backdrop-blur-xs shadow-2xs">
                        {language === 'te' ? product.categoryTe : product.category}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3.5 sm:p-4">
                    {/* Primary Name */}
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {language === 'te' ? product.nameTe : product.name}
                    </h3>

                    {/* Subtitle in alternate language for village clarity */}
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                      {language === 'te' ? product.name : product.nameTe}
                    </p>

                    {/* Unit / Pack Size */}
                    <div className="mt-2 text-xs font-medium text-slate-600 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                      {language === 'te' ? product.unitTe : product.unit}
                    </div>

                    {/* Description preview */}
                    {(product.description || product.descriptionTe) && (
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                        {language === 'te' ? (product.descriptionTe || product.description) : (product.description || product.descriptionTe)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Cart Actions */}
                <div className="p-3.5 sm:p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">{language === 'te' ? 'ధర' : 'Price'}</span>
                    <div className="text-lg sm:text-xl font-black text-slate-900">
                      ₹{product.price}
                    </div>
                  </div>

                  {/* Add / Stepper button */}
                  <div>
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="px-3 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
                      >
                        {t.outOfStock}
                      </button>
                    ) : quantityInCart > 0 ? (
                      <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                          className="w-7 h-7 rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 flex items-center justify-center font-bold text-sm shadow-2xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-emerald-950 font-mono">
                          {quantityInCart}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                          disabled={quantityInCart >= product.stockCount}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="flex items-center space-x-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t.addToCart}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar (active if items in cart) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-lg mx-auto z-30">
          <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center justify-between border border-slate-700 animate-slide-up">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                {totalItemsCount}
              </div>
              <div>
                <p className="text-xs text-slate-300 font-medium">
                  {totalItemsCount} {language === 'te' ? 'వస్తువులు' : 'Items'} • {language === 'te' ? 'సరుకుల మొత్తం' : 'Subtotal'}
                </p>
                <p className="text-base sm:text-lg font-black text-amber-300">
                  ₹{subtotal}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                {t.cart}
              </button>
              <button
                onClick={onOpenCheckout}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center space-x-1"
              >
                <span>{language === 'te' ? 'ఆర్డర్ చెయ్' : 'Order Now'}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
