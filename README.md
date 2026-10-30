# 📚 Amba Library Management System

A high-performance modern web application for library seat and shift management, built with React, Vite, and Tailwind CSS.

---

## ✨ Features

- **50-Desk Live Interactive Matrix**: Visual seat layout with real-time status (Vacant, Occupied, On Hold).
- **Multi-Shift Scheduling**:
  - Morning Shift (06:00 AM – 10:00 AM)
  - Noon Shift (10:00 AM – 02:00 PM)
  - Evening Shift (02:00 PM – 06:00 PM)
  - Night Shift (06:00 PM – 10:00 PM)
  - Overnight Shift (10:00 PM – 06:00 AM)
  - Full Day Pass (All 4 Day Shifts)
- **Dynamic Multi-Shift Fee Engine**: Seamless fee calculation when adding or switching shifts.
- **Admin Control Terminal**:
  - Live Shift Request Queue (Hold / Orange -> Allot / Red workflow)
  - Fee Management & Quick Renewals
  - Financial Ledger & Visual Analytics
  - Dues Tracker with 1-Click WhatsApp Reminders
  - Student Directory & Admission Modal
- **Student Portal**:
  - Digital Library Pass & QR ID Card
  - Desk Availability & Instant Shift Requests
  - Fee Receipt Generation & Print Support
- **Feedback & Get in Touch**: Integrated direct contact system with Web3Forms.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ashu00414/Amba-Libary.git

# Navigate to project directory
cd Amba-Libary

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Storage**: Browser LocalStorage with State Synchronization
- **Animations**: CSS Transitions & Keyframes
