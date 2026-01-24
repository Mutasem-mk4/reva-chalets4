'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from '@/styles/statsBar.module.css';

interface Stat {
  value: string;
  numericValue: number;
  label: string;
  suffix?: string;
}

interface StatsBarProps {
  lang?: string;
}

export default function StatsBar({ lang = 'en' }: StatsBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const ref = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const stats: Stat[] = [
    {
      value: '50+',
      numericValue: 50,
      label: lang === 'ar' ? 'شاليه فاخر' : 'Premium Chalets',
      suffix: '+'
    },
    {
      value: '12',
      numericValue: 12,
      label: lang === 'ar' ? 'موقع أردني' : 'Jordanian Locations'
    },
    {
      value: '4.9',
      numericValue: 4.9,
      label: lang === 'ar' ? 'متوسط التقييم' : 'Average Rating'
    },
    {
      value: '5000+',
      numericValue: 5000,
      label: lang === 'ar' ? 'ضيوف سعداء' : 'Happy Guests',
      suffix: '+'
    },
  ];

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Use RAF for smoother animation that won't interfere with scrolling
  const animateCounters = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const duration = 1000; // 1 second animation
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic for smooth deceleration
    const easeOut = 1 - Math.pow(1 - progress, 3);

    setCounts(stats.map((stat) => {
      if (stat.numericValue < 10) {
        return Math.round(stat.numericValue * easeOut * 10) / 10;
      }
      return Math.round(stat.numericValue * easeOut);
    }));

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateCounters);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // If user prefers reduced motion, show final values immediately
    if (prefersReducedMotion) {
      setCounts(stats.map((stat) => stat.numericValue));
      return;
    }

    // Start RAF-based animation
    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animateCounters);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, prefersReducedMotion, animateCounters]);

  const formatValue = (index: number) => {
    const stat = stats[index];
    const count = counts[index];

    if (stat.numericValue < 10) {
      return count.toFixed(1);
    }
    return count.toLocaleString() + (stat.suffix || '');
  };

  return (
    <div className={styles.statsBar} ref={ref}>
      <div className={styles.statsContainer}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statItem}>
            <div className={styles.statValue}>{formatValue(idx)}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
