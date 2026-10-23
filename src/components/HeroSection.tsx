import React, { useState } from 'react';
import { ShoppingBag, Droplets, Phone, MessageCircle, MapPin, Navigation, ArrowRight, ShieldCheck, Clock, CheckCircle2, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ShopSettings } from '../types';

interface HeroSectionProps {
  onNavigate: (view: 'shop' | 'tanker' | 'track') => void;
  onTrackLookup: (query: string) => void;
  settings: ShopSettings | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onTrackLookup, settings }) => {
  const { language, t } = useLanguage();
  const [trackInput, setTrackInput] = useState('');

  const phone = settings?.phone || '9876543210';
  const waPhone = settings?.whatsappPhone || '919876543210';
  const mapsUrl = settings?.googleMapsUrl || 'https://maps.google.com/?q=Om+Sakthi+Temple+Sanganapalli';

  const waText = encodeURIComponent(
    language === 'te'
      ? 'నమస్కారం అండి! సంగనపల్లి షాప్ / సృజల వాటర్ ట్యాంకర్ వివరాలు కావాలి.'
      : 'Hello! I would like to inquire about Sanganapalli Shop & Srujala Water Tanker services.'
  );

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      onTrackLookup(trackInput.trim());
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50/50 to-slate-50 pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-slate-200">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Village Tag */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            {language === 'te' ? 'ఓం శక్తి ఆలయం వద్ద • సంగనపల్లి గ్రామం' : 'Near Om Sakthi Temple • Sanganapalli Village'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t.feature3}
          </span>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'te' ? (
              <>
                <span className="text-emerald-700">సంగనపల్లి కిరాణా షాప్</span>
                <span className="text-slate-400 font-light mx-2">&</span>
                <br className="hidden sm:inline" />
                <span className="text-sky-700">సృజల వాటర్ ట్యాంకర్ సర్వీస్</span>
              </>
            ) : (
              <>
                <span className="text-emerald-700">Sanganapalli Shop</span>
                <span className="text-slate-400 font-light mx-2">&</span>
                <br className="hidden sm:inline" />
                <span className="text-sky-700">Srujala Water Tanker</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t.heroSubtitle}
          </p>
        </div>

        {/* 2 Primary Action Buttons: "My Shop" & "Book Water Tanker" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          {/* My Shop Button */}
          <button
            onClick={() => onNavigate('shop')}
            className="group relative flex items-center justify-between p-5 sm:p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-700/35 hover:-translate-y-0.5 transition-all text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-13 h-13 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-emerald-200 font-bold">
                  {language === 'te' ? 'కిరాణా సరుకులు' : 'Daily Groceries'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {t.myShop}
                </h3>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  {language === 'te' ? 'బియ్యం, నూనెలు, పప్పులు, మసాలాలు' : 'Rice, Oils, Dals, Spices & Essentials'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-emerald-200 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0 ml-2" />
          </button>

          {/* Book Water Tanker Button */}
          <button
            onClick={() => onNavigate('tanker')}
            className="group relative flex items-center justify-between p-5 sm:p-6 bg-gradient-to-br from-sky-600 to-cyan-700 text-white rounded-2xl shadow-lg shadow-sky-700/25 hover:shadow-xl hover:shadow-sky-700/35 hover:-translate-y-0.5 transition-all text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-13 h-13 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <Droplets className="w-7 h-7 fill-white" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-sky-200 font-bold">
                  {language === 'te' ? 'మంచి నీటి సరఫరా' : 'Clean Water Tanker'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {t.bookWaterTanker}
                </h3>
                <p className="text-xs text-sky-100 font-medium mt-0.5">
                  {language === 'te' ? '1,000 నుండి 10,000 లీటర్ల ట్యాంకర్లు' : '1,000L to 10,000L Clean Delivery'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-sky-200 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0 ml-2" />
          </button>
        </div>

        {/* Quick Contact & Google Maps Navigation Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Call Now */}
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-300 transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>{t.callNow}: <span className="font-mono">{phone}</span></span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${waPhone}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.whatsappUs}</span>
            </a>

            {/* Google Maps Location */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-xl border border-sky-300 transition-colors text-sm"
            >
              <Navigation className="w-4 h-4 text-sky-700" />
              <span>{t.navigateMap}</span>
            </a>
          </div>

          {/* Quick Track Bar inside Hero */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder={language === 'te' ? 'ఆర్డర్ ఐడీ (ORD-...) లేదా ట్యాంకర్ ఐడీ లేదా ఫోన్ నంబర్' : 'Check status: Enter Order ID, Tanker ID or Phone'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
              >
                {t.trackButton}
              </button>
            </form>
          </div>
        </div>

        {/* Village Highlights info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mt-8">
          <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/80 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{language === 'te' ? 'ఓం శక్తి గుడి' : 'Om Sakthi Temple'}</p>
              <p className="text-[11px] text-slate-500">{language === 'te' ? 'కేంద్ర స్థానం' : 'Central Landmark'}</p>
            </div>
          </div>

          <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/80 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-800 shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{language === 'te' ? 'RO & బోర్ నీరు' : 'RO & Utility Water'}</p>
              <p className="text-[11px] text-slate-500">{language === 'te' ? '1,000L - 10,000L' : 'Any Quantity'}</p>
            </div>
          </div>

          <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/80 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{language === 'te' ? 'రోజూ తెరిచి ఉంటుంది' : 'Open 7 Days'}</p>
              <p className="text-[11px] text-slate-500">{language === 'te' ? 'ఉదయం 6:30 - రాత్రి 9:30' : '6:30 AM - 9:30 PM'}</p>
            </div>
          </div>

          <div className="p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/80 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{language === 'te' ? 'నమ్మకమైన కిరాణా' : 'Quality Assured'}</p>
              <p className="text-[11px] text-slate-500">{language === 'te' ? 'సంగనపల్లి ప్రజల కోసం' : 'Village Pricing'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
