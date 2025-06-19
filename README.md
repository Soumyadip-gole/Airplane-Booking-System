# ✈️ SkyBook – Airplane Booking System

SkyBook is a comprehensive flight booking platform that mimics a real-world travel site. It allows users to search for flights, manage bookings, and view their booking history through a robust backend API and a responsive, user-friendly frontend.

---

## 🏁 Getting Started – Run SkyBook on Your Device

Follow these steps to run both the backend API and the frontend on your machine:

### 1. Clone the Repository

```bash
git clone https://github.com/Soumyadip-gole/Airplane-Booking-System.git
cd Airplane-Booking-System
```

### 2. Set Up the Backend

1. Navigate to the backend folder:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory and configure your environment variables:
   ```env
   PORT=3000
   DATABASE_URL=your_postgres_connection_url
   AUTH_SECRET=your_jwt_secret
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   rapid_api_key=your_aerodatabox_key
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend API will run by default at [http://localhost:3000](http://localhost:3000).

### 3. Set Up the Frontend

> **Note:** If you only want to try the app, you can use the hosted frontend at:  
> **[SkyBook Frontend (Live)](https://skybook-smj0.onrender.com)**

If you want to run the frontend locally (if source is present in repo):

1. Navigate to the frontend folder (if available in repo):
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend typically runs at [http://localhost:5173](http://localhost:5173) or as specified.

---

## 🌐 Live Demo

- **Frontend:** [https://skybook-smj0.onrender.com](https://skybook-smj0.onrender.com)
- **API (Backend):** [https://airplane-booking-system.onrender.com/](https://airplane-booking-system.onrender.com/)

---

## 🚀 Features

- User registration & JWT-based login
- Google OAuth integration
- Flight search & detailed retrieval (via AeroDataBox API)
- Booking creation, update (tier), and cancellation
- User profile management (get, update, delete)
- Responsive frontend UI for search, booking, and history
- Input validation & security best practices
- Rate limiting, helmet, CORS, XSS protection
- Modular, extensible architecture

> **Note:**  
> Actual seat booking and payment is **not** supported since available airplane APIs do not provide real seat booking—only flight data.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, TypeScript, CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL (via Sequelize ORM)
- **Authentication:** JWT, Passport.js (Google OAuth)
- **API Documentation:** Swagger/OpenAPI

---

## ⚡ Quick Start (Backend API)

1. **Clone and install dependencies** (see above)
2. **Configure `.env`** (see above)
3. **Run server:**  
   ```bash
   npm start
   ```

---

## 📚 API Overview

### Authentication

- `GET /auth/google` — Start Google OAuth login
- `GET /auth/google/callback` — Google OAuth callback (returns JWT)
- `POST /auth/login` — User login (`{ email, password }`)
- `POST /auth/register` — User registration (`{ name, email, password, number? }`)

### Booking (**requires JWT**)

- `GET /booking/` — List all bookings for user
- `GET /booking/:id` — Get booking by ID
- `POST /booking/` — Create a new booking
- `PATCH /booking/:id` — Update booking (only tier)
- `DELETE /booking/:id` — Cancel booking (sets `status: cancelled`)

### Flight (public)

- `GET /api/flights/search` — Search flights  
  **Query/body:** `{ from, fromLocal, to, toLocal }`
- `GET /api/flights/searchone` — Get flight details  
  **Query/body:** `{ id, date }`

### User (**requires JWT**)

- `PATCH /user/update` — Update user details (`{ name?, email?, number?, password? }`)
- `DELETE /user/delete` — Delete user account
- `GET /user/get` — Get user details

---

### Example: Login Request

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Example: Flight Search

```bash
curl -X GET http://localhost:3000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{"from":"DEL","fromLocal":"2025-07-01T00:00","to":"BOM","toLocal":"2025-07-01T23:59"}'
```

---

## 🔒 Security

- JWT authentication (stateless, secure)
- Input sanitization (XSS middleware)
- Helmet (HTTP security headers)
- CORS enabled
- Rate limiting (100 req/15 min)
- Sensitive data via `.env`

---

## 📖 API Documentation

- Interactive Swagger docs at [`/api-docs`](http://localhost:3000/api-docs)

---

## 🚫 Not Supported

- No real seat booking or payment (APIs do not provide seat-level booking)
- Only flight data and record-keeping of bookings

---

## 🤝 Contributing

- PRs/issues welcome!
- For questions/support, open an issue

---

## 📚 Learning Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Passport.js Authentication](http://www.passportjs.org/)
- [JWT Explained](https://jwt.io/introduction)
- [Swagger/OpenAPI](https://swagger.io/)
