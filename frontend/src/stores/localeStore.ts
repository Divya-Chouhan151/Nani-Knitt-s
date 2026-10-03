import { createSignal } from "solid-js";

export type SupportedLanguage = "en" | "hi" | "es" | "fr";
export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateFromInr: number;
  locale: string;
  fractionDigits: number;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", name: "INR (₹)", rateFromInr: 1.0, locale: "en-IN", fractionDigits: 0 },
  USD: { code: "USD", symbol: "$", name: "USD ($)", rateFromInr: 0.012, locale: "en-US", fractionDigits: 2 },
  EUR: { code: "EUR", symbol: "€", name: "EUR (€)", rateFromInr: 0.011, locale: "de-DE", fractionDigits: 2 },
  GBP: { code: "GBP", symbol: "£", name: "GBP (£)", rateFromInr: 0.0095, locale: "en-GB", fractionDigits: 2 },
};

export const LANGUAGES: Record<SupportedLanguage, { code: SupportedLanguage; label: string; flag: string }> = {
  en: { code: "en", label: "English", flag: "🇬🇧" },
  hi: { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  es: { code: "es", label: "Español", flag: "🇪🇸" },
  fr: { code: "fr", label: "Français", flag: "🇫🇷" },
};

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Brand & Hero
    "hero.badge": "Nani's Knitts • Handcrafted With Love",
    "hero.headline": "Crafted by hand, made with heart.",
    "hero.subheadline": "Discover authentic handmade treasures — each piece crafted with patience, passion, and an individual story.",
    
    // Header & Navigation
    "nav.search_placeholder": "Search handmade creations, ceramics, textiles...",
    "nav.wishlist": "Wishlist",
    "nav.cart": "Cart",
    "nav.sign_in": "Sign In",
    "nav.account": "Account Profile",
    "nav.orders": "My Orders",
    "nav.payment_methods": "Payment Methods",
    "nav.settings": "Settings",
    "nav.logout": "Sign Out",
    
    // Catalog & Filters
    "catalog.showing": "Showing",
    "catalog.products": "products",
    "catalog.product": "product",
    "catalog.clear_filters": "Clear active filters",
    "catalog.sort_by": "Sort by",
    "catalog.newest": "Newest Arrivals",
    "catalog.price_asc": "Price: Low to High",
    "catalog.price_desc": "Price: High to Low",
    "catalog.rating_desc": "Highest Rated",
    "catalog.popularity": "Popularity / Best Selling",
    "filters.title": "Filter Creations",
    "filters.reset": "Reset All",
    "filters.category": "Craft Category",
    "filters.artisan": "Artisan / Maker",
    "filters.price_range": "Price Range",
    "filters.rating": "Artisan Rating",
    "filters.all_ratings": "All Ratings",
    "filters.and_above": "& above",
    
    // Product Card & Actions
    "product.add_to_cart": "Add to Cart",
    "product.sold_out": "Sold Out",
    "product.in_stock": "In Stock",
    "product.low_stock": "Low Stock",
    "product.out_of_stock": "Out of Stock",
    "product.quick_view": "Quick View",
    "product.save_wishlist": "Save to Wishlist",
    "product.in_wishlist": "In Wishlist",
    
    // Detail & Modal
    "detail.buy_now": "Buy Now",
    "detail.artisan_guarantee": "100% Handcrafted Guarantee",
    "detail.handmade_note": "Handmade item — slight variations in texture, color, and finish celebrate its authentic uniqueness.",
    "detail.reviews": "Reviews",
    
    // Wishlist Tab
    "wishlist.title": "My Saved Treasures",
    "wishlist.subtitle": "Pieces you love and artisan keepsakes on your wishlist.",
    "wishlist.empty_title": "Your wishlist is waiting for a story",
    "wishlist.empty_sub": "Explore our artisan collections and collect pieces crafted by hand.",
    "wishlist.move_to_cart": "Move to Cart",
    
    // Footer
    "footer.tagline": "Connecting thoughtful collectors with authentic independent artisans across the globe.",
    "footer.quick_links": "Artisan Collections",
    "footer.about_us": "About Our Makers",
    "footer.faq": "FAQ & Help Center",
    "footer.shipping": "Artisan Shipping Policy",
    "footer.returns": "Returns & Replacements",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.contact": "Studio & Support",
    "footer.newsletter_title": "Artisan Stories & New Drops",
    "footer.newsletter_desc": "Sign up to receive behind-the-wheel studio stories and limited craft releases.",
    "footer.subscribe": "Join Guild",
    "footer.copyright": "© 2026 Nani's Knitts. Every piece tells a story.",
  },
  hi: {
    // Brand & Hero
    "hero.badge": "कारीगर बाज़ार और हस्तनिर्मित कृतियाँ",
    "hero.headline": "हाथों से निर्मित, दिल से समर्पित।",
    "hero.subheadline": "अनूठी हस्तनिर्मित कृतियों की खोज करें — हर कृति धैर्य, प्रेम और अपनी एक अनोखी कहानी से सजी है।",
    
    // Header & Navigation
    "nav.search_placeholder": "हस्तनिर्मित उत्पाद, मिट्टी के बर्तन, वस्त्र खोजें...",
    "nav.wishlist": "पसंदीदा सूची",
    "nav.cart": "कार्ट",
    "nav.sign_in": "लॉग इन",
    "nav.account": "मेरी प्रोफ़ाइल",
    "nav.orders": "मेरे ऑर्डर",
    "nav.payment_methods": "भुगतान विधियाँ",
    "nav.settings": "सेटिंग्स",
    "nav.logout": "लॉग आउट",
    
    // Catalog & Filters
    "catalog.showing": "प्रदर्शित",
    "catalog.products": "उत्पाद",
    "catalog.product": "उत्पाद",
    "catalog.clear_filters": "फ़िल्टर हटाएं",
    "catalog.sort_by": "क्रमबद्ध करें",
    "catalog.newest": "नवीनतम आगमन",
    "catalog.price_asc": "कीमत: कम से अधिक",
    "catalog.price_desc": "कीमत: अधिक से कम",
    "catalog.rating_desc": "सर्वोत्तम रेटिंग",
    "filters.title": "फ़िल्टर",
    "filters.reset": "रीसेट करें",
    "filters.category": "शिल्प श्रेणी",
    "filters.artisan": "कारीगर",
    "filters.price_range": "मूल्य सीमा",
    "filters.rating": "कारीगर रेटिंग",
    "filters.all_ratings": "सभी रेटिंग",
    "filters.and_above": "और अधिक",
    
    // Product Card & Actions
    "product.add_to_cart": "कार्ट में जोड़ें",
    "product.sold_out": "बिक चुका है",
    "product.in_stock": "उपलब्ध",
    "product.low_stock": "सीमित शेष",
    "product.out_of_stock": "ऑर्डर पर निर्मित",
    "product.quick_view": "त्वरित दृश्य",
    "product.save_wishlist": "पसंदीदा में रखें",
    "product.in_wishlist": "पसंदीदा में है",
    
    // Detail & Modal
    "detail.buy_now": "अभी खरीदें",
    "detail.artisan_guarantee": "100% प्रामाणिक हस्तशिल्प गारंटी",
    "detail.handmade_note": "हस्तनिर्मित कृति — रंग और बनावट का हल्का अंतर इसकी मौलिक कारीगरी का प्रमाण है।",
    "detail.reviews": "समीक्षाएँ",
    
    // Wishlist Tab
    "wishlist.title": "मेरी पसंदीदा कृतियाँ",
    "wishlist.subtitle": "आपकी पसंदीदा कलाकृतियाँ और सहेज कर रखे गए हस्तशिल्प।",
    "wishlist.empty_title": "आपकी पसंदीदा सूची अभी खाली है",
    "wishlist.empty_sub": "हमारी कलात्मक कृतियों को देखें और हस्तनिर्मित उत्पादों को जोड़ें।",
    "wishlist.move_to_cart": "कार्ट में ले जाएँ",
    
    // Footer
    "footer.tagline": "सच्चे कारीगरों और कला प्रेमियों को एक सूत्र में पिरोता वैश्विक मंच।",
    "footer.quick_links": "कला संग्रह",
    "footer.about_us": "हमारे कारीगरों के बारे में",
    "footer.faq": "प्रश्नोत्तरी एवं सहायता",
    "footer.shipping": "डिलिवरी नीति",
    "footer.returns": "वापसी नीति",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "सेवा की शर्तें",
    "footer.contact": "स्टूडियो एवं संपर्क",
    "footer.newsletter_title": "कारीगरी की कहानियाँ और नई कृतियाँ",
    "footer.newsletter_desc": "कारीगरों के कार्यशाला के अनुभवों और सीमित संस्करणों की जानकारी हेतु जुड़ें।",
    "footer.subscribe": "सदस्य बनें",
    "footer.copyright": "© 2026 नानीज़ निट्स (Nani's Knitts)। हर कृति की अपनी एक कहानी है।",
  },
  es: {
    // Brand & Hero
    "hero.badge": "Nani's Knitts • Hecho con Amor",
    "hero.headline": "Hecho a mano, creado con el corazón.",
    "hero.subheadline": "Descubre tesoros artesanales auténticos — cada pieza creada con paciencia, pasión y una historia singular.",
    
    // Header & Navigation
    "nav.search_placeholder": "Buscar creaciones artesanales, cerámica, textiles...",
    "nav.wishlist": "Favoritos",
    "nav.cart": "Cesta",
    "nav.sign_in": "Iniciar Sesión",
    "nav.account": "Mi Perfil",
    "nav.orders": "Mis Pedidos",
    "nav.payment_methods": "Métodos de Pago",
    "nav.settings": "Ajustes",
    "nav.logout": "Cerrar Sesión",
    
    // Catalog & Filters
    "catalog.showing": "Mostrando",
    "catalog.products": "piezas",
    "catalog.product": "pieza",
    "catalog.clear_filters": "Limpiar filtros",
    "catalog.sort_by": "Ordenar por",
    "catalog.newest": "Novedades",
    "catalog.price_asc": "Precio: menor a mayor",
    "catalog.price_desc": "Precio: mayor a menor",
    "catalog.rating_desc": "Mejor valorados",
    "catalog.popularity": "Popularidad / Más Vendidos",
    "filters.title": "Filtros",
    "filters.reset": "Restablecer",
    "filters.category": "Categoría",
    "filters.artisan": "Artesano",
    "filters.price_range": "Rango de Precio",
    "filters.rating": "Valoración",
    "filters.all_ratings": "Todas",
    "filters.and_above": "o más",
    
    // Product Card & Actions
    "product.add_to_cart": "Añadir a la Cesta",
    "product.sold_out": "Agotado",
    "product.in_stock": "Disponible",
    "product.low_stock": "Últimas unidades",
    "product.out_of_stock": "Bajo pedido",
    "product.quick_view": "Vista Rápida",
    "product.save_wishlist": "Guardar en Favoritos",
    "product.in_wishlist": "En Favoritos",
    
    // Detail & Modal
    "detail.buy_now": "Comprar Ahora",
    "detail.artisan_guarantee": "Garantía 100% Hecho a Mano",
    "detail.handmade_note": "Pieza artesanal — pequeñas variaciones en color y textura celebran su carácter irrepetible.",
    "detail.reviews": "Reseñas",
    
    // Wishlist Tab
    "wishlist.title": "Mis Tesoros Guardados",
    "wishlist.subtitle": "Tus creaciones favoritas de nuestros artesanos.",
    "wishlist.empty_title": "Tu lista de favoritos está vacía",
    "wishlist.empty_sub": "Explora nuestras colecciones y descubre obras hechas a mano.",
    "wishlist.move_to_cart": "Mover a la Cesta",
    
    // Footer
    "footer.tagline": "Conectando a creadores independientes con amantes de lo auténtico.",
    "footer.quick_links": "Colecciones",
    "footer.about_us": "Nuestros Artesanos",
    "footer.faq": "Ayuda y Preguntas",
    "footer.shipping": "Política de Envíos",
    "footer.returns": "Devoluciones",
    "footer.privacy": "Privacidad",
    "footer.terms": "Términos y Condiciones",
    "footer.contact": "Taller y Soporte",
    "footer.newsletter_title": "Historias del Taller y Nuevos Lanzamientos",
    "footer.newsletter_desc": "Suscríbete para recibir novedades exclusivas y relatos de nuestros creadores.",
    "footer.subscribe": "Suscribirse",
    "footer.copyright": "© 2026 Nani's Knitts. Cada pieza cuenta una historia.",
  },
  fr: {
    // Brand & Hero
    "hero.badge": "Nani's Knitts • Fait Main avec Amour",
    "hero.headline": "Créé à la main, façonné avec le cœur.",
    "hero.subheadline": "Découvrez des trésors d'artisanat authentiques — chaque pièce conçue avec patience, passion et une histoire unique.",
    
    // Header & Navigation
    "nav.search_placeholder": "Rechercher créations artisanales, poterie, textiles...",
    "nav.wishlist": "Coups de Cœur",
    "nav.cart": "Panier",
    "nav.sign_in": "Connexion",
    "nav.account": "Mon Profil",
    "nav.orders": "Mes Commandes",
    "nav.payment_methods": "Moyens de Paiement",
    "nav.settings": "Paramètres",
    "nav.logout": "Déconnexion",
    
    // Catalog & Filters
    "catalog.showing": "Affichage de",
    "catalog.products": "créations",
    "catalog.product": "création",
    "catalog.clear_filters": "Effacer les filtres",
    "catalog.sort_by": "Trier par",
    "catalog.newest": "Nouveautés",
    "catalog.price_asc": "Prix : croissant",
    "catalog.price_desc": "Prix : décroissant",
    "catalog.rating_desc": "Mieux notés",
    "catalog.popularity": "Popularité / Meilleures Ventes",
    "filters.title": "Filtrer",
    "filters.reset": "Réinitialiser",
    "filters.category": "Catégorie",
    "filters.artisan": "Artisan",
    "filters.price_range": "Fourchette de Prix",
    "filters.rating": "Note Artisan",
    "filters.all_ratings": "Toutes les notes",
    "filters.and_above": "et plus",
    
    // Product Card & Actions
    "product.add_to_cart": "Ajouter au Panier",
    "product.sold_out": "Épuisé",
    "product.in_stock": "En Stock",
    "product.low_stock": "Dernières pièces",
    "product.out_of_stock": "Sur commande",
    "product.quick_view": "Aperçu Rapide",
    "product.save_wishlist": "Ajouter aux Favoris",
    "product.in_wishlist": "En Favoris",
    
    // Detail & Modal
    "detail.buy_now": "Commander",
    "detail.artisan_guarantee": "Garantie Artisanat 100% Authentique",
    "detail.handmade_note": "Objet artisanal — de subtiles variations de nuance et de matière témoignent de son authenticité.",
    "detail.reviews": "Avis Clients",
    
    // Wishlist Tab
    "wishlist.title": "Mes Pièces Préférées",
    "wishlist.subtitle": "Vos créations d'artisanat favorites réunies en un seul lieu.",
    "wishlist.empty_title": "Votre liste de favoris est encore vierge",
    "wishlist.empty_sub": "Explorez nos ateliers et collectionnez des pièces façonnées à la main.",
    "wishlist.move_to_cart": "Glisser au Panier",
    
    // Footer
    "footer.tagline": "Rapprocher les passionnés du fait main des artisans d'exception.",
    "footer.quick_links": "Univers Artisanal",
    "footer.about_us": "Nos Maîtres Artisans",
    "footer.faq": "Foire Aux Questions",
    "footer.shipping": "Livraison & Suivi",
    "footer.returns": "Retours & Échanges",
    "footer.privacy": "Confidentialité",
    "footer.terms": "Conditions Générales",
    "footer.contact": "Atelier & Assistance",
    "footer.newsletter_title": "Carnets d'Atelier & Pièces Rares",
    "footer.newsletter_desc": "Recevez nos récits d'artisans et nos séries très limitées.",
    "footer.subscribe": "S'inscrire",
    "footer.copyright": "© 2026 Nani's Knitts. Chaque création a son histoire.",
  },
};

function getStoredLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem("aura_language") as SupportedLanguage;
    if (saved && saved in LANGUAGES) return saved;
  } catch {}
  return "en";
}

function getStoredCurrency(): SupportedCurrency {
  try {
    const saved = localStorage.getItem("aura_currency") as SupportedCurrency;
    if (saved && saved in CURRENCIES) return saved;
  } catch {}
  return "INR";
}

const [language, setLanguageSignal] = createSignal<SupportedLanguage>(getStoredLanguage());
const [currency, setCurrencySignal] = createSignal<SupportedCurrency>(getStoredCurrency());

export const localeStore = {
  language,
  currency,

  setLanguage(lang: SupportedLanguage) {
    setLanguageSignal(lang);
    try {
      localStorage.setItem("aura_language", lang);
    } catch {}
  },

  setCurrency(curr: SupportedCurrency) {
    setCurrencySignal(curr);
    try {
      localStorage.setItem("aura_currency", curr);
    } catch {}
  },

  t(key: string, fallback?: string): string {
    const lang = language();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback || key;
  },

  formatPrice(priceInInr: number): string {
    const curr = currency();
    const config = CURRENCIES[curr] || CURRENCIES.INR;
    const converted = priceInInr * config.rateFromInr;

    try {
      return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.code,
        minimumFractionDigits: config.fractionDigits,
        maximumFractionDigits: config.fractionDigits,
      }).format(converted);
    } catch {
      return `${config.symbol}${converted.toFixed(config.fractionDigits)}`;
    }
  },

  currencySymbol(): string {
    const curr = currency();
    return CURRENCIES[curr]?.symbol || "₹";
  },
};
