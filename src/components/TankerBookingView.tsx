import React, { useState } from 'react';
import { Droplets, CheckCircle, Copy, Check, MessageCircle, Calendar, Clock, MapPin, ShieldCheck, ArrowRight, Info, Truck } from 'lucide-react';
import { TankerTier, TankerBooking, ShopSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface TankerBookingViewProps {
  tankerTiers: TankerTier[];
  settings: ShopSettings | null;
  onTrackBooking: (bookingId: string) => void;
}

export const TankerBookingView: React.FC<TankerBookingViewProps> = ({ tankerTiers, settings, onTrackBooking }) => {
  const { language, t } = useLanguage();

  const [selectedCapacity, setSelectedCapacity] = useState<number>(() => {
    const popular = tankerTiers.find(t => t.isPopular);
    return popular ? popular.capacityLiters : 2000;
  });

  const [waterType, setWaterType] = useState<'drinking_ro' | 'domestic_utility'>('drinking_ro');

  // Today formatted as YYYY-MM-DD for min date
  const todayStr = new Date().toISOString().split('T')[0];
  const [requiredDate, setRequiredDate] = useState<string>(todayStr);
  const [requiredTimeSlot, setRequiredTimeSlot] = useState<string>('Morning (07:00 AM - 10:00 AM)');

  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<TankerBooking | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate pricing
  const currentTier = tankerTiers.find(t => t.capacityLiters === selectedCapacity) || tankerTiers[0];
  const roPremium = waterType === 'drinking_ro' ? 100 : 0;
  const baseRate = (currentTier?.basePrice || 750) + roPremium;
  const deliveryFee = currentTier?.deliveryCharge || 0;
  const totalBookingAmount = baseRate + deliveryFee;

  const timeSlots = [
    { label: t.slotMorning1, value: 'Morning (06:00 AM - 09:00 AM)' },
    { label: t.slotMorning2, value: 'Morning (09:00 AM - 12:00 PM)' },
    { label: t.slotAfternoon, value: 'Afternoon (12:00 PM - 03:00 PM)' },
    { label: t.slotEvening, value: 'Evening (03:00 PM - 06:30 PM)' },
    { label: t.slotUrgent, value: 'Urgent / Immediate (Next available)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage(language === 'te' ? 'దయచేసి మీ పేరు నమోదు చేయండి' : 'Please enter customer name');
      return;
    }

    const cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(language === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!address.trim()) {
      setErrorMessage(language === 'te' ? 'దయచేసి డెలివరీ స్థలం / చిరునామా నమోదు చేయండి' : 'Please enter delivery address');
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await api.createTankerBooking({
        customerName: customerName.trim(),
        mobileNumber: cleanPhone,
        address: address.trim(),
        landmark: landmark.trim() || 'Sanganapalli',
        capacityLiters: selectedCapacity,
        waterType,
        requiredDate,
        requiredTimeSlot,
        specialInstructions: specialInstructions.trim(),
      });

      setConfirmedBooking(booking);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit tanker booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWhatsAppUrl = () => {
    if (!confirmedBooking) return '#';
    const waPhone = settings?.whatsappPhone || '919876543210';
    const msg = `*💧 NEW SRUJALA WATER TANKER BOOKING*\n` +
      `*Booking ID:* ${confirmedBooking.id}\n` +
      `*Customer:* ${confirmedBooking.customerName}\n` +
      `*Phone:* ${confirmedBooking.mobileNumber}\n` +
      `*Capacity:* ${confirmedBooking.capacityLiters.toLocaleString()} Liters\n` +
      `*Water Type:* ${confirmedBooking.waterType === 'drinking_ro' ? 'Drinking RO Purified Water' : 'Domestic Utility Bore Water'}\n` +
      `*Delivery Date:* ${confirmedBooking.requiredDate}\n` +
      `*Time Slot:* ${confirmedBooking.requiredTimeSlot}\n` +
      `*Address:* ${confirmedBooking.address}\n` +
      `*Landmark:* ${confirmedBooking.landmark}\n` +
      `*TOTAL AMOUNT:* ₹${confirmedBooking.totalAmount}\n\n` +
      (confirmedBooking.specialInstructions ? `*Instructions:* ${confirmedBooking.specialInstructions}\n\n` : '') +
      `Please confirm tanker dispatch!`;

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full mb-2">
          <Droplets className="w-3.5 h-3.5 fill-sky-600 text-sky-600" />
          <span>{language === 'te' ? 'స్వచ్ఛమైన తాగునీరు & గృహ నీరు' : 'Clean & Tested Water Delivery'}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t.tankerTitle}
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          {t.tankerSubtitle}
        </p>
      </div>

      {confirmedBooking ? (
        /* Confirmation Screen */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 max-w-xl mx-auto animate-scale">
          <div className="w-20 h-20 mx-auto bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
              {language === 'te' ? 'బుకింగ్ నమోదైంది' : 'Booking Received'}
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              {t.bookingSuccessTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
              {t.bookingSuccessMessage}
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {t.yourBookingId}
                </p>
                <span className="font-mono text-xl font-black text-sky-800">
                  {confirmedBooking.id}
                </span>
              </div>
              <button
                onClick={handleCopyId}
                className="p-2 text-slate-500 hover:text-sky-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center space-x-1 text-xs font-bold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.copied : t.copyId}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">{language === 'te' ? 'కస్టమర్' : 'Customer'}:</span>
                <p className="font-bold text-slate-900">{confirmedBooking.customerName}</p>
              </div>
              <div>
                <span className="text-slate-500">{language === 'te' ? 'మొబైల్' : 'Mobile'}:</span>
                <p className="font-bold text-slate-900 font-mono">{confirmedBooking.mobileNumber}</p>
              </div>
              <div>
                <span className="text-slate-500">{language === 'te' ? 'పరిమాణం' : 'Capacity'}:</span>
                <p className="font-bold text-sky-800">{confirmedBooking.capacityLiters.toLocaleString()} {t.liters}</p>
              </div>
              <div>
                <span className="text-slate-500">{language === 'te' ? 'తేదీ & సమయం' : 'Date & Slot'}:</span>
                <p className="font-bold text-slate-900">{confirmedBooking.requiredDate}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">{language === 'te' ? 'డెలివరీ స్థలం' : 'Location'}:</span>
                <p className="font-medium text-slate-900">{confirmedBooking.address}, {confirmedBooking.landmark}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-700">{t.totalTankerPrice}:</span>
                <span className="text-lg font-black text-sky-800">₹{confirmedBooking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md flex items-center justify-center space-x-2 text-sm transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{language === 'te' ? 'వాట్సాప్‌లో బుకింగ్ వివరాలు పంపండి' : 'Send Booking details to WhatsApp'}</span>
            </a>

            <button
              onClick={() => onTrackBooking(confirmedBooking.id)}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-sm transition-all shadow-xs"
            >
              {language === 'te' ? 'ట్యాంకర్ లైవ్ స్టేటస్ తనిఖీ చేయండి' : 'Track Tanker Live Status'}
            </button>

            <button
              onClick={() => setConfirmedBooking(null)}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              {language === 'te' ? 'మరో ట్యాంకర్ బుక్ చేయండి' : 'Book Another Tanker'}
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Tanker Capacity Selector */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {t.selectCapacity}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {tankerTiers.map(tier => {
                  const isSelected = selectedCapacity === tier.capacityLiters;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedCapacity(tier.capacityLiters)}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/70 shadow-md ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-sky-300 bg-white'
                      }`}
                    >
                      {tier.isPopular && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs whitespace-nowrap">
                          {t.popularChoice}
                        </div>
                      )}

                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-2">
                          <Truck className="w-5 h-5" />
                        </div>
                        <h4 className="font-black text-slate-900 text-sm">
                          {tier.capacityLiters.toLocaleString()}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-semibold">{t.liters}</span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                        <div className="text-base font-black text-sky-900">
                          ₹{tier.basePrice}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight">
                          {language === 'te' ? tier.descriptionTe : tier.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Water Type Selector */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {t.waterTypeTitle}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                    waterType === 'drinking_ro'
                      ? 'border-sky-600 bg-sky-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="waterType"
                    value="drinking_ro"
                    checked={waterType === 'drinking_ro'}
                    onChange={() => setWaterType('drinking_ro')}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{t.drinkingRoWater}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.drinkingRoDesc}
                    </p>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                    waterType === 'domestic_utility'
                      ? 'border-sky-600 bg-sky-50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="waterType"
                    value="domestic_utility"
                    checked={waterType === 'domestic_utility'}
                    onChange={() => setWaterType('domestic_utility')}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{t.domesticUtilityWater}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.domesticUtilityDesc}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Date & Preferred Time */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'te' ? 'డెలివరీ తేదీ & సమయం' : 'Delivery Schedule'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>{t.deliveryDate} *</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>{t.deliveryTimeSlot} *</span>
                  </label>
                  <select
                    value={requiredTimeSlot}
                    onChange={(e) => setRequiredTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Customer Details & Village Address */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black">
                  4
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'te' ? 'కస్టమర్ & డెలివరీ లొకేషన్ వివరాలు' : 'Delivery Address & Contact'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.deliveryAddress} *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={language === 'te' ? 'ఇంటి నంబర్, వీధి, లేదా పొలం లొకేషన్' : 'House no, Street name, or Farm / Site location'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.landmark}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={language === 'te' ? 'ఉదా: ఓం శక్తి ఆలయం సమీపంలో, లేదా పాఠశాల వద్ద' : 'e.g. Near Om Sakthi Temple, Main Road / Checkpost'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.specialInstructions}
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder={t.tankerInstructionsPlaceholder}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-2">
              <h4 className="text-xs font-black text-sky-900 uppercase tracking-wider">
                {t.priceSummary}
              </h4>
              <div className="flex justify-between text-xs sm:text-sm text-slate-700">
                <span>
                  {selectedCapacity.toLocaleString()} {t.liters} ({waterType === 'drinking_ro' ? 'Drinking RO Water' : 'Domestic Water'})
                </span>
                <span className="font-bold text-slate-900">₹{baseRate}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-700">
                <span>{t.distanceDeliveryFee}</span>
                <span className="font-bold text-slate-900">{deliveryFee === 0 ? t.free : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-black text-sky-950 pt-2 border-t border-sky-200">
                <span>{t.totalTankerPrice}</span>
                <span className="text-sky-800 font-mono">₹{totalBookingAmount}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl shadow-lg shadow-sky-600/25 hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-base disabled:opacity-50 active:scale-98"
            >
              <span>{isSubmitting ? t.submitting : t.bookTankerNow}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
