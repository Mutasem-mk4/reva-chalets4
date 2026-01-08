
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    discover: "Discover",
    chalets: "Chalets",
    concierge: "Concierge",
    dashboard: "Dashboard",
    signIn: "Sign In",
    logOut: "Log Out",
    arabic: "Arabic",
    english: "English",

    // Hero
    exclusivelyJordanian: "Exclusively Jordanian",
    findPeace: "FIND PEACE.",
    heroText: "Curated architectural masterpieces nestled in the most serene landscapes of the Hashemite Kingdom.",
    destination: "Destination",
    whereToDiscover: "Where to discover?",
    explore: "Explore",
    scroll: "Scroll",

    // Home
    featuredSelection: "Featured Selection",
    eliteRegistry: "THE ELITE REGISTRY",
    discoverElite: "DISCOVER ELITE",
    viewEntireCatalog: "VIEW ENTIRE CATALOG",
    vettedSecurity: "Vetted Security",
    vettedSecurityDesc: "Every guest and owner undergoes multi-factor verification for total privacy.",
    conciergeAI: "Concierge AI",
    conciergeAIDesc: "Our Gemini-powered navigator manages your logistics in real-time.",
    pureLuxury: "Pure Luxury",
    pureLuxuryDesc: "We don't list properties; we curate architectural experiences.",

    // Chalets Page
    allChalets: "ALL CHALETS",
    collectionSub: "Handpicked properties for discerning travelers in Jordan.",
    searchPlaceholder: "Search by name or experience...",
    allTerritories: "All Territories",
    allTiers: "All Tiers",
    eliteOnly: "Elite Only",
    premium: "Premium",
    standard: "Standard",
    noSanctuaries: "No Sanctuaries Found",
    broadenSearch: "Try broadening your search criteria or explore a different territory.",
    resetFilters: "Reset Filters",

    // Chalet Details
    returnToMap: "Return to Map",
    manageGallery: "Manage Gallery",
    cancelEdit: "Cancel Edit",
    shareExperience: "Share Experience",
    copyRegistryLink: "Copy Registry Link",
    dispatchEmail: "Dispatch Email",
    registryLinkCopied: "Registry Link Copied.",
    eliteRegistryBadge: "Elite Registry",
    vettedReviews: "Vetted Reviews",
    guests: "Guests",
    bedrooms: "Bedrooms",
    fullSanctuary: "Full Sanctuary",
    narrative: "Architectural Narrative",
    amenities: "Elite Amenities",
    history: "Residency History",
    totalStayValue: "Total Stay Value",
    night: "/ night",
    arrival: "Arrival",
    departure: "Departure",
    pickArrival: "Pick Arrival",
    pickDeparture: "Pick Departure",
    totalResidency: "Total Residency",
    resetRange: "Reset Range",
    authorizedGuests: "Authorized Guests",
    initializeReservation: "INITIALIZE RESERVATION",
    eliteTax: "Elite Service Tax",
    exempt: "EXEMPT",
    totalInvestment: "Total Investment",
    residencyInsufficient: "Residency duration is insufficient. Please select a valid range.",
    syncingRegistry: "Syncing Registry...",

    // Concierge
    eliteConcierge: "Elite Concierge.",
    unifiedInterface: "Unified Intelligence Interface | Gemini 3 Pro",
    conciergeWelcome: "Welcome to Reva Concierge. I am your personal assistant powered by Gemini 3 Pro. I can help you find the best chalets, explore landmarks, or plan your next trip in Jordan. How can I assist you today?",
    bestDeadSea: "Best Dead Sea Chalets",
    wadiRumActivities: "Activities in Wadi Rum",
    luxuryTripPlan: "Plan a luxury trip for two",
    verifiedSources: "Verified Data Sources",
    consultingIntelligence: "Consulting Intelligence...",
    systemStatusOperational: "System Status: Operational High-Capacity Model",
    available247: "Available 24/7",
    privateEncryption: "Private Encryption",
    multilingualSupport: "Multilingual Support",
    askConcierge: "Ask about luxury destinations, travel logistics, or hidden gems...",

    // Dashboard
    commandCenter: "Command Center.",
    liveFluxActive: "Live Flux Active",
    authority: "Authority",
    capital: "Capital",
    registry: "Registry",
    flux: "Flux",
    identities: "Identities",
    totalEarnings: "Total Earnings",
    systemGMV: "System GMV",
    netPayout: "Net Payout",
    systemCommission: "System Commission",
    registryYield: "Registry Yield",
    capitalVelocity: "Capital Velocity",
    realTimePerformance: "Real-time performance index",
    territorySaturation: "Territory Saturation",
    registryInventory: "Registry Inventory",
    dispatchNewAsset: "Dispatch New Asset",
    searchRegistry: "Search registry...",
    assetLedger: "Asset Ledger",
    globalFlux: "Global Flux",
    historicalAudit: "Historical Transaction Node Audit",
    totalVolume: "Total Volume",
    successRate: "Success Rate",
    cancelIndex: "Cancel Index",
    nodes: "Nodes",
    active: "Active",
    nodeValue: "Node Value",

    // Booking Details Modal
    transactionAudit: "Transaction Audit",
    guestIdentity: "Guest Identity",
    ownerAuthority: "Owner Authority",
    assetStatus: "Asset Status",
    viewInRegistry: "View in Registry",
    bookingPeriod: "Booking Period",
    financialNode: "Financial Node",
    closeAudit: "Close Audit",

    // Auth
    revaAccess: "REVA ACCESS",
    joinSanctuary: "JOIN SANCTUARY",
    checkEmail: "CHECK EMAIL",
    vettingStage: "VETTING STAGE",
    encryptingData: "Encrypting Data...",
    authCodeDispatched: "A secure 6-digit code was dispatched to your inbox.",
    vettingDesc: "Email verified. Your application is now being reviewed by Reva HQ.",
    resendCode: "Resend Verification Code",
    backToCredentials: "Back to Credentials",
    establishIdentity: "Establish New Identity",
    alreadyVetted: "Already Vetted? Enter",
    startVerification: "START VERIFICATION",
    requestAccess: "REQUEST ACCESS",
    authorizeSession: "AUTHORIZE SESSION",

    // Generic
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    unknown: "Unknown"
  },
  ar: {
    // Navigation
    discover: "اكتشف",
    chalets: "الشاليهات",
    concierge: "الكونسيرج",
    dashboard: "لوحة التحكم",
    signIn: "تسجيل الدخول",
    logOut: "تسجيل الخروج",
    arabic: "العربية",
    english: "الإنجليزية",

    // Hero
    exclusivelyJordanian: "حصرياً في الأردن",
    findPeace: "اعثر على السلام.",
    heroText: "تحف معمارية منتقاة بعناية تقع في أكثر المناظر الطبيعية هدوءاً في المملكة الهاشمية.",
    destination: "الوجهة",
    whereToDiscover: "أين تود الاستكشاف؟",
    explore: "استكشف",
    scroll: "مرر للأسفل",

    // Home
    featuredSelection: "مجموعة مختارة",
    eliteRegistry: "السجل النخبوية",
    discoverElite: "اكتشف النخبة",
    viewEntireCatalog: "عرض الكتالوج بالكامل",
    vettedSecurity: "أمان موثق",
    vettedSecurityDesc: "يخضع كل ضيف ومالك لعملية تحقق متعددة العوامل لضمان الخصوصية التامة.",
    conciergeAI: "مساعد ذكاء اصطناعي",
    conciergeAIDesc: "مساعدنا المدعوم بتقنية Gemini يدير خدماتك اللوجستية في الوقت الفعلي.",
    pureLuxury: "فخامة خالصة",
    pureLuxuryDesc: "نحن لا ندرج العقارات فحسب، بل نصمم تجارب معمارية فريدة.",

    // Chalets Page
    allChalets: "جميع الشاليهات",
    collectionSub: "عقارات مختارة بعناية للمسافرين المميزين في الأردن.",
    searchPlaceholder: "ابحث بالاسم أو التجربة...",
    allTerritories: "جميع المناطق",
    allTiers: "جميع الفئات",
    eliteOnly: "النخبة فقط",
    premium: "بريميوم",
    standard: "قياسي",
    noSanctuaries: "لم يتم العور على ملاذات",
    broadenSearch: "حاول توسيع معايير البحث أو استكشاف منطقة مختلفة.",
    resetFilters: "إعادة ضبط الفلاتر",

    // Chalet Details
    returnToMap: "العودة إلى الخريطة",
    manageGallery: "إدارة المعرض",
    cancelEdit: "إلغاء التعديل",
    shareExperience: "مشاركة التجربة",
    copyRegistryLink: "نسخ رابط السجل",
    dispatchEmail: "إرسال بريد إلكتروني",
    registryLinkCopied: "تم نسخ رابط السجل.",
    eliteRegistryBadge: "السجل النخبوي",
    vettedReviews: "تقييمات موثقة",
    guests: "ضيوف",
    bedrooms: "غرف نوم",
    fullSanctuary: "ملاذ كامل",
    narrative: "الرواية المعمارية",
    amenities: "المرافق النخبوية",
    history: "سجل الإقامة",
    totalStayValue: "إجمالي قيمة الإقامة",
    night: "/ ليلة",
    arrival: "الوصول",
    departure: "المغادرة",
    pickArrival: "اختر موعد الوصول",
    pickDeparture: "اختر موعد المغادرة",
    totalResidency: "إجمالي الإقامة",
    resetRange: "إعادة ضبط المدة",
    authorizedGuests: "الضيوف المصرح لهم",
    initializeReservation: "بدء الحجز",
    eliteTax: "ضريبة الخدمة النخبوية",
    exempt: "معفى",
    totalInvestment: "إجمالي الاستثمار",
    residencyInsufficient: "مدة الإقامة غير كافية. يرجى اختيار فترة صالحة.",
    syncingRegistry: "جاري مزامنة السجل...",

    // Concierge
    eliteConcierge: "النخبة كونسيرج.",
    unifiedInterface: "واجهة الذكاء الموحدة | Gemini 3 Pro",
    conciergeWelcome: "مرحباً بك في ريفا كونسيرج. أنا مساعدك الشخصي المدعوم بتقنية Gemini 3 Pro. يمكنني مساعدتك في العثور على أفضل الشاليهات، استكشاف المعالم السياحية، أو حتى التخطيط لرحلتك القادمة في الأردن. كيف يمكنني مساعدتك اليوم؟",
    bestDeadSea: "أفضل شاليهات البحر الميت",
    wadiRumActivities: "أنشطة في وادي رم",
    luxuryTripPlan: "تخطيط رحلة فاخرة لشخصين",
    verifiedSources: "مصادر بيانات موثقة",
    consultingIntelligence: "جاري استشارة الذكاء الاصطناعي...",
    systemStatusOperational: "حالة النظام: نموذج عالي السعة يعمل بكفاءة",
    available247: "متاح 24/7",
    privateEncryption: "تشفير خاص",
    multilingualSupport: "دعم لغات متعددة",
    askConcierge: "اسأل عن الوجهات الفاخرة، الخدمات اللوجستية، أو الجواهر الخفية...",

    // Dashboard
    commandCenter: "مركز القيادة.",
    liveFluxActive: "تدفق البيانات النشط",
    authority: "صلاحية",
    capital: "رأس المال",
    registry: "السجل",
    flux: "التدفق",
    identities: "الهويات",
    totalEarnings: "إجمالي الأرباح",
    systemGMV: "إجمالي قيمة النظام",
    netPayout: "صافي الدفعات",
    systemCommission: "عمولة النظام",
    registryYield: "عائد السجل",
    capitalVelocity: "سرعة رأس المال",
    realTimePerformance: "مؤشر الأداء في الوقت الفعلي",
    territorySaturation: "تشبع المنطقة",
    registryInventory: "مخزون السجل",
    dispatchNewAsset: "إدراج عقار جديد",
    searchRegistry: "البحث في السجل...",
    assetLedger: "دفتر أصول العقار",
    globalFlux: "التدفق العالمي",
    historicalAudit: "تدقيق تاريخي لمعاملات العقدة",
    totalVolume: "إجمالي الحجم",
    successRate: "معدل النجاح",
    cancelIndex: "مؤشر الإلغاء",
    nodes: "عقود",
    active: "نشط",
    nodeValue: "قيمة العقدة",

    // Booking Details Modal
    transactionAudit: "تدقيق المعاملة",
    guestIdentity: "هوية الضيف",
    ownerAuthority: "سلطة المالك",
    assetStatus: "حالة العقار",
    viewInRegistry: "عرض في السجل",
    bookingPeriod: "فترة الحجز",
    financialNode: "العقدة المالية",
    closeAudit: "إغلاق التدقيق",

    // Auth
    revaAccess: "وصول ريفا",
    joinSanctuary: "الانضمام للملاذ",
    checkEmail: "تحقق من بريدك",
    vettingStage: "مرحلة التدقيق",
    encryptingData: "جاري تشفير البيانات...",
    authCodeDispatched: "تم إرسال رمز أمان مكون من 6 أرقام إلى بريدك الإلكتروني.",
    vettingDesc: "تم التحقق من البريد الإلكتروني. طلبك قيد المراجعة الآن من قبل إدارة ريفا.",
    resendCode: "إعادة إرسال رمز التحقق",
    backToCredentials: "العودة إلى بيانات الدخول",
    establishIdentity: "إنشاء هوية جديدة",
    alreadyVetted: "لديك هوية؟ ادخل هنا",
    startVerification: "بدء التحقق",
    requestAccess: "طلب الوصول",
    authorizeSession: "تفويض الجلسة",

    // Generic
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجاح",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    unknown: "غير معروف"
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');

  // Load saved preferences
  useEffect(() => {
    const savedLang = localStorage.getItem('reva_lang') as Language;
    const savedTheme = localStorage.getItem('reva_theme') as Theme;
    if (savedLang) setLanguage(savedLang);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Update DOM for Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('reva_theme', theme);
  }, [theme]);

  // Update DOM for Language (RTL)
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', language);
    
    // Toggle font family class on body
    if (language === 'ar') {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }

    localStorage.setItem('reva_lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, toggleTheme, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
