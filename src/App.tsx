import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ShopView } from './components/ShopView';
import { TankerBookingView } from './components/TankerBookingView';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { Footer } from './components/Footer';
import { api } from './services/api';
import { Product, TankerTier, ShopSettings } from './types';

function MainApp() {
  const { language } = useLanguage();
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();

  const [activeView, setActiveView] = useState<'home' | 'shop' | 'tanker' | 'track' | 'admin'>('home');
  const [trackQuery, setTrackQuery] = useState<string>('');

  const [products, setProducts] = useState<Product[]>([]);
  const [tankerTiers, setTankerTiers] = useState<TankerTier[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppData = async () => {
    try {
      const [prodRes, tierRes, settRes] = await Promise.all([
        api.getProducts(),
        api.getTankerTiers(),
        api.getSettings(),
      ]);
      setProducts(prodRes);
      setTankerTiers(tierRes);
      setSettings(settRes);
    } catch (err) {
      console.error('Failed to load initial app data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const handleHeroTrackLookup = (query: string) => {
    setTrackQuery(query);
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackDirect = (id: string) => {
    setTrackQuery(id);
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        settings={settings}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div>
            <HeroSection
              onNavigate={(v) => {
                setActiveView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onTrackLookup={handleHeroTrackLookup}
              settings={settings}
            />

            {/* Featured Shop Section Preview */}
            <section className="bg-white py-12 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      {language === 'te' ? 'జనరల్ & కిరాణా స్టోర్' : 'Village Grocery Store'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      {language === 'te' ? 'ప్రముఖ సరుకులు & నిత్యవసరాలు' : 'Daily Essentials & Groceries'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {language === 'te'
                        ? 'బియ్యం, పప్పులు, వంట నూనెలు, పాలు మరియు పూజా వస్తువులు'
                        : 'Fresh provisions, grains, cooking oils, and temple pooja items'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveView('shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1"
                  >
                    <span>{language === 'te' ? 'అన్ని సరుకులు చూడండి' : 'View Full Shop Catalog'}</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Show top 4 products preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveView('shop');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer bg-slate-50 rounded-2xl border border-slate-200 p-3 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-square rounded-xl bg-white overflow-hidden mb-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2">
                          {language === 'te' ? p.nameTe : p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'te' ? p.unitTe : p.unit}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">₹{p.price}</span>
                        <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                          {language === 'te' ? 'ఆర్డర్ →' : 'Order →'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Srujala Tanker Quick Highlight Banner */}
            <section className="bg-gradient-to-r from-sky-900 via-sky-800 to-teal-900 text-white py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                    {language === 'te' ? 'నీటి ఎద్దడి లేకుండా తక్షణ సరఫరా' : 'Reliable Village Water Supply'}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black mt-3">
                    {language === 'te'
                      ? 'సృజల వాటర్ ట్యాంకర్ సర్వీస్ - మీ ఇంటి వద్దకే స్వచ్ఛమైన నీరు'
                      : 'Srujala Water Tanker - 1,000 to 10,000 Liters Delivered Fast'}
                  </h2>
                  <p className="text-sm sm:text-base text-sky-100 mt-2 leading-relaxed">
                    {language === 'te'
                      ? 'గ్రామంలోని ఇళ్లకు, ఓం శక్తి ఆలయ ఉత్సవాలకు, వ్యవసాయ తోటలకు మరియు భవన నిర్మాణాలకు స్వచ్ఛమైన RO తాగునీరు మరియు బోరుబావి నీరు సరఫరా చేయబడును.'
                      : 'Equipped with heavy duty pipes and prompt delivery across Sanganapalli village, Om Sakthi Temple surroundings, and agricultural fields.'}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setActiveView('tanker');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md"
                    >
                      {language === 'te' ? 'ట్యాంకర్ బుక్ చేయండి' : 'Book a Tanker Online'}
                    </button>
                    <a
                      href={`tel:${settings?.phone || '9876543210'}`}
                      className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-sm transition-colors border border-white/20"
                    >
                      {language === 'te' ? 'డ్రైవర్‌ని సంప్రదించండి' : 'Call Driver Directly'}
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeView === 'shop' && (
          <ShopView
            products={products}
            settings={settings}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

        {activeView === 'tanker' && (
          <TankerBookingView
            tankerTiers={tankerTiers}
            settings={settings}
            onTrackBooking={handleTrackDirect}
          />
        )}

        {activeView === 'track' && (
          <OrderTrackingModal
            initialQuery={trackQuery}
            settings={settings}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard
            settings={settings}
            onRefreshSettings={fetchAppData}
            onRefreshProducts={fetchAppData}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        settings={settings}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        settings={settings}
        onTrackOrder={handleTrackDirect}
      />

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
