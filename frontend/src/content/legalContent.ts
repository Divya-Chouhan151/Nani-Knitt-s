export interface LegalSection {
  id: string;
  title: string;
  content: string[];
  items?: string[];
  alert?: {
    type: "note" | "warning" | "info";
    text: string;
  };
}

export interface LegalDocument {
  slug: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  version: string;
  summary: string;
  sections: LegalSection[];
  notesForTeam: string[];
}

export const PRIVACY_POLICY: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  subtitle: "How Nani's Knitts collects, safeguards, and respects your personal data.",
  lastUpdated: "September 30, 2026",
  version: "2.1",
  summary:
    "We honor your privacy like a treasured family heirloom. This Privacy Policy details what information we gather when you browse our handmade shop or place an order, how we use it to fulfill your handmade goods, and your rights over your data.",
  notesForTeam: [
    "Confirm final statutory jurisdiction and registration entity under the Digital Personal Data Protection (DPDP) Act 2023 / GDPR.",
    "Verify the official Data Protection Officer (DPO) contact email address before production launch.",
    "Ensure third-party payment processor list (UPI / Razorpay / Stripe) matches active merchant gateway accounts."
  ],
  sections: [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      content: [
        "We only collect information necessary to deliver handcrafted goods, process safe payments, and provide warm customer care. Information you provide directly includes:",
      ],
      items: [
        "Contact & Identity Details: Full name, delivery and billing address, email address, and telephone number.",
        "Account Credentials: Password hashes (stored using industry-standard cryptographic hashing; we never store plain-text passwords), display name, and profile preferences.",
        "Payment Information: Payment method selection, UPI ID/VPA, or masked payment card tokens. All sensitive financial transactions are securely handled by PCI-DSS compliant payment gateways; we do not store full card numbers or banking PINs.",
        "Order & Communication History: Order items, customization notes for handmade requests, customer support messages, and saved wishlist items.",
        "Technical & Browsing Data: Device type, browser user-agent, IP address, and cookie tokens collected to maintain active shopping carts and locale preferences."
      ]
    },
    {
      id: "how-we-use-information",
      title: "2. How We Use Your Information",
      content: [
        "Every piece of information is utilized solely to provide and improve your experience at Nani's Knitts:",
      ],
      items: [
        "Order Fulfillment: Processing transactions, crafting custom knit specifications, packaging, and dispatching parcels to your specified delivery address.",
        "Customer Support & Updates: Sending order confirmations, dispatch tracking links, and responding to sizing or care inquiries.",
        "Personalization & Localization: Preserving your selected currency, language, and cart contents across visits.",
        "Security & Fraud Prevention: Protecting against unauthorized account access, fraudulent transactions, and abuse of promotional offers.",
        "Legal Compliance: Meeting accounting, tax, and consumer protection statutory requirements."
      ]
    },
    {
      id: "third-party-sharing",
      title: "3. Information Sharing & Third Parties",
      content: [
        "We never sell, rent, or trade your personal information to third-party data brokers or marketing aggregators.",
        "We share only the minimum required data with vetted service providers who enable our operations:"
      ],
      items: [
        "Payment Processors: Secure payment gateways (e.g., Razorpay, UPI Network, Stripe) to authenticate and settle transactions.",
        "Logistics & Courier Partners: Registered shipping carriers (e.g., India Post, BlueDart, Delhivery, FedEx) receive your name, delivery address, and contact number solely to complete parcel delivery.",
        "Cloud & Infrastructure: Secure hosting, database, and notification delivery infrastructure equipped with end-to-end encryption at rest and in transit."
      ],
      alert: {
        type: "note",
        text: "Our partners are strictly bound by confidentiality agreements and data processing terms that prohibit using your details for any purpose other than fulfilling Nani's Knitts orders."
      }
    },
    {
      id: "cookies-and-tracking",
      title: "4. Cookies & Browser Storage",
      content: [
        "We use browser cookies and local storage tokens for essential website operations, including maintaining your shopping cart, authentication session, and language/currency settings.",
        "You can configure your browser to block or alert you about cookies; however, disabling essential cookies may prevent adding items to your cart or completing checkout."
      ]
    },
    {
      id: "user-rights",
      title: "5. Your Data Rights & Choices",
      content: [
        "You maintain full ownership of your personal information. Under applicable privacy laws, you have the right to:",
      ],
      items: [
        "Access & Portability: Review all personal information linked to your profile via the User Profile page.",
        "Correction & Rectification: Edit your name, phone number, email address, and saved shipping addresses at any time in Account Settings.",
        "Erasure & Account Deletion: Request permanent deletion of your profile data, subject to mandatory tax and financial retention laws.",
        "Opt-out of Communications: Unsubscribe from seasonal newsletters or artisanal updates at any time via the link in our emails or your notification settings."
      ]
    },
    {
      id: "contact-privacy",
      title: "6. Contact Our Privacy Desk",
      content: [
        "If you have questions regarding this Privacy Policy, wish to exercise your data rights, or want to report a concern, please reach out to our team:",
        "Email: privacy@nanisknitts.com | care@nanisknitts.com",
        "Physical Address: Nani's Knitts Artisan Studio, 14 Craft Haven Lane, Bengaluru, KA 560038, India.",
        "Response Time: We aim to acknowledge all privacy inquiries within 48 business hours."
      ]
    }
  ]
};

