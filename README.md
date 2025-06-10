# Airplane Booking API

A Node.js RESTful API for managing airplane bookings, user authentication (including Google OAuth), flight search, and user management. Built with Express, Sequelize, Passport, and JWT.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Booking](#booking)
  - [Flight](#flight)
  - [User](#user)
- [Environment Variables](#environment-variables)
- [Security & Best Practices](#security--best-practices)
- [Testing & Documentation](#testing--documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Learning Resources](#learning-resources)
- [License](#license)

## Features
- User registration and login (JWT-based)
- Google OAuth authentication
- Flight search and retrieval
- Booking creation, update, and cancellation
- User profile management
- Input validation and security best practices
- Modular, scalable architecture
- Ready for extension with advanced features (AI recommendations, loyalty, sustainability filters)

## Tech Stack
- Node.js
- Express.js
- Sequelize (PostgreSQL)
- Passport.js (Google OAuth)
- JWT for authentication
- Joi for validation
- Helmet, CORS, XSS protection
- Jest for testing (recommended)
- Swagger for API documentation (recommended)

## Getting Started
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd airplane-booking
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file with required variables (see below).
4. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `GET /auth/google` — Initiate Google OAuth login.
- `GET /auth/google/callback` — Google OAuth callback, returns JWT token.
- `POST /auth/login` — User login. Body: `{ email, password }`
- `POST /auth/register` — User registration. Body: `{ name, email, password }`

### Booking
- `GET /booking/` — List all bookings.
- `GET /booking/:id` — Get booking by ID.
- `POST /booking/` — Create a new booking. Body: `{ ...bookingData }`
- `PATCH /booking/:id` — Update a booking. Body: `{ ...fieldsToUpdate }`
- `DELETE /booking/:id` — Cancel a booking.

### Flight
- `GET /flight/search` — Search all flights (query params supported).
- `GET /flight/getone` — Get details of a specific flight (query params supported).

### User
- `PATCH /user/update` — Update user details. Body: `{ ...fieldsToUpdate }`
- `DELETE /user/delete` — Delete a user.
- `GET /user/get` — Get user details.

#### Example Request
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## Environment Variables
Create a `.env` file in the root directory with the following (example):
```
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
AUTH_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Security & Best Practices
- **JWT Authentication** for secure, stateless sessions.
- **Input Validation** using Joi to prevent malicious input.
- **Helmet** for HTTP header security.
- **CORS** configured for safe cross-origin requests.
- **XSS Protection** to prevent cross-site scripting attacks.
- **Centralized Error Handling** for consistent API responses.
- **Sensitive Data** managed via environment variables, never committed to source control.
- **Rate Limiting** (recommended) to prevent abuse.


## Testing & Documentation
- **Automated Testing:**
  - Use Jest (or Mocha) for unit and integration tests.
  - ```bash
    npm test
    ```
- **API Documentation:**
  - Swagger docs available at `/api-docs` (if configured).
  - Import the provided Postman collection for quick API testing.

> **Tip:** Writing tests and documenting endpoints are highly valued in professional environments!

## Deployment
- Deploy to Heroku, Vercel, AWS, etc.:
  - Set environment variables securely in your platform dashboard.
  - Push code to your remote repository.
  - Run migrations if needed:
    ```bash
    npm run migrate
    ```
- **CI/CD Integration:**
  - Recommended: Use GitHub Actions (or similar) for automated testing and deployment.

> **Tip:** Familiarize yourself with cloud deployment and CI/CD workflows—they’re essential skills for modern backend roles.

## Contributing
Contributions are welcome!
- Please see `CONTRIBUTING.md` for guidelines.
- For questions or support, open an issue or join our community chat.

## Learning Resources
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Passport.js Authentication](http://www.passportjs.org/)
- [JWT Explained](https://jwt.io/introduction)
- [API Security Essentials](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [Swagger/OpenAPI](https://swagger.io/)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)

> **Tip:** Keep learning and documenting your growth. Sharing your process on GitHub or LinkedIn can help you get noticed by employers!

## License
This project is licensed under the ISC License.

---
