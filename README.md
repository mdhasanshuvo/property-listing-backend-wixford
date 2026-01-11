# Property Listing Backend API

A simple REST API for managing property listings with agent and admin roles. Built with Node.js, Express, MongoDB, and JWT authentication.

## Live Deployment

🚀 **Production**: https://property-listing-backend-wixford.vercel.app
- **API Docs**: https://property-listing-backend-wixford.vercel.app/api-docs
- **Health Check**: https://property-listing-backend-wixford.vercel.app/health

## What It Does

This is a property listing API where:
- **Agents** can create, view, and manage their own properties
- **Admins** can view all properties and delete any property
- Properties support filtering, pagination, and search

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - Database library
- **JWT** - Authentication token
- **bcryptjs** - Password hashing
- **Swagger** - API documentation
- **Mocha + Chai** - Testing

## Quick Start

### 1. Setup

Clone the project and install dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory. Use `.env.example` as a template:

```
PORT=5000
MONGODB_URI=mongodb+srv://property-listing-backend:<password>@cluster0.0nnvi.mongodb.net/property-listing
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

Replace `<password>` with your MongoDB password.

### 3. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Local server runs on `http://localhost:5000`

### 4. Run Tests

```bash
npm test
```

## Deployment

This project is deployed on **Vercel** and auto-deploys on every push to main branch.

### Setting up Vercel Deployment

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel project settings:
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `NODE_ENV` - Set to `production`
3. Every push to `main` branch auto-deploys

View deployment: https://property-listing-backend-wixford.vercel.app

## API Overview

### Health Check
```
GET /health
```

### Authentication

**Register**
```
POST /api/auth/register
Body: { name, email, password, role: "agent" or "admin" }
```

**Login**
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Properties

**Get All Properties** (no auth required)
```
GET /api/properties
Query: ?page=1&limit=10&status=available&minPrice=100&maxPrice=1000&search=house
```

**Get Single Property** (no auth required)
```
GET /api/properties/:id
```

**Create Property** (agents only)
```
POST /api/properties
Header: Authorization: Bearer <token>
Body: { title, description, price, location, status }
```

**Update Property** (agents only - own properties)
```
PUT /api/properties/:id
Header: Authorization: Bearer <token>
Body: { title, description, price, location, status }
```

**Delete Property** (agents only - own properties, soft delete)
```
DELETE /api/properties/:id
Header: Authorization: Bearer <token>
```

**Delete Property by Admin** (admins only, any property)
```
DELETE /api/properties/admin/:id
Header: Authorization: Bearer <token>
```

## Authentication

Use JWT tokens in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

Tokens expire in 24 hours.

## Swagger Docs

View interactive API documentation:

```
http://localhost:5000/api-docs
```

## Project Structure

```
src/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js  # Auth logic
│   └── propertyController.js  # Property logic
├── middlewares/
│   └── auth.js            # JWT and role middleware
├── models/
│   ├── User.js            # User schema
│   └── Property.js        # Property schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   └── propertyRoutes.js  # Property endpoints
├── tests/
│   └── api.test.js        # Tests
├── app.js                 # Express app
└── server.js              # Server entry point
```

## Key Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access** - Different permissions for agents and admins
- **Soft Delete** - Properties marked as deleted, not removed from DB
- **Pagination** - Get properties in pages
- **Filtering** - Filter by status and price range
- **Search** - Search by title or location
- **Password Hashing** - Secure bcrypt hashing
- **Global Error Handler** - Consistent error responses

## How Properties Work

### Agent Workflow
1. Register as agent
2. Login to get token
3. Create properties with token in header
4. View all properties (public)
5. Update or delete own properties

### Admin Workflow
1. Register as admin
2. Login to get token
3. View all properties
4. Delete any property (hard delete via soft delete)
5. Cannot create properties (by design)

## Testing

The test suite includes:
- User registration with validation
- Login and token generation
- Property creation and access control
- Filtering and pagination
- Role-based access restrictions
- Soft delete functionality

Run tests with:
```bash
npm test
```

## Error Handling

All errors return consistent JSON response:

```json
{
  "error": "Error message",
  "status": 400
}
```

Common status codes:
- `400` - Bad request
- `401` - Unauthorized (missing token)
- `403` - Forbidden (no permission)
- `404` - Not found
- `500` - Server error

## Notes

- Properties are soft deleted (marked as deleted, not removed)
- Only agents can create properties
- Admins can only delete properties, not create them
- All timestamps are in UTC
- Database uses MongoDB Atlas (cloud)
