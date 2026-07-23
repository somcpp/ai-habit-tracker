# AI Habit Tracker

A modern, full-stack habit tracking application with AI-powered insights, personalized habit suggestions, and streak tracking.

## Features

- **Modern UI/UX**: Built with React and Tailwind CSS featuring glassmorphism, dynamic layouts, and a responsive design.
- **AI Coach**: Integrated with Gemini 2.5 Flash to provide personalized weekly reports, habit suggestions, and morning motivation based on your specific goals and struggles.
- **Habit Tracking**: Track daily habits, view historical completion heatmaps, and monitor your current and longest streaks.
- **Secure Authentication**: JWT-based authentication using HTTP-only cookies to ensure maximum security.
- **Full Stack**: Powered by a Node.js/Express backend and MongoDB.

## Tech Stack

### Frontend (Client)
- React
- Vite
- Tailwind CSS
- Axios
- Recharts (for data visualization)
- Lucide React (for icons)

### Backend (Server)
- Node.js
- Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Google Gen AI SDK (@google/genai)
- bcryptjs

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB URI (local or Atlas)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-habit-tracker
   ```

2. **Setup the Backend**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=8080
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:5173
   ```

3. **Setup the Frontend**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend Client**
   ```bash
   cd client
   npm run dev
   ```

### Seeding the Database (Optional)
If you want to populate the database with a demo user and mock data for the last 90 days:
```bash
cd server
npm run seed
```
You can then log in with `demo@example.com` and password `password123`.
