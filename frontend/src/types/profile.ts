export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
}

export interface AddressPayload {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  totalAmount: number;
  itemCount: number;
  firstItemTitle?: string;
  firstItemImageUrl?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress: string;
  paymentStatus: string;
  trackingCarrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  canCancel: boolean;
  canReturn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  otpAuthUri: string;
  backupCodes: string[];
}

export interface SecurityEvent {
  id: string;
  eventType: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  createdAt: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  language: string;
  currency: string;
  marketingConsent: boolean;
  dataSharingConsent: boolean;
  scheduledPurgeAt?: string;
  deletionRequestedAt?: string;
}

export interface SupportFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface SupportTicketMessage {
  id: string;
  senderType: "CUSTOMER" | "SUPPORT";
  message: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  orderId?: string;
  category: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketDetail extends SupportTicket {
  messages: SupportTicketMessage[];
}

export type PaymentMethodType = "UPI" | "CARD" | "NETBANKING";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  vpa?: string;
  maskedVpa?: string;
  accountHolderName?: string;
  bankName?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VpaValidationResult {
  vpa: string;
  isValid: boolean;
  accountHolderName?: string;
  bankName?: string;
  gatewayReferenceId?: string;
  message?: string;
}

