
import { Chalet, User, UserRole, Booking } from './types';

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_6o175gw', 
  TEMPLATE_ID: 'template_ziecikq',
  PUBLIC_KEY: '4JPn0ReWZ4lOt8CLF',
};

const now = new Date().toISOString();

export const MOCK_USERS: User[] = [
  { 
    _id: '1', 
    name: 'Alice Admin', 
    email: 'admin@reva.com', 
    role: UserRole.ADMIN, 
    avatar: 'https://picsum.photos/id/64/100/100', 
    password: 'password123', 
    status: 'ACTIVE', 
    isApproved: true, 
    createdAt: now, 
    updatedAt: now 
  },
  { 
    _id: '2', 
    name: 'Omar Owner', 
    email: 'owner@reva.com', 
    role: UserRole.OWNER, 
    avatar: 'https://picsum.photos/id/91/100/100', 
    password: 'password123', 
    status: 'ACTIVE', 
    isApproved: true, 
    createdAt: now, 
    updatedAt: now 
  },
  { 
    _id: '3', 
    name: 'John Doe', 
    email: 'user@reva.com', 
    role: UserRole.CUSTOMER, 
    avatar: 'https://picsum.photos/id/12/100/100', 
    password: 'password123', 
    status: 'ACTIVE', 
    isApproved: true, 
    createdAt: now, 
    updatedAt: now 
  },
];

export const MOCK_CHALETS: Chalet[] = [
  {
    _id: 'c6',
    ownerId: '2',
    name: 'Reva Elite Flagship',
    description: 'Experience the pinnacle of coastal luxury at Reva Elite, where the azure horizons of the Dead Sea meet unparalleled sophistication.',
    location: 'Sowayma, Dead Sea',
    coordinates: { lat: 31.7225, lng: 35.5856 },
    pricePerNight: 750,
    maxGuests: 6,
    bedrooms: 3,
    rating: 5.0,
    reviewCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop'],
    amenities: ['Private Heated Pool', 'Signature BBQ Area', 'Dead Sea View', 'Total Privacy', 'Smart Home'],
    luxuryTier: 'Elite',
    isLive: true,
    status: 'APPROVED',
    serviceStatus: 'READY',
    instantBook: true,
    occupancyRate: 85,
    createdAt: now
  },
  {
    _id: 'c2',
    ownerId: '2',
    name: 'Dead Sea Infinity Villa',
    description: 'Private villa with an infinity pool overlooking the Dead Sea.',
    location: 'Sowayma, Balqa',
    coordinates: { lat: 31.7118, lng: 35.5891 },
    pricePerNight: 350,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.8,
    reviewCount: 125,
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049&auto=format&fit=crop'],
    amenities: ['Infinity Pool', 'Private Beach Access', 'BBQ', 'Wi-Fi'],
    luxuryTier: 'Premium',
    isLive: false,
    status: 'APPROVED',
    serviceStatus: 'CLEANING',
    instantBook: false,
    occupancyRate: 60,
    createdAt: now
  },
  {
    _id: 'c1',
    ownerId: '2',
    name: 'Wadi Rum Starlight Bubble',
    description: 'Experience the Martian landscape of Wadi Rum in a luxury bubble tent.',
    location: 'Wadi Rum, Aqaba',
    coordinates: { lat: 29.5735, lng: 35.4215 },
    pricePerNight: 180,
    maxGuests: 2,
    bedrooms: 1,
    rating: 4.9,
    reviewCount: 340,
    imageUrl: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?q=80&w=2070&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?q=80&w=2070&auto=format&fit=crop'],
    amenities: ['Stargazing Roof', 'Desert Tour', 'Breakfast', 'AC'],
    luxuryTier: 'Premium',
    isLive: true,
    status: 'APPROVED',
    serviceStatus: 'READY',
    instantBook: true,
    occupancyRate: 45,
    createdAt: now
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  { 
    _id: 'b1', 
    chaletId: 'c1', 
    userId: '3', 
    checkIn: '2023-12-20', 
    checkOut: '2023-12-22', 
    totalPrice: 360, 
    status: 'CONFIRMED', 
    guestName: 'John Doe',
    commissionFee: 54,
    netPayout: 306,
    paymentStatus: 'PAID',
    createdAt: '2023-11-01' 
  },
  { 
    _id: 'b2', 
    chaletId: 'c2', 
    userId: '3', 
    checkIn: '2024-01-10', 
    checkOut: '2024-01-12', 
    totalPrice: 700, 
    status: 'PENDING', 
    guestName: 'John Doe',
    commissionFee: 105,
    netPayout: 595,
    paymentStatus: 'PENDING',
    createdAt: '2023-12-05' 
  },
];