export const TERMS_OF_SERVICE: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  subtitle: "Terms and conditions governing the use of Nani's Knitts website and purchase of handmade items.",
  lastUpdated: "September 30, 2026",
  version: "2.0",
  summary:
    "By accessing or shopping at Nani's Knitts, you agree to these Terms of Service. Please review them carefully to understand your rights, our artisanal commitments, and mutual responsibilities.",
  notesForTeam: [
    "Confirm official corporate entity name and primary registered office jurisdiction.",
    "Verify dispute arbitration forum (e.g., courts of Bengaluru / National Consumer Forum).",
    "Confirm maximum liability caps for third-party courier delays."
  ],
  sections: [
    {
      id: "acceptance-of-terms",
      title: "1. Acceptance of Terms",
      content: [
        "Welcome to Nani's Knitts. By browsing our website, registering an account, or placing an order, you agree to be bound by these Terms of Service and our associated Privacy Policy and Shipping & Returns guidelines.",
        "If you do not agree to these terms, please do not use our services or purchase items through our storefront."
      ]
    },
    {
      id: "artisanal-products",
      title: "2. Description of Products & Handmade Nature",
      content: [
        "Nani's Knitts specializes in handcrafted textile pieces, heirloom knitwear, plush toys, and artisan accessories. Because each item is lovingly crafted by hand:",
      ],
      items: [
        "Subtle Variations: Minor natural variations in stitch gauge, yarn color-dye lots, or texture are inherent hallmarks of authentic handmade goods and do not constitute manufacturing defects.",
        "Photographic Accuracy: We strive to photograph all pieces under natural lighting; however, color rendition may vary slightly depending on your device's display profile.",
        "Custom Orders: Made-to-order pieces require crafting lead time as stated on the product page prior to packaging and dispatch."
      ]
    },
    {
      id: "user-accounts",
      title: "3. Account Responsibilities",
      content: [
        "When creating an account with Nani's Knitts, you agree to provide truthful, accurate, and current information. You are solely responsible for:",
      ],
      items: [
        "Maintaining the confidentiality of your account credentials, passwords, and two-factor authentication tokens.",
        "All activities conducted under your registered account.",
        "Immediately notifying us at security@nanisknitts.com if you suspect unauthorized access or compromise of your credentials."
      ]
    },
    {
      id: "orders-pricing-payment",
      title: "4. Orders, Pricing & Payment Terms",
      content: [
        "All prices are quoted in the displayed currency (INR, USD, EUR, GBP) and include applicable statutory sales taxes unless stated otherwise at checkout.",
        "Order Confirmation: An order confirmation email acknowledges receipt of your request. Contract of sale is finalized upon dispatch of your goods.",
        "Pricing Errors: In the rare event of a typographical error or technical glitch displaying an erroneous price, we reserve the right to cancel the order and provide a full immediate refund."
      ]
    },
    {
      id: "intellectual-property",
      title: "5. Intellectual Property Rights",
      content: [
        "All content featured on Nani's Knitts — including the 'Nani' animated character mark, logos, bespoke knitting patterns, photographs, product narratives, and website code — is the exclusive intellectual property of Nani's Knitts or its licensors.",
        "You may not reproduce, distribute, modify, or create derivative works of any site content without prior written permission from Nani's Knitts."
      ]
    },
    {
      id: "limitation-of-liability",
      title: "6. Limitation of Liability",
      content: [
        "To the maximum extent permitted by applicable law, Nani's Knitts shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from:",
      ],
      items: [
        "Delays caused by courier disruptions, customs clearance, or force majeure events (severe weather, strikes, natural disasters).",
        "Improper washing, heat-drying, or fabric mishandling contrary to our provided woolen garment care guidelines.",
        "Unauthorized access to or alteration of your transmissions or data beyond our reasonable security measures."
      ]
    },
    {
      id: "governing-law",
      title: "7. Governing Law & Dispute Resolution",
      content: [
        "These Terms of Service are governed by and construed in accordance with the laws of India. Any legal dispute, controversy, or claim arising out of or relating to your use of the website shall be subject to the exclusive jurisdiction of the competent courts of Bengaluru, Karnataka, India.",
        "We encourage customers to contact our Care Desk before seeking formal legal remedies, as we strive to resolve all patron issues amiably."
      ],
      alert: {
        type: "warning",
        text: "Policy note for internal team: Governing jurisdiction is set to Bengaluru, India as baseline; legal counsel must confirm jurisdictional scope for international cross-border sales prior to expansion."
      }
    },
    {
      id: "updates-to-terms",
      title: "8. Changes to These Terms",
      content: [
        "We may update these Terms of Service periodically to reflect changes in our artisan collection, operational practices, or legal obligations.",
        "When significant modifications occur, we will post the revised version on this page with an updated 'Last Updated' date and announce substantial changes via site banner or email."
      ]
    }
  ]
};

