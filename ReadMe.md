TECHSA Online Election System (TOES) 🗳️
The Official Digital Voting and Engagement Platform for the Technology Student Association (TECHSA).

TOES is a secure, real-time, mobile-ready election management system designed to modernize student democracy. It features a robust voting engine, a "Pay-to-Register" candidate portal, and an interactive live-stream chat for candidate manifestos.

🚀 Technical Stack
Backend: Ruby on Rails 7+ (API Mode)

Frontend: React.js 18+ (Mobile-first with Tailwind CSS)

Mobile Wrapper: Capacitor (iOS & Android support)

Real-time Services: ActionCable (WebSockets) & Redis

Database: PostgreSQL

File Storage: Active Storage (AWS S3/Cloudinary) for Candidate Photos

✨ Core Features
1. Candidate Lifecycle
Admin-Generated Keys: Unique payment-verified keys required for registration.

Self-Service Registration: Candidates upload bios, photos, and manifestos directly.

Manifesto Q&A: A "Catch-up" feature allowing students to ask candidates questions before voting starts.

2. The Voting Engine
One-Student-One-Vote: Strict identity verification to prevent double-voting.

Anonymized Ballots: Ensuring voter privacy while maintaining audit integrity.

Live Stream Chat: Real-time discussion boards for students to debate contestants.

3. Admin Command Center
Election Toggle: Global "Open/Close" switches for the voting window.

Live Analytics: Real-time voter turnout tracking and result visualization.

Key Management: Dashboard to generate and track candidate registration keys.

🛠️ Getting Started
Prerequisites
Ruby 3.2+

Node.js 18+

PostgreSQL

Redis (for ActionCable)

Backend Setup (Rails)
Navigate to /backend:

Bash
bundle install
rails db:create db:migrate
rails s -p 3001
Frontend Setup (React)
Navigate to /frontend:

Bash
npm install
npm start
Mobile Setup (Capacitor)
Build the web project:

Bash
npm run build
npx cap sync
Open in native IDE:

Bash
npx cap open ios    # For iOS (Requires Mac)
npx cap open android # For Android
📁 Project Structure
Plaintext
├── toes-backend/          # Rails API
│   ├── app/models/        # RegistrationKey, Candidate, Vote, Question
│   ├── app/channels/      # ActionCable Chat logic
│   └── db/migrate/        # Database schema history
├── toes-frontend/         # React Application
│   ├── src/components/    # Voting, Chat, and Registration UI
│   ├── src/hooks/         # Custom hooks for API calls
│   └── capacitor.config.ts # Mobile wrapper configuration
└── README.md
🛡️ Security Protocols
JWT Authentication: Secure token-based access for all students.

Atomic Transactions: Rails database transactions ensure votes are never lost or duplicated during high traffic.

Sanitization: Strict filtering of chat messages to prevent XSS and toxic behavior.

🤝 Contribution
This project is maintained by the TECHSA Executive Cabinet. For access to the Admin Dashboard or to report bugs, please contact the IT Officer.
