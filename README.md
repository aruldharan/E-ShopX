# ShopX - Full-Stack MERN E-Commerce Platform

A production-level e-commerce platform inspired by Amazon/Flipkart, built with the MERN stack and TypeScript.

## Tech Stack

- **Frontend**: React, TypeScript, Redux Toolkit, React Router, TanStack Query, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, MongoDB, Socket.io, JWT Auth
- **Database**: MongoDB (local)

---

## Prerequisites

Before you begin, make sure you have:

- [Node.js](https://nodejs.org/) v18+ installed
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017

### Start MongoDB (if not already running)

```bash
# Windows
net start MongoDB
# Or via mongod
mongod --dbpath C:/data/db
```

---

## Deployment Guide (Free)

This project is configured to be deployed as a monolithic application (Backend serving Frontend) which is ideal for free tiers on platforms like **Render** or **Railway**.

### 1. Database Setup
- Create a free MongoDB cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Get your connection string.

### 2. Prepare for Deployment
- Ensure you have pushed your code to GitHub.

### 3. Deploy to Render (Recommended Free Option)
1. **Create a New Web Service**: Link your GitHub repository.
2. **Runtime**: Select `Node`.
3. **Build Command**: `npm run install-all && npm run build` (This runs from the root).
4. **Start Command**: `npm start`.
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas URL
   - `JWT_SECRET`: A random string
   - `VITE_API_URL`: `/api`
   - `CLIENT_URL`: Your Render app URL (e.g., `https://your-app.onrender.com`)

---

## Quick Start

### 1. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 2. Environment Setup

The backend `.env` is pre-configured at `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=supersecretkey
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd backend
npx ts-node --compiler-options "{\"module\":\"commonjs\"}" src/utils/seed.ts
```

This creates:

- Admin: `admin@shopx.com` / `admin123`
- User: `user@shopx.com` / `user123`
- 8 sample products (electronics, fashion, books)
- Coupons: `SAVE10` (10% off ₹500+), `WELCOME20` (20% off ₹1000+)

### 4. Run the Application

**Backend** (Terminal 1):

```bash
cd backend
npm run dev
```

→ API running at **http://localhost:5000**

**Frontend** (Terminal 2):

```bash
cd frontend
npm run dev
```

→ App running at **http://localhost:3000**

---

## Features

### Customer Features

- 🔐 Register / Login with JWT auth
- 🔍 Search & filter products (price, rating, category)
- 🛒 Cart management (add, update, remove)
- Wishlist
- 💳 Checkout with COD, UPI, Card (mock)
- 🎟️ Coupon code support
- 📦 Order tracking & history
- ⭐ Product reviews & ratings

### Admin Features

- Dashboard with revenue, order, user stats
- Product management (CRUD)
- Order management
- User management

---

## Project Structure

```
mern-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── utils/          # Seed script
│   │   └── server.ts       # Entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, Footer, ProductCard
    │   ├── pages/          # All pages
    │   │   └── admin/      # Admin pages
    │   ├── redux/          # Store + slices
    │   ├── services/       # Axios API instance
    │   └── App.tsx
    ├── package.json
    └── vite.config.ts
```

---

## API Endpoints

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| POST   | `/api/auth/register`   | Register user                    |
| POST   | `/api/auth/login`      | Login                            |
| GET    | `/api/auth/me`         | Get current user                 |
| GET    | `/api/products`        | List products (supports filters) |
| GET    | `/api/products/:id`    | Product detail                   |
| POST   | `/api/products`        | Create product (admin)           |
| GET    | `/api/categories`      | All categories                   |
| GET    | `/api/cart`            | Get cart                         |
| POST   | `/api/cart`            | Add to cart                      |
| POST   | `/api/orders`          | Place order                      |
| GET    | `/api/orders/myorders` | My orders                        |
| POST   | `/api/reviews`         | Submit review                    |
| POST   | `/api/coupons/verify`  | Verify coupon                    |

---

Built with MERN Stack + TypeScript
