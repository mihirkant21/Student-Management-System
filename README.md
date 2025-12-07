# Student Management System - Admin Portal

A modern web-based **Student Management System (Admin Portal)** built using **React (Vite + TypeScript)** and **Supabase** for backend database management. This system enables administrators to manage student records, departments, marks, attendance, and notices through a clean and responsive dashboard.

---

## 📌 Overview

This project is focused on digitizing university administration tasks and eliminating manual paperwork by providing a centralized platform for student academic data management. It includes CRUD features, modular components, and real-time database access using Supabase.

---

## ✨ Features

* Dashboard with system summary
* Add / Edit / Delete / View student details (CRUD)
* Search and filter students
* Manage academic departments and courses
* Marks & Attendance management
* Notice board management
* Fully responsive UI using Tailwind CSS
* Type-safe development with TypeScript

---

## 🛠 Tech Stack

| Layer              | Technology                      |
| ------------------ | ------------------------------- |
| Frontend           | React, Vite, TypeScript         |
| Styling            | Tailwind CSS                    |
| Backend / Database | Supabase (PostgreSQL + Storage) |
| Tools              | Git, GitHub, VS Code, npm       |

---

## 📁 Project Structure

```
student-management-system/
│── node_modules/
│── supabase/
│   └── migrations/
│── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│── .env
│── index.html
│── package.json
│── vite.config.ts
│── tsconfig.json
│── tailwind.config.js
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/student-management-system.git
```

### 2️⃣ Navigate to directory

```
cd student-management-system
```

### 3️⃣ Install dependencies

```
npm install
```

### 4️⃣ Setup Supabase Environment Variables

Create `.env` file:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5️⃣ Start development server

```
npm run dev
```

Open: `http://localhost:5173`

---

## 🧠 Database Structure (Supabase Tables)

| Table       | Description                      |
| ----------- | -------------------------------- |
| students    | Student personal & academic info |
| departments | Department list                  |
| courses     | Courses mapped to departments    |
| marks       | Internal and external marks      |
| attendance  | Presence status                  |
| notices     | University announcement board    |

---

## 📸 Screenshots (To be updated)

```
/ screenshots/dashboard.png
/ screenshots/student-list.png
/ screenshots/add-student.png
```

---

## 🔮 Future Enhancements

* Student / Faculty Login System
* Automated Notifications & Email alerts
* Fee Payment & Invoice Module
* Report generation (PDF / Excel)
* Deployment on Vercel + Supabase
* AI-based query assistant

---

## 👨‍💻 Author

**Mihirkant Pradhan**
B.Tech CSE, SRM University
---

## 🤝 Contributing

Pull requests are welcome. For major changes, create an issue first to propose modifications.

---

## 📝 License

This project is open-source and available under the **MIT License**.

---
