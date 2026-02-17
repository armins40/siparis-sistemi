// Core types for the application

export type Sector = 
  | 'kasap' 
  | 'sarkuteri' 
  | 'tekel' 
  | 'manav' 
  | 'market' 
  | 'tatlici-pastane' 
  | 'petshop' 
  | 'kafe-restoran';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  isPublished: boolean;
  stock?: number; // Stok miktarı
  unit?: string; // Birim: 'kg', 'adet', 'lt', vb.
  createdAt: string;
  sector?: Sector | 'all'; // Hangi sektör için (admin eklediği ürünler için), 'all' = tüm sektörlerde görünür
  createdBy?: 'admin' | 'user'; // Kim ekledi (admin eklediği ürünler kullanıcıya önerilen ürünler olur)
  userId?: string; // Kullanıcı eklediğinde hangi kullanıcı (admin eklediğinde undefined)
}

export interface Category {
  id: string;
  name: string;
  order?: number;
  sector?: Sector; // Hangi sektör için (opsiyonel)
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  open: string;  // "09:00"
  close: string; // "21:00"
}

export interface Store {
  slug: string;
  name: string;
  description?: string;
  logo?: string; // Logo/Profil fotoğrafı URL
  banner?: string; // Banner görseli URL
  address?: string;
  phone?: string;
  whatsapp?: string;
  themeId?: string;
  sector?: Sector; // Mağazanın sektörü
  deliveryFee?: number; // Kurye ücreti
  openingHours?: Partial<Record<DayKey, DayHours | null>>; // Gün gün açılış kapanış
  googleReviewUrl?: string; // Google puanlama linki
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  card: string;
}

// Admin Panel Types
export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  password?: string; // Şifre (production'da hash edilmeli)
  plan: 'free' | 'trial' | 'monthly' | '6month' | 'yearly';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string; // Plan bitiş tarihi (trial için 7 gün sonra)
  storeSlug?: string; // Kullanıcının mağaza slug'ı
  sector?: Sector; // Kullanıcının sektörü (Kasap, Şarküteri, Tekel, Manav, vb.)
  emailVerified?: boolean; // Email doğrulandı mı
  phoneVerified?: boolean; // Telefon doğrulandı mı
  paymentMethodId?: string; // Ödeme yöntemi ID (Stripe vb.)
  referredByAffiliateId?: string; // Affiliate referansı ile geldiyse (affiliates.id)
  invoiceTaxNo?: string; // Fatura vergi numarası
  invoiceAddress?: string; // Fatura adresi
}

export interface VerificationCode {
  id: string;
  email?: string;
  phone?: string;
  code: string;
  type: 'email' | 'phone';
  expiresAt: string;
  verified: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'monthly' | '6month' | 'yearly';
  amount: number; // Ödeme tutarı
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  paymentMethod?: string; // Kart son 4 hanesi vb.
  paymentId?: string; // Ödeme ID (Stripe payment intent ID)
  createdAt: string;
  cancelledAt?: string;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  plan: 'monthly' | '6month' | 'yearly';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed'; // Yüzde veya sabit tutar
  discountValue: number; // İndirim değeri
  minPurchase?: number; // Minimum alışveriş tutarı
  maxDiscount?: number; // Maksimum indirim (yüzde için)
  usageLimit?: number; // Toplam kullanım limiti
  usageCount: number; // Kullanım sayısı
  validFrom: string; // Geçerlilik başlangıç tarihi
  validUntil: string; // Geçerlilik bitiş tarihi
  isActive: boolean;
  createdAt: string;
  createdBy?: string; // Hangi kullanıcı için (undefined = tüm kullanıcılar)
}

export interface Order {
  id: string;
  userId?: string; // Hangi kullanıcının siparişi
  storeSlug: string; // Hangi mağazanın siparişi
  items: OrderItem[];
  total: number;
  discount?: number; // Kupon indirimi
  finalTotal: number;
  address?: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  couponCode?: string; // Kullanılan kupon kodu
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  period: 'daily' | 'weekly' | 'monthly';
  data: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}
