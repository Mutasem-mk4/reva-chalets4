'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { WaveDivider, DotPattern, BlobShape } from '@/components/ui/Patterns';
import HeroBookingForm from '@/components/features/HeroBookingForm';
import type { Dictionary } from '@/lib/dictionaries';
import styles from '@/styles/parallaxHero.module.css';

interface ParallaxHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  lang?: string;
  dict?: Dictionary;
  showBookingForm?: boolean;
}

export default function ParallaxHero({ title, subtitle, ctaText, ctaHref, lang = 'en', dict, showBookingForm = true }: ParallaxHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shape1Ref = useRef<HTMLDivElement>(null);
  const shape2Ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  // Smooth interpolation values
  const currentScroll = useRef(0);
  const targetScroll = useRef(0);

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

  // Smooth linear interpolation for butter-smooth scrolling
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const updateParallax = useCallback(() => {
    if (prefersReducedMotion) return;

    // Smooth interpolation - 0.08 gives buttery smooth feel
    currentScroll.current = lerp(currentScroll.current, targetScroll.current, 0.08);

    // Round to prevent sub-pixel jitter
    const scrollY = Math.round(currentScroll.current * 100) / 100;

    const containerHeight = containerRef.current?.offsetHeight || 800;

    // Only apply parallax when hero is in view
    if (targetScroll.current > containerHeight * 1.5) {
      rafId.current = requestAnimationFrame(updateParallax);
      return;
    }

    // Calculate scroll progress (0 to 1)
    const progress = Math.min(scrollY / containerHeight, 1);

    // Background: moves slower = appears further away
    if (bgRef.current) {
      const bgOffset = scrollY * 0.25;
      bgRef.current.style.transform = `translate3d(0, ${bgOffset}px, 0)`;
    }

    // Content: moves faster = appears closer
    if (contentRef.current) {
      const contentOffset = scrollY * 0.4;
      const opacity = Math.max(0, 1 - progress * 1.1);
      contentRef.current.style.transform = `translate3d(0, ${contentOffset}px, 0)`;
      contentRef.current.style.opacity = String(opacity);
    }

    // Floating shapes: subtle movement for depth
    if (shape1Ref.current) {
      shape1Ref.current.style.transform = `translate3d(${scrollY * 0.015}px, ${scrollY * 0.12}px, 0)`;
    }

    if (shape2Ref.current) {
      shape2Ref.current.style.transform = `translate3d(${-scrollY * 0.02}px, ${scrollY * 0.08}px, 0)`;
    }

    // Continue animation loop
    rafId.current = requestAnimationFrame(updateParallax);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Update target scroll on scroll event
    const handleScroll = () => {
      targetScroll.current = window.scrollY;
    };

    // Initial scroll position
    targetScroll.current = window.scrollY;
    currentScroll.current = window.scrollY;

    // Start animation loop
    rafId.current = requestAnimationFrame(updateParallax);

    // Passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updateParallax, prefersReducedMotion]);

  return (
    <section ref={containerRef} className={styles.heroContainer}>
      {/* Background with parallax */}
      <div ref={bgRef} className={styles.heroBg} />

      {/* Floating Shapes */}
      <div ref={shape1Ref} className={`${styles.floatingShape} ${styles.floatingShape1}`}>
        <BlobShape color="white" style={{ width: '300px', height: '300px' }} />
      </div>
      <div ref={shape2Ref} className={`${styles.floatingShape} ${styles.floatingShape2}`}>
        <BlobShape color="white" style={{ width: '400px', height: '400px', transform: 'scale(-1, 1)' }} />
      </div>

      {/* Overlay */}
      <div className={styles.heroOverlay} />

      {/* Main Hero Layout */}
      <div className={styles.heroWrapper}>
        {/* Content - Left Side */}
        <div ref={contentRef} className={styles.heroContent}>
          {/* Hero Badge */}
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot}></span>
            <span>{lang === 'ar' ? '50+ شاليه فاخر متاح' : '50+ Luxury Chalets Available'}</span>
          </div>

          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroSubtitle}>{subtitle}</p>

          {!showBookingForm && (
            <Link href={ctaHref} className={styles.ctaBtn}>
              {ctaText}
            </Link>
          )}
        </div>

        {/* Booking Form - Right Side */}
        {showBookingForm && (
          <div className={styles.bookingFormWrapper}>
            <HeroBookingForm lang={lang} dict={dict} />
          </div>
        )}
      </div>

      <WaveDivider position="bottom" color="hsl(var(--background))" style={{ zIndex: 10, height: '100px' }} />
      <DotPattern opacity={0.3} color="rgba(255,255,255,0.4)" style={{ pointerEvents: 'none', mixBlendMode: 'overlay', scale: '1.5' }} />
    </section>
  );
}
