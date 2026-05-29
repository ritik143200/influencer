# ViralMantrix

ViralMantrix is a creator campaign platform that helps brands collaborate with influencers, celebrities, city pages, meme pages, and digital communities. The website is built around one core workflow: a brand submits a campaign inquiry, the backend team matches that requirement with the right creator surfaces, and the collaboration moves forward from there.

## Product Overview

The public website introduces four main creator surfaces:

- Creator / Influencer
- City Pages
- Meme Pages
- Celebrity

Brands can land on the homepage, understand what the platform offers, review featured creator profiles, and submit a hiring inquiry. Creators can register, complete onboarding, connect their social links, and manage incoming collaboration activity. Admins manage approvals, filtering, submissions, featured profiles, and platform operations from the backend.

## Core Experiences

### Homepage

- Hero messaging focused on brand-to-creator campaign execution
- Featured profile carousel
- About section explaining the backend-managed connection flow
- Category overview for main and micro-category discovery
- Navigation for Home, Services, How It Works, Sign Up, and Hire Influencer

### Brand Inquiry Flow

- Name, phone, email, and password capture for new brand accounts
- One or multiple main category selections
- Dynamic micro-category selections based on chosen main categories
- Location, budget, timing, and requirement capture
- Backend-managed connection between brand and creator after submission

### Creator Onboarding

- Account creation flow
- Personal and professional details
- Dynamic category and micro-category selection
- Social media link collection
- Dashboard access after onboarding

### Dashboards

- Brand dashboard for campaign-side activity
- Creator dashboard for profile, inquiry, and collaboration management
- Admin dashboard for moderation, analytics, filtering, and operations

## Category System

The platform supports dynamic main categories and micro categories rather than fixed one-off form options.

Current main categories:

1. Creator / Influencer
2. City Pages
3. Meme Pages
4. Celebrity

The backend category directory is designed to support:

- multiple main-category selections
- dynamic micro-category rendering
- form reuse across creator onboarding and brand inquiry
- future admin-side filtering and analytics

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Context-based routing and auth flows
- Lucide React icons

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer and Cloudinary-based media handling

## Local Development

### Frontend

```bash
cd react-vite-tailwind
npm install
npm run dev
```

Default dev URL:

```text
http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Default API URL:

```text
http://localhost:5001
```

## Environment Variables

Typical backend variables include:

```text
MONGODB_URI=mongodb://localhost:27017/viralmantrix
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=development
SESSION_SECRET=your_session_secret
```

## Repository Structure

```text
react-vite-tailwind/
  src/
    components/
    contexts/
    data/
    hooks/
    pages/
    utils/

backend/
  config/
  controllers/
  data/
  middleware/
  models/
  routes/
  utils/
```

## Current Direction

The old artist-booking positioning is being transformed into a premium creator-economy product. The current redesign effort is focused on:

- aligning the public website with the provided prototype videos
- replacing old ArtistHub messaging with ViralMantrix language
- making the homepage and inquiry journey feel brand-first and creator-native
- keeping the architecture scalable for future campaign systems

## Notes

- The original codebase backup is preserved separately before the redesign continues.
- Local preview approval happens before any push, merge, or live deployment step.
