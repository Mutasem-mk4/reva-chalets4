'use client';

import Image from 'next/image';
import styles from '@/styles/experienceSection.module.css';

interface ExperienceSectionProps {
  lang?: string;
}

export default function ExperienceSection({ lang = 'en' }: ExperienceSectionProps) {
  const isArabic = lang === 'ar';

  const features = [
    {
      icon: '🏛️',
      title: isArabic ? 'تصميم تراثي' : 'Heritage Design',
      description: isArabic ? 'عمارة أردنية أصيلة' : 'Authentic Jordanian architecture',
    },
    {
      icon: '🍽️',
      title: isArabic ? 'مأكولات محلية' : 'Local Cuisine',
      description: isArabic ? 'فطور تقليدي مشمول' : 'Traditional breakfast included',
    },
    {
      icon: '🧭',
      title: isArabic ? 'جولات مرشدة' : 'Guided Tours',
      description: isArabic ? 'تجارب محلية منتقاة' : 'Curated local experiences',
    },
    {
      icon: '💎',
      title: isArabic ? 'مرافق فاخرة' : 'Premium Amenities',
      description: isArabic ? 'فخامة في كل التفاصيل' : 'Luxury at every detail',
    },
  ];

  return (
    <section className={styles.experience}>
      <div className={styles.experienceContainer}>
        <div className={styles.experienceContent}>
          <h2>{isArabic ? 'تجربة ريفا' : 'The Reva Experience'}</h2>
          <p>
            {isArabic
              ? 'أكثر من مجرد إقامة — نقدم لك بوابة إلى الثقافة الأردنية الأصيلة، والمناظر الطبيعية الخلابة، وذكريات تدوم مدى الحياة.'
              : 'More than just a stay — we offer a gateway to authentic Jordanian culture, breathtaking landscapes, and memories that last a lifetime.'
            }
          </p>

          <div className={styles.experienceFeatures}>
            {features.map((feature, idx) => (
              <div key={idx} className={styles.expFeature}>
                <div className={styles.expFeatureIcon}>{feature.icon}</div>
                <div className={styles.expFeatureText}>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.experienceGallery}>
          <Image
            src="/images/chalet-4.webp"
            alt="Chalet experience"
            width={400}
            height={500}
            className={`${styles.galleryImg} ${styles.galleryImgMain}`}
          />
          <Image
            src="/images/chalet-1.webp"
            alt="Chalet interior"
            width={200}
            height={200}
            className={styles.galleryImg}
          />
          <Image
            src="/images/chalet-3.webp"
            alt="Chalet view"
            width={200}
            height={200}
            className={styles.galleryImg}
          />
        </div>
      </div>
    </section>
  );
}
