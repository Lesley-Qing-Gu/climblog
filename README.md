# 🧗‍♀️ ClimbLog  
*A Future Web Service for Climbing Route Recording and Playful Analysis*  
Aalto University · CS-E4400 Design of WWW Services D · Autumn 2025

---

## 🎯 Overview
**ClimbLog** is a social and data-driven climbing companion that helps climbers **record, analyze, and share** their climbing sessions.  
The platform gamifies climbing progress and visualizes performance trends to make training more engaging and community-oriented.

Our goal is to create a **web-based interactive service** that combines **computer vision, real-time logging, and data visualization** to support climbers in improving their skills and celebrating achievements.

---

## ✨ Core Features

### 🧩 Route Detection (Planned)
- Uses a **Hold Detector ML model** (via Roboflow API) to identify holds from climbing wall photos.  
- Automatically detects routes and grades for session recording.

### 📊 Digital Logbook
- Allows climbers to log ascents with details like **difficulty, color, wall angle, attempts, and send status**.
- Generates personal statistics over time (e.g., grades climbed, sessions/week, success rate).

### 🏔️ Challenge Generator
- Creates climbing “missions” such as *Climb 3 blue routes in 20 minutes* or *Reach the height of Mount Fuji*.
- Uses mountain height data via external **Mountain APIs**.

### 🪶 Achievement & Gamification
- Unlock visual **badges** and milestones (e.g., “100 climbs completed”).
- Compare progress with friends.

### 🌐 Social & Sharing (Planned)
- Users can view leaderboards and share logs or routes publicly.
- Integration with community climbing gyms for route sync.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|---------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Firebase (Firestore, Auth, Cloud Functions) |
| Realtime | WebSockets |
| ML / CV | Roboflow Hold Detector API |
| Data APIs | Mountain API, optional OpenTopoData |
| Version Control | GitLab (Aalto instance) |

---