
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isApproved: boolean; // New: Security gate
  otp?: string; // New: Temporary verification code
  createdAt: string;
  updatedAt: string;
}

export interface Chalet {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  rating: number;
  imageUrl: string; 
  gallery: string[]; 
  amenities: string[];
  reviewCount: number;
  luxuryTier: 'Elite' | 'Premium' | 'Standard';
  isLive: boolean;
  status: 'PENDING' | 'APPROVED';
  serviceStatus: 'READY' | 'CLEANING' | 'MAINTENANCE';
  instantBook: boolean;
  occupancyRate: number;
  createdAt: string;
}

export interface Booking {
  _id: string;
  chaletId: string;
  userId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  commissionFee: number;
  netPayout: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  createdAt: string;
}
