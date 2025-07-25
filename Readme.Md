# Aamira Courier Package Tracker

A real-time package tracking system for couriers, featuring a REST API backend, MongoDB persistence, and a React-based dashboard with live updates via Socket.IO. The system ingests courier updates, stores package history, displays active packages with location and ETA, and generates alerts for packages stuck for over 30 minutes.

**Live Demo**: [https://package-tracker-gamma.vercel.app/](https://package-tracker-gamma.vercel.app/)

---

## Features

* **Courier Updates (F1)**: REST API to ingest package status updates, with idempotency and out-of-order handling.
* **Persistent Storage (F2)**: MongoDB stores package state and event history, enabling reconstruction on restart.
* **Real-Time Dashboard (F3)**: React UI showing active packages, status, location, ETA, and event timelines, updated via Socket.IO.And also filtering and search implemented.
* **Stuck Package Alerts (F4)**: Alerts for packages not updated in >30 minutes, displayed in the dashboard.
* **Security (F5)**: Bearer token authentication for API endpoints.

---

## Tech Stack

* **Backend**: Node.js, Express, TypeScript, Prisma, MongoDB, Socket.IO, node-cron
* **Frontend**: React, TypeScript, Tailwind CSS, Leaflet (for maps)
* **Deployment**: Vercel (frontend), Railway (backend)

---

## Setup Instructions

### Prerequisites

* Node.js (v18 or higher)
* MongoDB (local or Atlas)
* npm

---

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/aamira-courier-tracker.git
cd aamira-courier-tracker/server

# Install dependencies
npm install
```

**Set up environment variables in `server/.env`:**

```
MONGODB_URI=mongodb+srv://yourname:password@cluster0.qxclpw1.mongodb.net/test?
API_TOKEN=aamira-secret-token
PORT=5000
```

```bash
# Generate Prisma client
npx prisma generate

# Run the backend
npm run dev
```

---

### Frontend Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install
```

**Set up environment variables in `client/.env`:**

```
VITE_BACKEND_URL=http://localhost:5000/api/v1
```

```bash
# Run the frontend
npm run dev
```

---

## Functional Requirements

### F1: Ingest Courier Updates

**Endpoint:** `POST /api/packages`
**Accepts JSON payloads:**

```json
{
  "package_id": "PKG12345",
  "status": "IN_TRANSIT",
  "lat": 39.7684,
  "lon": -86.1581,
  "timestamp": "2025-07-24T17:31:00Z",
  "note": "Departed Indy hub",
  "eta": "2025-07-24T19:00:00Z"
}
```

* **Idempotency**: Uses a SHA-256 eventHash (based on package\_id, status, timestamp) to prevent duplicate events (`server/src/services/packageService.ts`).
* **Out-of-Order Events**: Stores all events in `PackageEvent` but only updates `Package` current state if the event’s timestamp is newer than `last_updated`.
  **Choice**: Append to history but don’t roll back current state for stale events.

---

### F2: Persist State & History

* **Storage**: MongoDB with Prisma (`server/prisma/schema.prisma`)
* **Package**: Stores current state (`package_id`, `current_status`, `last_updated`, `lat`, `lon`, `note`, `eta`)
* **PackageEvent**: Stores all events for history reconstruction
* **Reliability**: Durable storage ensures no data loss on restart. Dashboard rebuilds via `getActivePackages` and `getPackageHistory` (`server/src/services/packageService.ts`)

**Implementation**: One-to-many relationship between `Package` and `PackageEvent` allows full history tracking.

---

### F3: Dispatcher Dashboard (Real-Time View)

* **UI**: React dashboard (`client/src/components/PackageList.tsx`) lists active packages (not DELIVERED or CANCELLED, last 24 hours) with `package_id`, `current_status`, time since update, location, and ETA (`—` if unavailable).
* **Detail View**: `PackageDetail.tsx` shows chronological event timeline and a Leaflet map (centered on Indianapolis: 39.7684, -86.1581 if no location).
* **Real-Time Updates**: Socket.IO (`server/src/app.ts`, `client/src/hooks/useSocket.ts`) pushes updates to the dashboard within 5 seconds (`packageUpdate` and `alert` events).

**Implementation**: `getActivePackages` fetches active packages; Socket.IO ensures real-time updates without reload.

---

### F4: Stuck-Package Alerting (>30 Minutes)

* **Logic**: Alerts generated for active packages not updated for >30 minutes (`server/src/services/alertService.ts`)

**Implementation:**

* Immediate check on package creation/update (`createPackageEvent`)

* `setTimeout` checks exactly 30 minutes after update

* `node-cron` runs every 30 minutes (`*/30 * * * *`) for ongoing checks

* **Alert Storage**: Stored in `Alert` model (`server/prisma/schema.prisma`) and displayed in `AlertBanner.tsx`

* **Spam Prevention**: Creates new alert only if none unresolved; updates existing alert every 30 minutes if still stuck.
  **Choice**: Re-alert every 30 minutes.

> **Trade-Off**: 30-minute cron may delay subsequent alerts up to 29 minutes; mitigated by `setTimeout` for first check.

---

### F5: Basic Security / Access Control

* **Implementation**: Bearer token authentication (`Authorization: Bearer aamira-secret-token`) enforced by `authMiddleware` (`server/src/middleware/auth.ts`)
* **Configuration**: Set `API_TOKEN=aamira-secret-token` in `server/.env`. Include token in API request headers.
* **Scope**: Protects all `/api/packages/*` endpoints.

---

## Project Structure

### Backend Structure

For Backend I followed a modular structure:

```
server/
├── src/
│   ├── services/       # Business logic for package updates and alerts
│   ├── routes/         # API routes for package updates
│   ├── models/         # TypeScript interfaces for package data
│   ├── app.ts          # Main Express application setup
│   └── server.ts       # Entry point for the backend server
├── prisma/
│   └── schema.prisma   # Schema for MongoDB models
```

---

### Frontend Structure

For Frontend I used a component-based structure:

```
client/
├── hooks/              # Custom hooks (e.g., useSocket)
├── types/              # Shared TypeScript types
├── components/         # React components (e.g., PackageList, AlertBanner)
├── lib/                # Utility functions
├── pages/              # Page-level components for routing
```


Here's the **converted and properly formatted version** of your `### Assumptions` section for GitHub (without changing any text), using a Markdown list for better clarity:

---

### Assumptions

* Out-of-order events are stored but don't update current state if older than the latest event.
* ETA is provided by couriers; no computation implemented.
* Alerts are logged to MongoDB and displayed in the dashboard; checks start immediately after package creation/update with a `setTimeout` at 30 minutes and periodic `node-cron` checks every 30 minutes.
* Simple Bearer token for API security (sufficient for internal use).

---





