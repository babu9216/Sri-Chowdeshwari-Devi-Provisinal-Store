import React from 'react';
import { MapPin, Phone, MessageCircle, Navigation, Clock, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ShopSettings } from '../types';

interface FooterProps {
  settings: ShopSettings | null;
  onNavigate: (view: 'home' | 'shop' | 'tanker' | 'track' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const { language, t } = useLanguage();

  const phone = settings?.phone || '9876543210';
  const waPhone = settings?.whatsappPhone || '919876543210';
  const mapsUrl = settings?.googleMapsUrl || 'https://maps.google.com/?q=Om+Sakthi+Temple+Sanganapalli';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: About Business */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                S
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  {language === 'te' ? 'సంగనపల్లి షాప్' : 'Sanganapalli Shop'}
                </h4>
                <p className="text-[11px] text-sky-400 font-bold">
                  {language === 'te' ? '& సృజల వాటర్ ట్యాంకర్' : '& Srujala Water Tanker'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'te'
                ? 'సంగనపల్లి గ్రామం మరియు పరిసర ప్రాంతాల ప్రజలకు విశ్వసనీయమైన నాణ్యమైన కిరాణా సరుకులు మరియు స్వచ్ఛమైన నీటి ట్యాంకర్ సేవలు.'
                : 'Serving the residents, farmers, and visitors of Sanganapalli Village with pure drinking water and daily grocery essentials.'}
            </p>
            <div className="flex items-center space-x-2 pt-1 text-xs text-amber-400 font-medium">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{language === 'te' ? 'ఓం శక్తి ఆలయం సమీపంలో' : 'Near Om Sakthi Temple'}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {language === 'te' ? 'సేవలు' : 'Quick Services'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.myShop} (Groceries & Provisions)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tanker')}
                  className="hover:text-sky-400 transition-colors"
                >
                  {t.bookWaterTanker} (1,000L - 10,000L)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {t.trackOrder}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-slate-100 transition-colors"
                >
                  {t.adminLogin}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Timing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {language === 'te' ? 'పనివేళలు & సరఫరా' : 'Working Hours'}
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">
                    {language === 'te' ? settings?.workingHoursTe : settings?.workingHours}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'te' ? 'కిరాణా & ట్యాంకర్ నిరంతర సేవ' : 'Water tanker dispatch available on request'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">
                    {language === 'te' ? 'గ్రామ పరిధిలో డెలివరీ' : 'Sanganapalli & Outskirts'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'te' ? 'ఇళ్లు, ఆలయాలు, పొలాలు, ఫంక్షన్లు' : 'Homes, temples, farms & events'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Village Contact & Maps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {language === 'te' ? 'సంప్రదించండి' : 'Direct Helpline'}
            </h4>
            <div className="space-y-2">
              <a
                href={`tel:${phone}`}
                className="flex items-center space-x-2 text-xs text-emerald-400 hover:text-emerald-300 font-bold"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span className="font-mono">{phone}</span>
              </a>

              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-xs text-emerald-400 hover:text-emerald-300 font-bold"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp ({phone})</span>
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl transition-colors border border-slate-700 mt-2"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'గూగుల్ మ్యాప్స్‌లో షాప్' : 'Google Maps Directions'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & village love */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} Sanganapalli Shop & Srujala Water Tanker Service. All rights reserved.
          </p>
          <p className="flex items-center justify-center space-x-1 text-slate-400">
            <span>Serving Sanganapalli Village with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>Near Om Sakthi Temple</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
