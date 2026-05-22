# CartSure 🛒

CartSure is a full-stack, Apple-inspired e-commerce platform built as a playground for students to learn, write, and execute test cases (Unit, Integration, and End-to-End). It simulates a real-world store including a shopping cart, Firestore-backed data synchronization, and a secure Razorpay checkout gateway.

---

## 🏗️ Project Architecture

The project is structured as a monorepo containing both the frontend and backend applications:

```text
CartSure/
├── backend/            # Express payment & log handler backend
│   ├── index.js        # Server entry point
│   ├── package.json    # Backend dependencies & run scripts
│   └── .env            # Environment variables (CORS, Razorpay keys)
│
├── src/                # Angular 19 Frontend Application
│   ├── app/
│   │   ├── core/       # Authentication, payment, and database services
│   │   ├── features/   # Shop, Cart, Checkout, and Order components
│   │   └── shared/     # Reusable layout and UI elements
│   └── environments/   # Firebase client configurations
│
├── angular.json        # Angular CLI configuration
└── package.json        # Frontend dependencies & scripts
```

---

## 🛠️ Tech Stack

*   **Frontend:** Angular 19, Tailwind CSS, RxJS, AngularFire (Firebase Client SDK)
*   **Backend:** Node.js, Express, Razorpay SDK
*   **Database:** Google Cloud Firestore (Firebase)

---

## 🚀 Local Development Setup

Follow these steps to run both services on your local machine:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 2. Run the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file to customize credentials:
   ```env
   PORT=3000
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3000`.

### 3. Run the Frontend
1. Open a new terminal at the root directory of the project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular dev server:
   ```bash
   npm start
   ```
   The frontend will build and automatically open at `http://localhost:4200`.

---

## 🧪 Student Testing Scenarios

This application is purposefully designed with various edge cases and async actions for writing automated tests:

### 1. E2E (End-to-End) Tests (e.g., Cypress, Playwright, or Protractor)
*   **Cart Flow:** Add items to cart, change quantities, verify totals adjust, remove items, and ensure persistent state.
*   **Checkout & Gateway:** Fill in shipping details, click checkout, trigger the Razorpay modal, and verify the checkout completion screen.
*   **Routing:** Verify that unauthorized users are redirected from secured pages.

### 2. Integration / API Tests
*   **Express Payments:** Mock and test the `/api/create-order` and `/api/verify-payment` endpoints inside the [backend](file:///C:/Maple/backend) server.
*   **Firestore Database:** Test CRUD rules for `products` and `orders` collections.

---

## 🌐 Production Deployment

The project is pre-configured to be deployed independently to Vercel and Render:

### Frontend — Vercel
1. Link your repository to **Vercel**.
2. Configure the following project settings:
   *   **Framework Preset:** `Angular`
   *   **Root Directory:** `/` (leave as repository root)
   *   **Build Command:** `npm run build`
   *   **Output Directory:** `dist/maple-frontend/browser`

### Backend — Render
1. Create a new **Web Service** on **Render**.
2. Link it to the same repository.
3. Configure the following settings:
   *   **Root Directory:** `backend`
   *   **Runtime:** `Node`
   *   **Build Command:** `npm install`
   *   **Start Command:** `npm start`
4. Add environment variables (like `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) in Render's **Environment** tab.
