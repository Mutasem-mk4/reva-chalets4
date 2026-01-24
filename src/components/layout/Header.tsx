'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, User } from '@/components/ui/Icons';
import Logo from '@/components/ui/Logo';
import type { Dictionary } from '@/lib/dictionaries';
import styles from '@/styles/header.module.css';

// Default dictionary values as fallback
const defaultDict: Pick<Dictionary, 'nav' | 'rewards'> = {
  nav: { home: 'Home', chalets: 'Chalets', about: 'About', contact: 'Contact', bookNow: 'Book Now' },
  rewards: { wallet: 'My Wallet', trips: 'My Trips', settings: 'Settings', noRewards: '', scanInfo: '' },
};

interface HeaderProps {
  lang: string;
  dict?: Dictionary;
}

export default function Header({ lang, dict: propDict }: HeaderProps) {
  // Use prop dict or fallback to defaults
  const dict = propDict || defaultDict;
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/` || pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isHomePage) {
      document.body.classList.add('home-page');
    } else {
      document.body.classList.remove('home-page');
    }
    return () => document.body.classList.remove('home-page');
  }, [isHomePage]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use stored theme or preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const switchLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  };

  // Detect promo banner visibility
  const [promoVisible, setPromoVisible] = useState(false);

  useEffect(() => {
    const checkPromo = () => {
      setPromoVisible(document.body.classList.contains('promo-visible'));
    };

    checkPromo();

    // Create a mutation observer to detect class changes on body
    const observer = new MutationObserver(checkPromo);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Build header class names
  const headerClasses = [
    styles.header,
    scrolled || !isHomePage ? styles.scrolled : '',
    mobileMenuOpen ? styles.open : '',
    promoVisible ? styles.promoVisible : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <header className={headerClasses}>
        <div className={`container ${styles.headerContent}`}>
          <Link href={`/${lang}`} className={styles.logoLink}>
            <Logo animated={true} />
          </Link>

          {/* Desktop Nav - Simplified */}
          <nav className={styles.desktopNav}>
            <Link
              href={`/${lang}`}
              className={pathname === `/${lang}` || pathname === `/${lang}/` ? styles.active : ''}
            >
              {dict.nav.home}
            </Link>
            <Link
              href={`/${lang}/about`}
              className={pathname?.includes('/about') ? styles.active : ''}
            >
              {dict.nav.about}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className={pathname?.includes('/contact') ? styles.active : ''}
            >
              {dict.nav.contact}
            </Link>
          </nav>

          <div className={styles.actions}>
            <button onClick={switchLanguage} className={styles.iconBtn} aria-label={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}>
              {lang === 'en' ? 'عربي' : 'English'}
            </button>

            <button onClick={toggleTheme} className={styles.iconBtn} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <Link
              href={`/${lang}/guest/profile`}
              className={`${styles.iconBtn} ${pathname?.includes('/guest') ? styles.active : ''}`}
              aria-label="My Profile"
            >
              <User size={18} />
            </Link>

            <Link href={`/${lang}/chalets`} className={`${styles.btnPrimary} ${styles.desktopOnly}`}>
              {dict.nav.bookNow}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
              <span className={`${styles.bar} ${mobileMenuOpen ? styles.open : ''}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <nav className={styles.mobileNav}>
          <Link
            href={`/${lang}`}
            className={pathname === `/${lang}` || pathname === `/${lang}/` ? styles.active : ''}
          >
            {dict.nav.home}
          </Link>
          <Link
            href={`/${lang}/chalets`}
            className={pathname?.includes('/chalets') ? styles.active : ''}
          >
            {dict.nav.chalets}
          </Link>
          <Link
            href={`/${lang}/about`}
            className={pathname?.includes('/about') ? styles.active : ''}
          >
            {dict.nav.about}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className={pathname?.includes('/contact') ? styles.active : ''}
          >
            {dict.nav.contact}
          </Link>
          <Link href={`/${lang}/guest/wallet`}>
            {dict.rewards.wallet}
          </Link>
          <Link href={`/${lang}/chalets`} className={styles.mobileCta}>
            {dict.nav.bookNow}
          </Link>
        </nav>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
}
