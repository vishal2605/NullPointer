# 🚀 Null Pointer – Online Coding Platform

Null Pointer is a full-stack online coding platform inspired by LeetCode, where users can log in, solve programming problems, and submit solutions in Java, Python, and C++. The platform is designed with scalability in mind using an asynchronous job queue and worker-based architecture.

---

## ✨ Features

- 🔐 Secure user authentication
- 🧠 Solve basic algorithm and problem-solving questions
- 💻 Multi-language support:
  - Java
  - Python
  - C++
- ⚙️ Asynchronous code execution using job queues
- 🧵 Worker nodes for isolated code compilation and execution
- 📊 Automated test case evaluation
- 🏗️ Scalable backend architecture

---

## 🛠️ Tech Stack

### Frontend
- Next.js

### Backend
- Node.js
- Express.js

### Database
- Prisma ORM
- PostgreSQL / MySQL

### Code Execution
- Job Queue Architecture
- Dedicated Worker Nodes

---

## 🧩 System Architecture
<img width="443" height="330" alt="image" src="https://github.com/user-attachments/assets/697d351a-54ea-47bc-b82e-0b938db6850c" />

## 🏗️ High-Level Overview

Null Pointer separates **code submission**, **code execution**, and **result evaluation** into independent components.  
This ensures scalability, fault tolerance, and a responsive user experience even under high load.

---

## 🔁 Architecture Flow

Browser
|
| User submits code
v
Main Backend (Express + Vert.x)
|
| Attach default + user code
| Persist submission state
v
PostgreSQL (via Prisma)
|
v
Judge Backend
|
v
Redis Job Queue
|
v
Worker Node
|
| Execute & validate code
v
Database (Update results)


---

## 🧩 Component Details

### 1️⃣ Browser (Client)
- Users write and submit solutions from the frontend (Next.js)
- Receives a `submissionId` after code submission
- Periodically **polls the backend** to fetch execution status and results

---

### 2️⃣ Main Backend (Express + Vert.x)
- Acts as the central API layer
- Responsibilities:
  - Accept user code submissions
  - Merge default boilerplate code with user-written code
  - Create and update submission records
  - Forward execution requests to the Judge backend
  - Serve polling APIs for submission status

---

### 3️⃣ Database (PostgreSQL + Prisma)
- Stores all persistent data:
  - Users
  - Problems
  - Submissions
  - Test case execution results
- Maintains submission lifecycle states:
  - `PENDING`
  - `RUNNING`
  - `SUCCESS`
  - `FAILED`
- Used by both backend and workers for coordination

---

### 4️⃣ Judge Backend
- Responsible for managing code execution requests
- Pushes execution jobs into a **Redis-based job queue**
- Does not execute code directly
- Enables horizontal scalability by decoupling execution from the API layer

---

### 5️⃣ Redis Job Queue
- Acts as a buffer between submission and execution
- Ensures:
  - Asynchronous processing
  - Backpressure handling
  - Fault tolerance
- Jobs are consumed by worker nodes independently

---

### 6️⃣ Worker Nodes
- Continuously poll the Redis queue for pending jobs
- Execute user code in isolated environments
- Compile and run code against predefined test cases
- Generate verdicts (Accepted / Wrong Answer / Runtime Error, etc.)
- Update submission status and test case results in the database

---

## 🔄 Polling-Based Status Updates

The platform uses **polling instead of webhooks or WebSockets**.

### Polling Flow
1. User submits code and receives a `submissionId`
2. Client periodically calls: GET /submissions/{submissionId}/status
3. 3. Backend fetches the latest status from the database
4. Polling continues until execution reaches a terminal state:
- `SUCCESS`
- `FAILED`

### Why Polling?
- Simpler frontend and backend implementation
- Avoids long-lived connections
- Easier to scale horizontally
- Works reliably across networks and browsers

---

## ✅ Architectural Benefits

- ⚙️ **Scalable** – Worker nodes can be added independently
- 🔒 **Secure** – Execution is isolated from core services
- 🧵 **Non-blocking** – API server remains responsive
- 🔁 **Reliable** – Queue ensures job durability
- 🧠 **Maintainable** – Clear separation of concerns

---

## 📌 Future Improvements

- Replace polling with WebSockets or Server-Sent Events (SSE)
- Add execution time and memory limits
- Improve sandboxing using Docker or Firecracker
- Introduce retry logic and dead-letter queues
- Add observability (logs, metrics, tracing)

---

## 📄 Notes

This architecture is optimized for learning, scalability, and interview readiness, while closely mirroring real-world online judge systems.

