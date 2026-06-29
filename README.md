# Eventora

### A Full-Stack Event Booking Platform

Discover, book, and manage events with secure OTP-based verification — built on the MERN stack.

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [API Reference](#api-reference) • [Booking Flow](#how-booking-works)

---

## Overview

**Eventora** is a complete event management and ticket booking platform. Users can discover events, book tickets through a secure email-OTP verification flow, and track their booking history. Admins get a centralized dashboard to publish events and manually review, approve, or reject every booking request.

The project demonstrates a production-style MERN architecture: JWT authentication, role-based authorization, email-based two-factor verification, and a fully decoupled REST API consumed by a Vite + React frontend.

---

## Features

### For Users
- Email OTP verification on registration and login
- Real-time search across events by title
- Rich event detail pages — pricing, location, date, live seat availability
- Secure OTP-confirmed ticket booking
- Personal dashboard to track booking status (`pending` / `confirmed` / `cancelled`)
- Self-service booking cancellation

### For Admins
- Centralized dashboard shared across all admin accounts
- Create, publish, and delete events
- Review every booking request platform-wide
- Approve bookings as paid / unpaid, or reject them outright
- Automatic seat inventory management on confirm/cancel
- Live revenue and booking analytics

### Platform
- JWT authentication with `user` / `admin` role-based access control
- Automated email notifications — OTP delivery, booking confirmation, cancellation
- Self-expiring OTPs (5-minute TTL via MongoDB)
- Protected routes on both API and frontend layers

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM, Tailwind CSS v4, Axios, React Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **Email** | Nodemailer (Gmail SMTP) |

---

## Project Structure

```
eventora/
├── backend/
│   ├── server.js
│   ├── seed.js
│   └── src/
│       ├── app.js
│       ├── db/db.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── event.model.js
│       │   ├── booking.model.js
│       │   └── otp.model.js
│       ├── controllers/
│       │   ├── auth.controllers.js
│       │   ├── events.controllers.js
│       │   └── bookings.controllers.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── events.routes.js
│       │   └── bookings.routes.js
│       ├── middlewares/auth.middleware.js
│       └── utils/email.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── context/auth.context.jsx
        ├── utils/axios.js
        ├── components/Navbar.jsx
        └── pages/
            ├── Home.jsx
            ├── EventDetail.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── UserDashboard.jsx
            ├── AdminDashboard.jsx
            ├── PaymentSuccess.jsx
            └── PaymentFailed.jsx
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local instance or Atlas cluster)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) generated for SMTP

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/eventora.git
cd eventora
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend root:

```env
MONGO_URI=mongodb://localhost:27017/eventora
JWT_SECRET=your_jwt_secret_key
PORT=3000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Seed the database with demo data *(optional, recommended for first run)*:

```bash
node seed.js
```

This generates 10 demo users, 6 sample events, and randomized bookings:

```
Admin Email: admin@eventora.com
User Email:  user@eventora.com
Password:    password123
```

Launch the backend:

```bash
npx nodemon server.js
```

> Server runs at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> App runs at `http://localhost:5173`

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `POST` | `/api/auth/verify-otp` | Verify account via email OTP |

### Events

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/events` | Public | List all events — supports `?search=` and `?category=` |
| `GET` | `/api/events/:id` | Public | Retrieve a single event |
| `POST` | `/api/events/create` | Admin | Publish a new event |
| `PUT` | `/api/events/:id` | Admin | Update event details |
| `DELETE` | `/api/events/:id` | Admin | Remove an event |

### Bookings

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings/send-otp` | User | Request booking confirmation OTP |
| `POST` | `/api/bookings` | User | Submit a new booking |
| `GET` | `/api/bookings/my` | User | Retrieve the caller's bookings |
| `GET` | `/api/bookings/all` | Admin | Retrieve every booking |
| `PUT` | `/api/bookings/:id/confirm` | Admin | Approve a booking request |
| `DELETE` | `/api/bookings/:id` | User / Admin | Cancel or reject a booking |

---

## How Booking Works

```
1. User opens an event → clicks "Confirm Registration"
2. Backend emails a 6-digit OTP to the user
3. User submits OTP → booking created with status "pending"
4. Admin reviews the request in the Admin Dashboard
5. Admin approves (paid/unpaid) or rejects the request
6. On approval  → seat count decremented, confirmation email sent
   On rejection → seat restored (if previously confirmed), cancellation email sent
```

---

## Granting Admin Access

New accounts default to the `user` role. Promote an account to `admin` directly via MongoDB:

```bash
mongosh
use eventora
db.users.updateOne({ email: "youremail@example.com" }, { $set: { role: "admin" } })
```

Or sign in with the pre-seeded admin account: `admin@eventora.com` / `password123`

---
