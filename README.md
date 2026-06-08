# 📊 Personal Finance Tracker

A premium, full-stack personal web application designed to help users track transactions, visualize net asset telemetry, organize historical budget records, and master long-term wealth growth goals. Built with a sleek, high-contrast modern fintech dark theme for data clarity.


# ⚡ Key Features

*   **Secure Authentication View:** Split-panel landing page with built-in custom input focus rings and error-shielded form tracking.
*   **Full Ledger CRUD Engines:** Real-time logging of incomes or expenses mapped instantly into active memory state arrays.
*   **Granular Financial Categories:** Built-in validation schema layers supporting core cash streams alongside newly expanded tags:
    *   *Income/Revenue:* Salary, Fixed Income, Gifts, Savings
    *   *Expense Streams:* Food, Self-Treat, Rent / Utilities, Groceries, Dine out / Order In, Investments
    *   *Fallback Engine:* Full backend integration fix for standard `Miscellaneous` and `Others` tagging.
*   **Time-Series Tracking:** Dedicated date-picker injection binding precise localized timestamps to every ledger node.
*   **Smart Monthly Filter Engine:** Dynamic client-side dropdown sorting that allows users to instantly view, calculate, and isolate logs by target months.

# 🛠️ Technology Stack

*   **Frontend:** HTML5, Modern CSS3 (Variables, Grid, Flexbox), Vanilla JavaScript (ES6+, Async/Await Fetch API)
*   **Visual Data Analytics:** Chart.js (Integrated visualization module engine)
*   **Backend Runtime:** Node.js, Express.js
*   **Database Management:** MongoDB via Mongoose Object Modeling

# 📁 Directory Map

personal-finance-tracker/
│
├── models/
│   └── Transaction.js      # Mongoose Schema Model (Updated with new Categories & Date fields)
│
├── public/                 # Static Asset Directory serving Middleware
│   ├── index.html          # Split-Screen Login Landing Panel Workspace
│   ├── register.html       # Standalone Secure Registration Card
│   ├── dashboard.html      # Central Metrics Dashboard & Dynamic Log View
│   ├── style.css           # Cohesive Fintech Dark Variable Stylesheet
│   └── app.js              # State Processing, DOM Mapping, & Filtering Engine
│
├── server.js               # Express Backend Runtime Server Configuration
├── package.json            # Node Dependencies Manifest
└── README.md               # Repository Documentation


# 📋 Prerequisites

*   **Node.js** (v16.x or higher) 
*   **npm** 
*   **MongoDB** use a local MongoDB Community Server installation or a cloud-based cluster connection string.
