# 🚗 SpareSaarthi — Mobile Automobile Spare Parts Marketplace

SpareSaarthi is a complete mobile commerce application designed for discovering, purchasing, and managing automobile spare parts. Built using a robust cross-platform mobile frontend and a scalable backend API, it offers a seamless shopping experience for vehicle owners and workshops.

---

## 🌟 Key Features

### 📱 Mobile Client (React Native / Expo)
- **Authentication & Security:** Custom sign-up/login forms backed by secure session contexts (`AuthContext`).
- **Product Catalog:** Interactive search and filters to find parts by vehicle brand, model, and category.
- **Cart Management:** Dynamic cart updates (`CartContext`) with pricing calculations.
- **Responsive Layouts:** Styled using React Native safe area context to support diverse screen configurations.

### ⚙️ REST API Backend (Node.js & Express)
- **MVC Architecture:** Structured endpoints separating database operations, logic handling, and route definitions.
- **Mongoose Data Models:** Schemas for user accounts, product details, orders, and reviews.
- **Security Middlewares:** Endpoint protection and authentication validation layers.
- **Database Seeder:** Includes a seeder utility (`seed.js`) to populate mock automobile parts and categories for initial testing.

---

## 🛠️ Technology Stack

- **Mobile Frontend:** React Native, Expo, React Navigation, Safe Area Context
- **Backend API:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **State Management:** React Context API (Auth & Cart Contexts)

---

## 📁 Repository Structure

```text
SpareSaarthi/
├── .expo/            # Expo configuration logs
├── assets/           # Local mobile assets (icons, logo, splash screens)
├── src/              # React Native source code
│   ├── components/   # Reusable UI widgets
│   ├── context/      # AuthContext, CartContext
│   ├── navigation/   # AppNavigators and Stack/Tab routing
│   └── screens/      # Login, Register, Home, Cart, Product details views
│
├── backend/          # Node.js API server
│   ├── config/       # Database connection configs
│   ├── controllers/  # API handler actions
│   ├── middleware/   # Authentication checks
│   ├── models/       # MongoDB schemas (User, Part, Order)
│   ├── routes/       # API endpoints definitions
│   └── server.js     # Express server setup
│
├── App.js            # Expo entry point wrapping app context providers
└── app.json          # Expo deployment config metadata
```

---

## ⚙️ Local Setup Guide

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install server-side dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `backend/` and configure:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   ```
4. Run the seeder to populate mock parts (Optional):
   ```bash
   node seed.js
   ```
5. Start the API server:
   ```bash
   node server.js
   ```

### 2. Mobile Setup
1. Return to the root folder:
   ```bash
   cd ..
   ```
2. Install Expo and React Native packages:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Use the Expo Go mobile app (iOS/Android) or run on an emulator (Android Studio / Xcode) by scanning the QR code in the terminal.

---

## 🤝 Contributing
Contributions, feature suggestions, and bug reports are welcome! Create a pull request or open an issue to collaborate.

---

*Built with ❤️ by Abhay Gupta. Driving mobile solutions for automobile logistics.*
