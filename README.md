# ✈️ Airplane Booking API

A secure, scalable RESTful API for airplane bookings, user authentication (JWT & Google OAuth), flight search, and user management. Built with Node.js, Express, Sequelize (PostgreSQL), and Passport.js.

---

## 🚀 Features
- User registration & JWT-based login
- Google OAuth integration
- Flight search & detailed retrieval (via AeroDataBox API)
- Booking creation, update (tier), and cancellation
- User profile management (get, update, delete)
- Input validation & security best practices
- Rate limiting, helmet, CORS, XSS protection
- Modular, extensible architecture

> **Note:**  
> Actual seat booking and payment is **not** supported since available airplane APIs do not provide real seat booking—only flight data.

---

## 🛠️ Tech Stack
- **Node.js** & **Express.js**
- **Sequelize** (PostgreSQL ORM)
- **Passport.js** (Google OAuth)
- **JWT** for authentication
- **Helmet**, **CORS**, XSS protection, rate limiting
- **Swagger** for API docs

---

## ⚡ Quick Start
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Airplane-Booking-System
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
    - Create a `.env` file in the root directory:
      ```env
      PORT=3000
      DATABASE_URL=your_postgres_connection_url
      AUTH_SECRET=your_jwt_secret
      AUTH_GOOGLE_ID=your_google_client_id
      AUTH_GOOGLE_SECRET=your_google_client_secret
      rapid_api_key=your_aerodatabox_key
      ```
4. **Start the server:**
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
