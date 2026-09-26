# 📚 Student Study Planner

A full-stack web application designed to help university students organize their studies, manage academic tasks and keep track of their workload.

This project was developed as part of my Computer Engineering studies and allowed me to work with a complete web development stack, including frontend development, backend APIs, databases and containerization.

---

## 🚀 Features

- Create and manage study tasks
- Organize academic activities
- Store and retrieve data from a PostgreSQL database
- Full-stack architecture with separate frontend and backend
- REST API communication between frontend and backend
- Docker-based development environment
- Persistent database storage

---

## 🛠️ Tech Stack

### Frontend

- React
- JavaScript
- Vite
- HTML
- CSS

### Backend

- Node.js
- Express
- REST API

### Database

- PostgreSQL

### DevOps & Tools

- Docker
- Docker Compose
- Git
- GitHub

---

## 🏗️ Architecture

The application follows a standard full-stack architecture:

```text
User
  │
  ▼
React Frontend
  │
  │ REST API
  ▼
Node.js + Express Backend
  │
  ▼
PostgreSQL Database
```

The frontend is responsible for the user interface and communicates with the backend through REST API requests.

The backend handles the application logic and database operations.

PostgreSQL is used for persistent data storage.

---

## 📸 Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Task Management

![Task Management](docs/screenshots/task-management.png)

### Completed Tasks

![Completed Tasks](docs/screenshots/completed-task.png)

## 📂 Project Structure

```text
student-study-planner
│
├── frontend/
│   └── React application
│
├── backend/
│   └── Node.js / Express API
│
├── docker-compose.yml
│
└── README.md
```

> The exact project structure may vary depending on the current version of the repository.



---

## ⚙️ Running the Project

### Requirements

Make sure you have installed:

- Node.js
- npm
- Docker
- Docker Compose

### Clone the repository

```bash
git clone https://github.com/ByCur/student-study-planner-sk1.git
cd student-study-planner-sk1
```

### Start with Docker

```bash
docker compose up
```

Docker Compose starts the services required by the application, including the backend and database.

---

## 🎓 What I Learned

This project gave me practical experience with:

- Building a complete full-stack application
- Creating REST APIs with Node.js and Express
- Connecting applications to a relational database
- Working with PostgreSQL
- Structuring frontend and backend components
- Using Docker and Docker Compose
- Managing source code with Git and GitHub
- Debugging communication between multiple services

---

## 🔮 Future Improvements

I plan to continue improving the project with features such as:

- User authentication
- Improved responsive interface
- Automated testing
- CI/CD using GitHub Actions
- Cloud deployment
- AI-assisted study planning
- Study recommendations based on workload and deadlines

---

## 👨‍💻 Author

**Pablo Pérez Arcas**

Computer Engineering student at the **University of Málaga (UMA)**  
Specialization in **Computing**

Expected graduation: **June 2027**

Interested in:

- Software Engineering
- Artificial Intelligence
- Full-Stack Development
- Blockchain

---

## 📄 Project Status

This project was originally developed as an academic project and is currently being improved as part of my software engineering portfolio.
