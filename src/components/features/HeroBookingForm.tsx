'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Dictionary } from '@/lib/dictionaries';
import styles from '@/styles/heroBookingForm.module.css';

interface HeroBookingFormProps {
  lang: string;
  dict?: Dictionary;
}

export default function HeroBookingForm({ lang, dict }: HeroBookingFormProps) {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    router.push(`/${lang}/chalets?${params.toString()}`);
  };

  const locations = [
    { value: '', label: lang === 'ar' ? 'جميع المواقع' : 'All Locations' },
    { value: 'amman', label: lang === 'ar' ? 'عمان' : 'Amman' },
    { value: 'dead-sea', label: lang === 'ar' ? 'البحر الميت' : 'Dead Sea' },
    { value: 'petra', label: lang === 'ar' ? 'البتراء' : 'Petra' },
    { value: 'wadi-rum', label: lang === 'ar' ? 'وادي رم' : 'Wadi Rum' },
    { value: 'aqaba', label: lang === 'ar' ? 'العقبة' : 'Aqaba' },
    { value: 'ajloun', label: lang === 'ar' ? 'عجلون' : 'Ajloun' },
  ];

  return (
    <div className={styles.bookingCard}>
      <h3 className={styles.cardTitle}>
        {lang === 'ar' ? 'ابحث عن شاليهك المثالي' : 'Find Your Perfect Chalet'}
      </h3>
      <form onSubmit={handleSearch} className={styles.bookingForm}>
        <div className={styles.formGroup}>
          <label>{lang === 'ar' ? 'الموقع' : 'Location'}</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map((loc) => (
              <option key={loc.value} value={loc.value}>{loc.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>{lang === 'ar' ? 'تاريخ الوصول' : 'Check In'}</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className={styles.formGroup}>
            <label>{lang === 'ar' ? 'تاريخ المغادرة' : 'Check Out'}</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>{lang === 'ar' ? 'عدد الضيوف' : 'Guests'}</label>
          <select value={guests} onChange={(e) => setGuests(e.target.value)}>
            <option value="1">{lang === 'ar' ? '1 ضيف' : '1 Guest'}</option>
            <option value="2">{lang === 'ar' ? '2 ضيوف' : '2 Guests'}</option>
            <option value="3">{lang === 'ar' ? '3 ضيوف' : '3 Guests'}</option>
            <option value="4">{lang === 'ar' ? '4 ضيوف' : '4 Guests'}</option>
            <option value="5">{lang === 'ar' ? '5+ ضيوف' : '5+ Guests'}</option>
          </select>
        </div>

        <button type="submit" className={styles.searchBtn}>
          <span>🔍</span>
          <span>{lang === 'ar' ? 'ابحث عن الشاليهات' : 'Search Chalets'}</span>
        </button>
      </form>
    </div>
  );
}
