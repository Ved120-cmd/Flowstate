<!-- 🧠🌿 DARK THEME README FOR FLOWSTATE 🌿🧠 -->

<div align="center">

<h1 align="center">
  <br/>
  🌿 FlowState
</h1>

<h3>Smart Task & Energy Management Platform for Knowledge Workers</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/ML-Behavior%20Analytics-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/UI-Minimal%20%26%20Calm-purple?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,js,html,css,nodejs,express,git" />
</p>

> 🚀 **FlowState** is a **human-centered productivity platform** that dynamically adapts tasks and suggestions based on a user’s **mental energy, focus, and work patterns** — helping people stay productive **without burnout**.

</div>

---

## 🌑 Overview

Modern knowledge workers often push through fatigue, leading to **burnout, errors, and reduced efficiency**.  
Traditional task managers treat productivity as static checklists and ignore **human energy limits**.

**FlowState** rethinks productivity by focusing on:
- 🧠 Cognitive energy instead of raw output
- 🔁 Adaptive task orchestration
- 🌿 Gentle, non-intrusive behavioral nudges

The system continuously analyzes **work velocity, idle time, and error patterns** to provide **context-aware guidance** that respects user autonomy.

---

## 🧠 Core Capabilities

| Feature | Description |
|------|-------------|
| 📋 Task Queue | Create and manage tasks in a prioritized workflow |
| 🧩 Task Complexity Labels | Classify tasks as Low / Medium / High cognitive load |
| ⚡ Work Velocity Engine | Calculates productivity using speed, idle time, and errors |
| 🔋 Energy Level Indicator | Real-time visual representation of mental energy |
| 🌿 Progressive Nudges | Non-blocking suggestions for breaks or task switching |
| 🔁 Adaptive Task Switching | Recommends lighter tasks when error rate increases |
| ⏸ Smart Break Suggestions | Suggests short recovery breaks during fatigue |
| 📊 Weekly Focus Analytics | Identifies peak focus hours and burnout risk zones |

---

## 🧠 Psychology-Driven Design

FlowState is built on proven cognitive and behavioral principles:

- **Cognitive Load Theory** → Minimal UI and simple visual indicators  
- **Nudge Theory** → Gentle guidance instead of forced interruptions  
- **Self-Determination Theory** → User choice and autonomy  
- **Attention Restoration Theory** → Calm design and whitespace  

> The goal is not to control users — but to **support better decisions at the right moment**.

---

## ⚙️ Tech Stack

| Layer | Technology |
|------|-----------|
| 💻 Frontend | HTML, CSS, JavaScript |
| 🎨 UI / UX | Minimalist design, soft color palettes |
| 🔥 Backend | Node.js + Express |
| 🧠 Intelligence Layer | Rule-based + behavior analytics |
| 📊 Analytics | Session-based metrics & summaries |
| 🗃️ Data | User sessions, task logs, performance signals |

---

## 🗂️ Project Structure

```bash
FlowState/
│
├── frontend/
│   ├── src/
│   │   ├── components/          # UI components (Tasks, Energy, Nudges)
│   │   ├── pages/               # Dashboard & Analytics views
│   │   ├── hooks/               # Work session & energy logic
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── server.js                # Express entry point
│   │
│   ├── intelligence/            # Intelligence Engine
│   │   ├── signals.js           # Collects raw signals (idle, task, energy)
│   │   ├── contextBuilder.js    # Builds situational snapshot
│   │   ├── decisionEngine.js    # Chooses continue / switch / break
│   │   ├── explanationEngine.js # Human-readable explanations + tone
│   │   └── counterfactualEngine.js # Anticipatory insights
│   │
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT authentication middleware
│   │
│   ├── models/
│   │   ├── ActivityLog.js       # Event-based activity tracking
│   │   ├── Energy.js            # Energy snapshots / levels
│   │   ├── Task.js              # Task management
│   │   ├── User.js              # User + preferences + auth
│   │   └── WorkSession.js       # Workday/session boundaries
│   │
│   ├── routes/
│   │   ├── auth.js              # OTP-based login & registration
│   │   ├── tasks.js             # Task CRUD
│   │   ├── activity.js          # Mouse / keyboard / error events
│   │   ├── idle.js              # Idle event logging
│   │   ├── meeting.js           # Meeting ON / OFF events
│   │   ├── session.js           # Session start / end
│   │   ├── energy.js            # Energy logging
│   │   └── analytics.js         # Aggregated insights
│   │
│   ├── utils/
│   │   ├── otp.js               # OTP generation
│   │   └── token.js             # Token helpers (if used)
│   │
│   ├── node_modules/
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── package.json
