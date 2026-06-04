# CommerceOS — Implementation Plan

**AI-Powered Multi-Business SaaS eCommerce Platform**

## Goal

Build a full-stack, scalable, responsive, and modern AI-powered multi-business eCommerce and inventory management platform using the MERN stack (Next.js, Node.js, Express.js, MongoDB). The platform supports **Super Admins**, **Business Admins**, and **Customers**, with dynamic CSV imports, AI integrations, and Razorpay payments.

## Architecture (approved defaults)

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| UI components | Shadcn UI / Aceternity UI (planned) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + RBAC |
| Storage | Cloudinary or AWS S3 (planned) |
| AI | OpenAI API (mock fallback active) |
| Payments | Razorpay (mock fallback active) |
| Hosting | Vercel (frontend), Render/Railway (backend) |
| Repo layout | **Turborepo monorepo** — `apps/frontend`, `apps/backend` |

## Project structure

```
commerceos/
├── apps/
│   ├── frontend/          # Next.js storefront & dashboards
│   └── backend/           # Express REST API
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── services/      # AI, payments (extensible)
├── packages/              # Shared types/utils (future)
├── turbo.json
└── package.json
```

## Database schema

### User

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| email | String | Unique |
| password | String | Hashed |
| role | Enum | `super_admin`, `business_admin`, `customer` |
| businessId | ObjectId | Ref Business (admins) |
| isActive | Boolean | Default true |

### Business

| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| slug | String | Unique URL key |
| ownerId | ObjectId | Ref User |
| plan | Enum | free, starter, growth, enterprise |
| status | Enum | active, suspended, pending |

### Store

| Field | Type | Notes |
|-------|------|-------|
| businessId | ObjectId | Ref Business |
| name, slug | String | Unique per business |
| isPublished | Boolean | Public storefront |
| theme | Object | Colors, branding |

### Product

| Field | Type | Notes |
|-------|------|-------|
| businessId | ObjectId | Tenant scope |
| storeId | ObjectId | Ref Store |
| name, sku, quantity, price, category, imageUrl | | CSV import supported |

### Sale, Order

Existing models retained; scoped by `storeId`.

## Open questions (defaults in use)

| Question | Decision |
|----------|----------|
| Monorepo vs separate repos? | **Monorepo** (Turborepo) |
| OpenAI API key ready? | **Mock AI** until `OPENAI_API_KEY` is set; Gemini optional |
| Razorpay credentials? | **Mock payments** until keys are configured |

## Phase roadmap

### Phase 1 — Foundation (current)

- [x] Turborepo monorepo
- [x] Backend migrated with multi-tenant models
- [x] RBAC roles and business creation API
- [x] AI service abstraction (OpenAI + mock)
- [x] Payment mock endpoints
- [x] Next.js marketing landing page

### Phase 2 — Dashboards & auth UI

- [ ] Next.js auth pages (login/register)
- [ ] Super Admin panel
- [ ] Business Admin dashboard (products, CSV upload, analytics)
- [ ] Customer storefront per store slug

### Phase 3 — Integrations

- [ ] Shadcn UI component library
- [ ] Cloudinary/S3 uploads
- [ ] Live Razorpay checkout
- [ ] OpenAI customer support widget

### Phase 4 — Production

- [ ] MongoDB Atlas + env secrets
- [ ] Vercel + Render deployment
- [ ] E2E tests and CI

## API endpoints (implemented)

```
GET  /health
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
POST /api/businesses
GET  /api/businesses/me
GET  /api/businesses          (super_admin)
POST /api/products/upload
GET  /api/products
POST /api/agent/chat
POST /api/payments/create-order
POST /api/payments/verify
```

Legacy inventory routes (`/api/sales`, `/api/orders`) remain available from the previous InventoryOS build.
