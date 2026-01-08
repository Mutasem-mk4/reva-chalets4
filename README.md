# Reva Chalet | The Elite Collection 🏰✨

Reva Chalet is a high-end luxury booking platform for curated architectural sanctuaries in Jordan. Built with a focus on immersive user experience, sophisticated aesthetics, and cutting-edge AI integration.

## 🚀 Core Features

- **AI Concierge:** Powered by **Gemini 3 Pro**, providing personalized travel advice, property discovery, and real-time grounding via Google Search and Maps.
- **Elite Dashboard:** Dual-purpose interface for Admins and Owners featuring live financial flux, occupancy metrics, and registry management.
- **Immersive UI:** High-performance animations using **Framer Motion**, including a cinematic Hero section and an advanced Booking Audit Side-Drawer.
- **Persistent Registry:** Utilizes IndexedDB for a real-world persistent database experience directly in the browser.
- **Multilingual Support:** Full English and Arabic (RTL) integration with custom typography.
- **Security First:** Vetted access system with simulated OTP verification and administrative approval gates.

## 🛠️ Tech Stack

- **Frontend:** React 19 (ESM-based)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **AI Engine:** Google Gemini API (@google/genai)
- **Charts:** Recharts
- **Email:** EmailJS

## 📦 Setup & Installation

Since this project uses an ESM-based import map, it requires no complex build steps.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/reva-chalet.git
   ```

2. **Environment Variables:**
   The application expects a `process.env.API_KEY` for the Gemini AI services.

3. **Running Locally:**
   Simply serve the project folder using any static web server (e.g., Live Server in VS Code).

## 🔐 Security Warning
This repository contains a mock-up of the MongoDB cluster configuration. Ensure that for production deployment, sensitive credentials in `services/apiConfig.ts` are moved to protected environment variables.

---
*Crafted for the future of leisure in the Hashemite Kingdom of Jordan.*