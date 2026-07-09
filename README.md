# Python & React Full-Stack ATM Simulation

An enterprise-grade, self-service ATM simulation built with a high-performance **Python (FastAPI)** backend and a clean, interactive **React (Vite)** graphical user interface. 

This project simulates a modern cash recycler/micro-branch environment, moving away from simple single-account terminal logic into a connected multi-account ecosystem with built-in security controls.

---

## 🚀 Features

### Backend (Banking Core)
* **Multi-Account Routing:** Supports cards linked to multiple accounts simultaneously (e.g., Checking and Savings).
* **Security & Fraud Prevention:** Card automatically locks out after 3 consecutive failed PIN attempts to prevent brute-force attacks.
* **Hardware Dispensation Logic:** Validates and simulates physical currency delivery in standard ATM denominations ($10, $20, $50, $100).
* **RESTful API Architecture:** Robust error handling, auto-serialization, and CORS configuration enabled for frontend communication.

### Frontend (User Interface)
* **Dynamic ATM UI:** Retro machine-style CSS theme with adaptive state-based routing screens (Login -> Main Menu -> Transaction Control).
* **Real-Time Synchronized Ledgers:** Instant balance reflections upon successful deposits or withdrawals.
* **Session Management:** Securely drops session data and returns the user to the card insertion screen upon card ejection.

---

## 📂 Project Structure

```text
atm-project/
├── backend/
│   ├── main.py              # FastAPI server & banking logic
│   └── requirements.txt     # Python application dependencies
└── frontend/
    ├── package.json         # Node.js project configurations & scripts
    └── src/
        ├── main.jsx         # React application entry point
        ├── App.jsx          # ATM interface & state engine
        └── App.css          # Terminal/Machine component styling