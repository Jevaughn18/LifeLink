
<img width="1440" height="778" alt="image" src="https://github.com/user-attachments/assets/aa0cc00b-8955-4c01-948e-4082a95a3c63" />





📖 Overview

A comprehensive healthcare patient management application that allows patients to easily register, book, and manage their appointments with doctors. Features include administrative tools for scheduling, confirming, and canceling appointments, email notifications, video consultations, AI-powered insights, and secure JWT-based authentication, all built using Next.js.

⚙️ Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, ShadCN UI
- **Database:** MySQL
- **Authentication:** JWT (jose library), HTTP-only cookies
- **Email:** Gmail SMTP (Nodemailer)
- **Video Calls:** Stream.io Video SDK
- **AI Integration:** Google Gemini (via OpenRouter)
- **API Integration:** Sagicor Intelligence Platform

🔋 Features

**Patient Features:**
- Register with email verification (6-digit code)
- Secure login with JWT authentication and 24-hour session persistence
- Book appointments with doctors at their convenience
- Schedule multiple appointments
- Receive email notifications for appointment confirmations and cancellations
- Video consultation capabilities

**Admin Features:**
- Dashboard to view and manage all scheduled appointments
- Confirm/schedule appointments with automated email notifications
- Cancel appointments with cancellation reason tracking
- Admin-only access protected by passkey authentication

**Security & Authentication:**
- JWT-based authentication with HTTP-only cookies
- Middleware-based route protection
- Secure session management (24-hour expiry)
- Password hashing with bcrypt
- Email verification system

**Additional Features:**
- Complete responsiveness across all device types and screen sizes
- AI-powered insights using Google Gemini
- Integration with Sagicor Intelligence Platform
- Video calling powered by Stream.io
- Clean code architecture with reusability and maintainability

🤸 Quick Start
Follow these steps to set up the project locally on your machine.

Prerequisites

Make sure you have the following installed on your machine:

Git
Node.js
npm (Node Package Manager)
Cloning the Repository

git clone git@github.com:Jevaughn18/LifeLink.git
cd lifelink
Installation

Install the project dependencies using npm:

npm install
Set Up Environment Variables

Create a new file named `.env` in the root of your project and add the following content:

```bash
# Admin Authentication
NEXT_PUBLIC_ADMIN_PASSKEY=your_admin_passkey_here

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_here

# MySQL Database Configuration
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=lifelink_db

# Gmail SMTP Configuration for Email Verification
# IMPORTANT: Use Gmail App Password, not your regular password
# To get an App Password:
# 1. Go to your Google Account settings
# 2. Security → 2-Step Verification (must be enabled)
# 3. App Passwords → Generate new app password
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# AI Integration - Gemini via OpenRouter
OPENROUTER_API_KEY_GEMINI=your_openrouter_api_key

# Sagicor API Integration
SAGICOR_API_KEY=your_sagicor_api_key

# Stream.io Video SDK
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Video Platform URL (where the video-platform Next.js app runs)
NEXT_PUBLIC_VIDEO_PLATFORM_URL=http://localhost:3001
```

Replace the placeholder values with your actual credentials:
- **MySQL:** Set up a local MySQL database named `lifelink_db`
- **Gmail:** Enable 2FA and generate an App Password from your Google Account
- **OpenRouter:** Sign up at [OpenRouter](https://openrouter.ai/) for Gemini API access
- **Stream.io:** Create an account at [Stream.io](https://getstream.io/) for video functionality
- **JWT_SECRET:** Generate a secure random string (e.g., using `openssl rand -hex 32`)

Database Setup

Set up your MySQL database:

```bash
# Create the database
mysql -u root -p
CREATE DATABASE lifelink_db;
```

The application will automatically create the required tables on first run.

Running the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

**Project Structure:**
- Main application runs on `http://localhost:3000`
- Patient Dashboard submodule (if applicable)
- Video platform runs on `http://localhost:3001` (separate Next.js app)


👨‍💻 Author

Name: Jevaughn Stewart

Role: Software/API Developer/Student, Computer Networks & Cyber Security (BSc) @ UTech Jamaica

LinkedIn: [https://www.linkedin.com/in/jevaughn-stewart-a71bb8294/]

GitHub: [https://github.com/Jevaughn18]


⚖️ License

This project is for educational and professional development purposes.