export const SHIPPING_AND_RETURNS: LegalDocument = {
  slug: "shipping-returns",
  title: "Shipping & Returns Policy",
  subtitle: "Handcrafted delivery estimates, transparent shipping rates, and easy hassle-free returns.",
  lastUpdated: "September 30, 2026",
  version: "2.1",
  summary:
    "We treat every parcel like a gift sent to a loved one. Learn how we package your knits, how long dispatch takes, and how our 7-day artisan return guarantee works.",
  notesForTeam: [
    "Confirm default return window (currently set to 7 days post-delivery; decide if 14 days is preferred).",
    "Confirm reverse pickup policy: Currently free for defective/wrong items; flat ₹75 deduction for buyer preference/size exchange.",
    "Verify free shipping threshold (₹999 standard cart value)."
  ],
  sections: [
    {
      id: "dispatch-timeframes",
      title: "1. Dispatch & Crafting Timeframes",
      content: [
        "Because our goods are handmade with dedication, dispatch timelines depend on whether an item is in-stock or made-to-order:",
      ],
      items: [
        "Ready-to-Ship Items: Dispatched within 24 to 48 hours of order confirmation.",
        "Made-to-Order & Custom Sized Pieces: Hand-knitted upon order; crafting lead time ranges between 3 to 5 business days prior to dispatch, as indicated on the item page.",
        "Packaging: Every order is packaged in breathable, eco-friendly muslin bags and recycled cardboard boxes with lavender sachets to protect natural wool fibers during transit."
      ]
    },
    {
      id: "shipping-methods-rates",
      title: "2. Shipping Methods & Estimated Delivery",
      content: [
        "We partner with reputable courier networks (BlueDart, Delhivery, Speed Post) to ensure safe door-to-door delivery:",
      ],
      items: [
        "Standard Artisan Shipping (5–7 Business Days): FREE on all orders of ₹999 or above. A flat rate of ₹99 applies to orders below ₹999.",
        "Express Delivery (2–3 Business Days): Available at checkout for select metro pincodes for an additional ₹149 charge.",
        "Remote & Hill Stations: Delivery may take 7–10 business days depending on terrain and weather conditions."
      ],
      alert: {
        type: "info",
        text: "Delivery timeframes are realistic estimates calculated from dispatch date. Severe seasonal weather or courier network delays are communicated via SMS / email."
      }
    },
    {
      id: "order-tracking",
      title: "3. Live Order Tracking",
      content: [
        "Once your parcel is handed over to our courier partner:",
      ],
      items: [
        "You will receive an automated dispatch notification with your AWB tracking number and a direct courier portal link.",
        "You can also view real-time fulfillment stages (PLACED → CONFIRMED → SHIPPED → DELIVERED) anytime in your User Profile under the Orders tab at /profile/orders."
      ]
    },
    {
      id: "return-window-conditions",
      title: "4. Return Window & Eligibility Conditions",
      content: [
        "We want you to be completely delighted with your handmade purchase. If you are not satisfied, you may initiate a return within 7 calendar days from the date of recorded delivery.",
        "To be eligible for a return and full refund, items must satisfy the following criteria:"
      ],
      items: [
        "Unworn & Unwashed: Garments must show no signs of perfume, pet hair, wear, or washing.",
        "Original Tags & Packaging: Must include original garment labels, yarn tags, and muslin protective pouch.",
        "Non-Returnable Items: Bespoke personalized knit pieces (e.g., custom name embroidery) and intimate items (socks, headbands) are final-sale for hygiene reasons unless found damaged on arrival.",
        "Defective or Damaged Parcels: If a piece arrives damaged or with dropped stitches, notify us within 48 hours of delivery with a photo for instant expedited replacement."
      ]
    },
    {
      id: "how-to-initiate-return",
      title: "5. How to Initiate a Return",
      content: [
        "Initiating a return is simple and automated through your customer profile:",
      ],
      items: [
        "Step 1: Go to your Account Profile and select the Orders tab (/profile/orders).",
        "Step 2: Locate the delivered order and click 'Order Details' or 'Need Help with this Order'.",
        "Step 3: Select your return reason, attach any photos if applicable, or raise an instant ticket under the Help Center (/profile/help).",
        "Step 4: Our Care Desk will approve the request within 24 hours and schedule a reverse courier pickup from your doorstep."
      ]
    },
    {
      id: "refunds-and-shipping-costs",
      title: "6. Refunds & Return Shipping Liability",
      content: [
        "Defective or Incorrect Delivery: If we shipped the incorrect color, size, or a defective piece, Nani's Knitts covers 100% of return shipping costs and provides a complete refund.",
        "Buyer Preference / Sizing Returns: For returns initiated due to buyer preference or incorrect sizing choice, a nominal reverse pickup charge of ₹75 is deducted from the refund total.",
        "Refund Method & Timeframe: Refunds are credited back to your original payment method (bank account, UPI, card) within 5–7 business days following warehouse receipt and quality inspection."
      ]
    },
    {
      id: "questions-support",
      title: "7. Need Immediate Assistance?",
      content: [
        "Have questions about yarn care, tracking an overdue delivery, or arranging an urgent gift dispatch?",
        "Email: shipping@nanisknitts.com | hello@nanisknitts.com",
        "Helpline: +91 80 4920 1200 (Monday – Saturday, 9:00 AM – 7:00 PM IST)",
        "Help Center: Browse our comprehensive FAQ section anytime at /profile/help."
      ]
    }
  ]
};

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_OF_SERVICE,
  "shipping-returns": SHIPPING_AND_RETURNS
};
