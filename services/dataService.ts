
import { User, Chalet, Booking, UserRole } from '../types';
import { MOCK_USERS, MOCK_CHALETS, MOCK_BOOKINGS, EMAILJS_CONFIG } from '../constants';
import emailjs from '@emailjs/browser';

/**
 * REVA PERSISTENT DATABASE SERVICE (IndexedDB Implementation)
 * Provides a real, persistent database environment in the browser.
 * Handles: Identity, Assets, and Reservations.
 */
class RevaDatabase {
  private dbName = 'RevaChaletDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('chalets')) {
          db.createObjectStore('chalets', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('bookings')) {
          db.createObjectStore('bookings', { keyPath: '_id' });
        }
      };

      request.onsuccess = async (event: any) => {
        this.db = event.target.result;
        await this.seedInitialData();
        resolve();
      };

      request.onerror = () => reject('Failed to initialize Reva Database');
    });
  }

  private async seedInitialData() {
    const users = await this.getAll<User>('users');
    if (users.length === 0) {
      for (const u of MOCK_USERS) await this.put('users', u);
    }
    const chalets = await this.getAll<Chalet>('chalets');
    if (chalets.length === 0) {
      for (const c of MOCK_CHALETS) await this.put('chalets', c);
    }
    const bookings = await this.getAll<Booking>('bookings');
    if (bookings.length === 0) {
      for (const b of MOCK_BOOKINGS) await this.put('bookings', b);
    }
  }

  private async getStore(name: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) await this.init();
    return this.db!.transaction(name, mode).objectStore(name);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const store = await this.getStore(storeName);
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async put(storeName: string, data: any): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
    });
  }

  async find<T>(storeName: string, query: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll<T>(storeName);
    return all.filter(query);
  }
}

const db = new RevaDatabase();

class CloudDataService {
  private tempSignups: Map<string, { otp: string; userData: any }> = new Map();

  constructor() {
    db.init();
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpEmail(email: string, name: string, otp: string) {
    console.group(`%c[REVA DB] SECURITY SIGNAL`, 'color: #d4af37; font-weight: bold;');
    console.log(`User: ${name} (${email})`);
    console.log(`Auth Code: ${otp}`);
    console.groupEnd();

    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        { to_name: name, to_email: email, otp_code: otp },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
    } catch (e) {
      console.warn("Email delivery deferred. Use console code.");
    }
  }

  async login(email: string, password: string): Promise<{ user: User }> {
    const users = await db.find<User>('users', u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (users.length === 0) throw new Error("Invalid credentials.");
    
    const user = users[0];
    if (!user.isApproved) throw new Error("Account pending administrative vetting.");

    const otp = this.generateOtp();
    await db.put('users', { ...user, otp });
    await this.sendOtpEmail(user.email, user.name, otp);
    
    return { user };
  }

  async verifyLoginOtp(email: string, otp: string): Promise<User> {
    const users = await db.find<User>('users', u => u.email.toLowerCase() === email.toLowerCase());
    const user = users[0];
    if (!user || user.otp !== otp) throw new Error("Incorrect verification code.");

    const updatedUser = { ...user, otp: undefined };
    await db.put('users', updatedUser);
    localStorage.setItem('reva_session', JSON.stringify(updatedUser));
    return updatedUser;
  }

  async requestSignupOtp(userData: any): Promise<void> {
    const existing = await db.find<User>('users', u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing.length > 0) throw new Error("Identity already exists in Reva Registry.");

    const otp = this.generateOtp();
    this.tempSignups.set(userData.email, { otp, userData });
    await this.sendOtpEmail(userData.email, userData.name, otp);
  }

  async verifySignupOtp(email: string, otp: string): Promise<User> {
    const temp = this.tempSignups.get(email);
    if (!temp || temp.otp !== otp) throw new Error("Invalid verification code.");

    const userId = Math.random().toString(36).substring(2, 15);
    const newUser: User = {
      ...temp.userData,
      _id: userId,
      isApproved: temp.userData.role === UserRole.CUSTOMER,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.put('users', newUser);
    this.tempSignups.delete(email);
    if (newUser.isApproved) localStorage.setItem('reva_session', JSON.stringify(newUser));
    return newUser;
  }

  getCurrentUser(): User | null {
    const s = localStorage.getItem('reva_session');
    return s ? JSON.parse(s) : null;
  }

  logout() { localStorage.removeItem('reva_session'); }

  async getUsers() { return db.getAll<User>('users'); }

  async setUserApproval(id: string, isApproved: boolean) {
    const u = await db.getById<User>('users', id);
    if (u) await db.put('users', { ...u, isApproved, updatedAt: new Date().toISOString() });
  }

  async getChalets(onlyApproved = true) {
    const all = await db.getAll<Chalet>('chalets');
    return onlyApproved ? all.filter(c => c.status === 'APPROVED' && c.isLive) : all;
  }

  async getChaletById(id: string) { return db.getById<Chalet>('chalets', id); }

  async getUserById(id: string) { return db.getById<User>('users', id); }

  async findChalets(query: Partial<Chalet>) {
    return db.find<Chalet>('chalets', c => {
      return Object.entries(query).every(([k, v]) => (c as any)[k] === v);
    });
  }

  async saveChalet(data: Partial<Chalet>) {
    const id = data._id || Math.random().toString(36).substring(2, 15);
    const chalet = {
      ...data,
      _id: id,
      createdAt: data.createdAt || new Date().toISOString(),
      status: data.status || 'PENDING',
      serviceStatus: data.serviceStatus || 'READY',
      isLive: data.isLive ?? true
    } as Chalet;
    await db.put('chalets', chalet);
    return chalet;
  }

  async deleteChalet(id: string) { await db.delete('chalets', id); }

  async updateChaletStatus(id: string, status: 'PENDING' | 'APPROVED') {
    const c = await db.getById<Chalet>('chalets', id);
    if (c) await db.put('chalets', { ...c, status });
  }

  async updateServiceStatus(id: string, status: any) {
    const c = await db.getById<Chalet>('chalets', id);
    if (c) await db.put('chalets', { ...c, serviceStatus: status });
  }

  async createBooking(data: any) {
    const id = Math.random().toString(36).substring(2, 15);
    const booking: Booking = {
      ...data,
      _id: id,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      commissionFee: data.totalPrice * 0.15,
      netPayout: data.totalPrice * 0.85,
      createdAt: new Date().toISOString()
    };
    await db.put('bookings', booking);
    return booking;
  }

  async getBookings() { return db.getAll<Booking>('bookings'); }
}

export const dataService = new CloudDataService();
export const LANDMARKS = { 'Dead Sea': {}, 'Petra': {}, 'Wadi Rum': {}, 'Amman': {}, 'Aqaba': {}, 'Ajloun': {} };
