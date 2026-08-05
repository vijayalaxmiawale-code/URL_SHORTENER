# ✂️ URL Shortener

A full-stack URL shortening service with click analytics, custom aliases, expiry dates, and user authentication. Built with React, Node.js, Express, and MongoDB.

---

# Demo
Live demo: https://snipt-jet.vercel.app/

---

## ✨ Features

- 🔐 **User authentication** — Register, login, logout with JWT stored in secure httpOnly cookies
- ✂️ **URL shortening** — Generate short 8-character IDs using `nanoid`
- 🏷️ **Custom aliases** — Choose your own slug (e.g. `/my-portfolio`)
- ⏰ **Expiry dates** — Links automatically deactivate after a set date
- 🔛 **Toggle links** — Enable or disable any link without deleting it
- 📊 **Analytics dashboard** — Track clicks, browsers, operating systems, and devices per link
- 📱 **QR code generation** — Generate a QR code for any short link
- 🛡️ **Rate limiting** — Prevents abuse on the URL creation endpoint

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express 5 | Server and REST API |
| MongoDB + Mongoose | Database and ODM |
| `nanoid` | Collision-resistant short ID generation |
| `jsonwebtoken` | JWT creation and verification |
| `bcryptjs` | Password hashing |
| `ua-parser-js` | Parse browser, OS, device from User-Agent header |
| `express-rate-limit` | Rate limiting on URL creation |
| `cookie-parser` | Parse httpOnly auth cookies |

### Frontend
| Package | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| React Router v7 | Client-side routing |
| Axios | HTTP client with cookie support |
| Tailwind CSS v4 + DaisyUI | Styling |
| Recharts | Analytics charts |
| `qrcode.react` | QR code generation |
| `react-hot-toast` | Toast notifications |
| Lucide React | Icons |

---

## 📁 Project Structure

```
URL_Shortener/
├── backend/
│   ├── controllers/
│   │   ├── authController.js     # register, login, logout, getCurrentUser
│   │   └── urlController.js      # createUrl, getUserLinks, redirectUrl, analytics
│   ├── middleware/
│   │   └── verifyAuth.js         # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt pre-save hook)
│   │   └── Url.js                # URL schema with analytics subdocument
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   └── urlRoutes.js          # /api/urls/*
│   └── server.js                 # Entry point, DB connection, route mounting
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js          # Pre-configured Axios instance
        ├── context/
        │   └── AuthContext.jsx   # Global auth state via React Context
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── CreateLinkForm.jsx
        │   ├── LinkCard.jsx
        │   ├── QRCodeModal.jsx
        │   └── Sidebar.jsx
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Links.jsx
            ├── Analytics.jsx
            └── Profile.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0
PORT=5000
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

Start the backend:

```bash
npm run dev      # development (nodemon)
npm run start    # production
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the app

```
Frontend → http://localhost:5173
Backend  → http://localhost:5000
```

---

## 🌐 API Reference

### Auth routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login and receive auth cookie |
| `POST` | `/api/auth/logout` | No | Clear auth cookie |
| `GET` | `/api/auth/me` | Yes | Get current logged-in user |

### URL routes — `/api/urls`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/urls/shorten` | Yes | Create a new short URL |
| `GET` | `/api/urls/user-links` | Yes | Get all links for current user |
| `PUT` | `/api/urls/:id` | Yes | Update alias or expiry |
| `PATCH` | `/api/urls/:id/toggle` | Yes | Toggle link active/inactive |
| `DELETE` | `/api/urls/:id` | Yes | Delete a link |
| `GET` | `/api/urls/:id/analytics` | Yes | Get click analytics for a link |

### Public redirect

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/:shortId` | No | Redirect to original URL |

#### Example — Create short URL

**Request**
```json
POST /api/urls/shorten
{
  "originalUrl": "https://www.example.com/very/long/url",
  "customAlias": "my-link",
  "expiresAt": "2025-12-31T00:00:00.000Z"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "shortUrl": "http://localhost:5000/my-link",
    "shortId": "aB3xY7qZ"
  }
}
```

---

## 🔒 Security

- **JWT in httpOnly cookies** — tokens are inaccessible to JavaScript, preventing XSS-based theft
- **`sameSite: strict` cookies** — prevents CSRF attacks from cross-origin requests
- **bcrypt password hashing** — salt rounds = 10; plaintext passwords are never stored
- **`select: false` on password field** — password hash never included in query results by default
- **Rate limiting** — URL creation is limited to 10 requests per IP per 15 minutes
- **Reserved alias blocklist** — aliases like `admin`, `login`, `dashboard` cannot be used
- **URL format validation** — only valid `http://` or `https://` URLs are accepted

---

## 🔮 Planned Improvements

- [ ] Redis caching for redirect lookups (avoid DB hit for popular links)
- [ ] Async analytics writes via message queue (BullMQ) to avoid blocking redirects
- [ ] Geo-analytics — country and city from IP address
- [ ] Password-protected links
- [ ] Bulk URL creation via CSV upload
- [ ] Refresh token rotation (currently JWT has no revocation mechanism)
- [ ] SSRF protection — block internal IP ranges in `originalUrl`
- [ ] Link groups / folders

---

## 🤝 Contributing
- Fork the repository
- Create a feature branch: git checkout -b feature/your-feature-name
- Commit your changes: git commit -m 'feat: add your feature'
- Push to the branch: git push origin feature/your-feature-name
- Open a Pull Request


##  Author

**Shreya Shendkar**  
[GitHub](https://github.com/ShreyaShendkar/) 
