import React from 'react';
import { ShoppingBag, Droplets, Phone, ShoppingCart, Search, UserCheck, Languages, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { ShopSettings } from '../types';

interface NavbarProps {
  activeView: 'home' | 'shop' | 'tanker' | 'track' | 'admin';
  setActiveView: (view: 'home' | 'shop' | 'tanker' | 'track' | 'admin') => void;
  settings: ShopSettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, settings }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { totalItemsCount, setIsCartOpen } = useCart();

  const phone = settings?.phone || '9876543210';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top village announcement bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-sky-900 text-white text-xs px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="font-medium tracking-wide truncate">
            {language === 'te' ? (settings?.locationTe || t.villageTag) : (settings?.location || t.villageTag)}
          </span>
        </div>
        <div className="flex items-center space-x-3 shrink-0 ml-2">
          <a
            href={`tel:${phone}`}
            className="flex items-center space-x-1 text-emerald-200 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline font-mono">{phone}</span>
          </a>
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition-colors"
            title="Switch Language"
          >
            <Languages className="w-3 h-3" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center text-white">
                <Droplets className="w-3 h-3 fill-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  {language === 'te' ? 'సంగనపల్లి షాప్' : 'Sanganapalli Shop'}
                </span>
                <span className="text-emerald-700 text-xs font-bold">&</span>
                <span className="font-bold text-base sm:text-lg text-sky-700 leading-tight">
                  {language === 'te' ? 'సృజల ట్యాంకర్' : 'Srujala Tanker'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === 'te' ? 'ఓం శక్తి ఆలయం వద్ద • గ్రామీణ సేవలు' : 'Near Om Sakthi Temple'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'home'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {language === 'te' ? 'హోమ్' : 'Home'}
            </button>

            <button
              onClick={() => setActiveView('shop')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'shop'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.myShop}</span>
            </button>

            <button
              onClick={() => setActiveView('tanker')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'tanker'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50'
              }`}
            >
              <Droplets className="w-4 h-4" />
              <span>{t.bookWaterTanker}</span>
            </button>

            <button
              onClick={() => setActiveView('track')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'track'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-700 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t.trackOrder}</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-200"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center shadow-xs animate-scale">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Admin button */}
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center space-x-1 p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                activeView === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Owner Admin Dashboard"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{t.adminLogin}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Quick Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold ${
            activeView === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span>{language === 'te' ? 'హోమ్' : 'Home'}</span>
        </button>

        <button
          onClick={() => setActiveView('shop')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold ${
            activeView === 'shop' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>{t.myShop}</span>
        </button>

        <button
          onClick={() => setActiveView('tanker')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold ${
            activeView === 'tanker' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Droplets className="w-5 h-5 mb-0.5 fill-current" />
          <span>{language === 'te' ? 'ట్యాంకర్' : 'Tanker'}</span>
        </button>

        <button
          onClick={() => setActiveView('track')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold ${
            activeView === 'track' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>{language === 'te' ? 'ట్రాక్' : 'Track'}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold text-emerald-800"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </div>
          <span>{t.cart}</span>
        </button>
      </div>
    </header>
  );
};
