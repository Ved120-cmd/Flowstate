<!-- 🧠🌿 FLOWSTATE README 🌿🧠 -->

<div align="center">

<h1 align="center">
  🌿 FlowState
</h1>

<h3>Smart Task & Energy Management Platform for Knowledge Workers</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/UI-Minimal%20%26%20Calm-purple?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,js,html,css,nodejs,express,mongodb,git" />
</p>

> 🚀 **FlowState** is a human-centered productivity platform that adapts tasks and suggestions based on a user’s **mental energy, focus level, and work patterns** — helping people stay productive **without burnout**.

</div>

---

## 🌿 Overview

Modern productivity tools focus on *output* — checklists, deadlines, and notifications — while ignoring **human cognitive limits**.  
This often leads to fatigue, burnout, and declining performance.

**FlowState** takes a different approach.

Instead of forcing productivity, it:
- 🧠 Respects mental energy
- 🔁 Adapts task flow dynamically
- 🌿 Encourages sustainable focus

The system analyzes **work velocity, idle time, and error patterns** to provide **gentle, context-aware guidance** that helps users work *with* their mind, not against it.

---

## 🧠 Core Features

| Feature | Description |
|------|-------------|
| 📋 Task Management | Create, update, and prioritize tasks |
| 🧩 Task Complexity Labels | Low / Medium / High cognitive load |
| ⚡ Work Velocity Tracking | Measures productivity using speed & errors |
| 🔋 Energy Level Indicator | Visual representation of mental energy |
| 🌿 Smart Nudges | Gentle suggestions instead of interruptions |
| 🔁 Adaptive Task Switching | Recommends lighter tasks when fatigue rises |
| ⏸ Break Suggestions | Suggests recovery breaks intelligently |
| 📊 Focus Analytics | Weekly insights into focus & burnout risk |

---

## 🧠 Psychology-Driven Design

FlowState is inspired by proven cognitive and behavioral science:

- **Cognitive Load Theory** → Minimal UI, reduced mental friction  
- **Nudge Theory** → Suggestions without force  
- **Self-Determination Theory** → User autonomy & control  
- **Attention Restoration Theory** → Calm visuals & whitespace  

> The goal is not to control users — but to **support better decisions at the right time**.

---

## ⚙️ Tech Stack

### Frontend
- React
- Vite
- HTML, CSS, JavaScript
- Minimal, calm UI design

### Backend
- Node.js
- Express.js
- MongoDB
- JWT-based authentication

### Intelligence Layer
- Rule-based behavior analysis
- Work velocity & energy estimation
- Context-aware decision logic

---

## 🗂️ Project Structure

```bash
FlowState/
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Dashboard & analytics pages
│   │   ├── styles/              # Global & page-level styles
│   │   ├── hooks/               # Custom React hooks
│   │   └── App.jsx
│   ├── package.json
│   └── package-lock.json
│
├── backend/
│   ├── server.js                # Express entry point
│   ├── routes/                  # API routes
│   ├── models/                  # MongoDB schemas
│   ├── middleware/              # Auth & request middleware
│   ├── utils/                   # Helper utilities
│   ├── .env
│   └── package.json
│
├── README.md
└── .gitignore
