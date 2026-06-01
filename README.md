# 🚀 TaskFlow - Todo Management Dashboard

TaskFlow is a modern and responsive Todo Management Dashboard built using **React + Vite** for the frontend and **Flask** for the backend.

It helps users organize and manage tasks efficiently across different workflow stages like:

* ✅ To Do
* 🟡 In Progress
* 🟢 Done

---

# 📸 Dashboard Preview

![TaskFlow Dashboard](./dashboard.png)

---

# ✨ Features

* ✅ Add and manage tasks
* ✅ Organize tasks by task status
* ✅ Responsive and modern dashboard UI
* ✅ Progress tracking system
* ✅ Flask backend integration
* ✅ Save board functionality
* ✅ Simple and clean design

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* CSS

## Backend

* Python
* Flask
* Flask-CORS

---

# 📂 Project Structure

```bash
TodoApp-Updated/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── app.py
│   ├── data.json
│   └── venv/
│
├── dashboard.png
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/sweven-007/TodoApp-Updated.git

cd TodoApp-Updated
```

---

# 🔥 Backend Setup (Flask)

```bash
cd server

python3 -m venv venv

source venv/bin/activate

pip install flask flask-cors

python3 -m flask run --port 5001
```

Backend will run on:

```bash
http://127.0.0.1:5001
```

---

# 💻 Frontend Setup (React + Vite)

Open a new terminal:

```bash
cd client

npm install

npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

# 📖 How It Works

1. Users can create tasks.
2. Tasks are organized into:

   * To Do
   * In Progress
   * Done
3. Progress is tracked dynamically.
4. Flask backend manages task data.
5. React frontend communicates with backend APIs.


# 🎯 Future Improvements

* Drag and drop task management
* User authentication system
* Database integration
* Dark mode support
* Task reminders and deadlines

Developed by **Priyanshi Agarwal**
