# ✈️ Airplane Booking API

A modern, secure, and scalable RESTful API for airplane bookings, user authentication (including Google OAuth), flight search, and user management. Built with Node.js, Express, and PostgreSQL.

---

## 🚀 Features
- User registration & JWT-based login
- Google OAuth integration
- Flight search & detailed retrieval
- Booking creation, update, and cancellation
- User profile management
- Robust input validation & security best practices
- Modular, extensible architecture
- Ready for advanced features (AI recommendations, loyalty, sustainability filters)

## 🛠️ Tech Stack
- **Node.js** & **Express.js**
- **Sequelize** (PostgreSQL ORM)
- **Passport.js** (Google OAuth)
- **JWT** for authentication
- **Joi** for validation
- **Helmet**, **CORS**, XSS protection
- **Jest** for testing
- **Swagger** for API docs

## ⚡ Quick Start
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd airplane-booking
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Create a `.env` file in the root directory:
     ```env
     PORT=3000
     DB_HOST=localhost
     DB_USER=your_db_user
     DB_PASS=your_db_password
     DB_NAME=your_db_name
     AUTH_SECRET=your_jwt_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
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
- `POST /auth/login` — User login `{ email, password }`
- `POST /auth/register` — User registration `{ name, email, password }`

### Booking
- `GET /booking/` — List all bookings
- `GET /booking/:id` — Get booking by ID
- `POST /booking/` — Create a new booking
- `PATCH /booking/:id` — Update a booking
- `DELETE /booking/:id` — Cancel a booking

### Flight
- `GET /flight/search` — Search flights (query params)
- `GET /flight/getone` — Get flight details (query params)

### User
- `PATCH /user/update` — Update user details
- `DELETE /user/delete` — Delete a user
- `GET /user/get` — Get user details

#### Example: Login Request
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

---

## 🔒 Security & Best Practices
- **JWT Authentication** for secure, stateless sessions
- **Input Validation** with Joi
- **Helmet** for HTTP header security
- **CORS** for safe cross-origin requests
- **XSS Protection**
- **Centralized Error Handling**
- **Sensitive Data** via environment variables
- **Rate Limiting** (recommended)

---

## 🧪 Testing & Documentation
- **Automated Testing:**
  - Run all tests:
    ```bash
    npm test
    ```
- **API Documentation:**
  - Interactive Swagger docs at [`/api-docs`](http://localhost:3000/api-docs)
  - Import the provided Postman collection for quick API testing

---

## 🤝 Contributing
We welcome contributions!
- See `CONTRIBUTING.md` for guidelines
- For questions/support, open an issue or join our community chat

---

## 📖 Learning Resources
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Passport.js Authentication](http://www.passportjs.org/)
- [JWT Explained](https://jwt.io/introduction)
- [API Security Essentials](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [Swagger/OpenAPI](https://swagger.io/)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)


---

