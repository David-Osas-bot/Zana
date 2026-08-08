# Zana
Zana is a minimal, high-performance project management web application built for fast team workflows. Designed with a premium black-and-white UI, Zana strips away enterprise clutter to focus on what matters: repos, 3-column Kanban boards, instant drag-and-drop updates, and secure email-based team collaboration. An ultra-lightweight, zero-bloat project management tool focused on speed, monochrome aesthetics, and seamless team collaboration.


## ✦ System Hierarchy

* **Repositories / Projects:** Top-level containers for organizing software or team initiatives.
* **Kanban Boards:** Every repository hosts a streamlined 3-column Kanban board:
  * `Not Done`
  * `Doing`
  * `Done`
* **Tasks:** Lightweight task cards residing inside columns that can be updated, assigned, and dragged in real-time.
* **Collaborators:** Project owners can invite existing or new team members via cryptographically signed email links.

---

## 🎨 Visual Philosophy

Zana uses a high-contrast, premium monochrome palette using Tailwind CSS `zinc` tokens:
* **Canvas:** `#000000` (Pure Black)
* **Surface Cards:** `#09090B` (Zinc-950)
* **Borders:** `#27272A` (Zinc-800)
* **Text & Accents:** High-contrast `#FFFFFF` and `#A1A1AA`

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React + Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Drag & Drop:** `@dnd-kit/core`
* **Authentication:** Firebase Client SDK

### Backend
* **Runtime:** Node.js + Express
* **Database:** MongoDB (Mongoose)
* **Auth Verification:** Firebase Admin SDK
* **Email Engine:** Resend API
* **Deployment:** Render (Backend API) / Vercel (Frontend)

---

## 📁 Repository Structure

zana/
├── client/          # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Kanban, Task Cards, Modals
│   │   ├── context/      # Firebase Auth State
│   │   └── lib/          # API Axios Client & Firebase Config
└── server/          # Node.js + Express API
    ├── src/
    │   ├── config/       # Database & Firebase Admin
    │   ├── middleware/   # Token Verification
    │   ├── models/       # Mongoose Schemas (User, Project, Task, Invite)
    │   └── routes/       # Auth, Project, Task & Invite APIs

---

## ⚡ Getting Started Locally

### 1. Prerequisites
* Node.js (v18+)
* MongoDB database instance
* Firebase Project (for Authentication)
* Resend API Key (for transactional invites)

### 2. Backend Setup
cd server
npm install

Create a `.env` file inside `server/`:
PORT=5000
MONGO_URI=your_mongodb_connection_string
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_json_config
RESEND_API_KEY=your_resend_api_key
CLIENT_URL=http://localhost:5173

Start the API server:
npm run dev

### 3. Frontend Setup
cd client
npm install

Create a `.env` file inside `client/`:
VITE_API_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id

Start the React dev server:
npm run dev

---

## 🔐 Core API Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/sync` | Sync Firebase authenticated user |
| `GET` | `/api/v1/projects` | Fetch user repositories |
| `POST` | `/api/v1/projects` | Create a new project repository |
| `POST` | `/api/v1/projects/:id/tasks` | Create a task inside a repository |
| `PATCH` | `/api/v1/tasks/:taskId/move` | Update task status & column position |
| `POST` | `/api/v1/projects/:id/invites` | Dispatch email invitation token |
| `POST` | `/api/v1/invites/accept` | Validate token and grant project membership |

---

## 📜 License
MIT © 2026 Zana Project
