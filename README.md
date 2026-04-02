# ZephyrMind

<div align="center">
  <p><strong>Your AI-powered empathetic companion for mental well-being and stress management.</strong></p>
</div>

![ZephyrMind Banner](https://via.placeholder.com/1200x400.png?text=ZephyrMind+-+Stress+Management+App) <!-- Replace with your actual banner/screenshot -->

## 🌟 Overview

ZephyrMind is a comprehensive stress management web application designed to help users track, understand, and reduce their daily stress levels. By combining an AI-powered conversational agent with visual mood tracking and guided wellness activities, ZephyrMind provides a safe, judgment-free space to improve mental well-being.

## ✨ Features

- 🤖 **Empathetic AI Companion**: Chat with ZephyrMind, your personal counselor, for rule-based and adaptive stress management guidance.
- 📊 **Visual Stress Dashboard**: Track your mood and stress levels over the past 7 days using our interactive area charts.
- 🧘 **Guided Breathing Exercises**: Built-in breathing exercises with visual cues to help ground you during moments of high stress.
- 📋 **Curated Wellness Tasks**: Evidence-based stress relief activities tailored to and filtered by your current stress level.
- 🎥 **Therapeutic Video Library**: Seamlessly discover and watch curated YouTube videos (with in-app playback) categorized by stress level.
- 📱 **Twilio Alerts**: Automated SMS notifications/alerts configured via the backend to assist users during critical times.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: TanStack Query (React Query)
- **Data Visualization**: Recharts
- **Routing**: Wouter

### Backend
- **Server**: Express.js (Node.js) & Python (FastAPI/Flask integration)
- **Data Storage**: In-memory storage (MemStorage)
- **APIs & Integrations**: REST APIs for entries and chats, Twilio API for SMS alerts

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed to run the application locally:
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3.x](https://www.python.org/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ZephyrMind.git
   cd ZephyrMind
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Rename `.env.example` to `.env` and fill in your configurations (e.g., Twilio credentials, API URLs).

5. **Run the Application:**
   From the `frontend` directory:
   ```bash
   # Starts both Vite frontend and Express server concurrently
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`.

## 📁 Key Project Structure

```
├── frontend/
│   ├── client/src/
│   │   ├── components/      # Reusable Shadcn UI components
│   │   ├── pages/           # Chatbot, Dashboard, Tasks, Videos, etc.
│   │   └── App.tsx          # Root file and routing
│   ├── server/              # Express backend endpoints & counselor logic
│   └── replit.md            # App design notes
├── backend/
│   ├── utils/
│   │   └── twilio_alert.py  # SMS alert service logic
│   └── main.py              # Python service entry
└── README.md                # You are here!
```

## 🎨 Color Theme & Design

The UI is built with a calming, therapeutic palette. The primary theme utilizes soft lavender and blue tones to promote a relaxing user experience, built with Tailwind CSS.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/ZephyrMind/issues) if you want to contribute.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built with ❤️ to support mental health.*
