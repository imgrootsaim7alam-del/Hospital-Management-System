# 🏥 ApexCare Health - Hospital Management System (HMS)

Modern, production-ready Hospital Information & Management System built with **React 19, TypeScript, Tailwind CSS v4, and Firebase Firestore/Auth**.

---

## 🚀 How to Run in Visual Studio Code (Local Setup)

### 1️⃣ Prerequisites
Make sure you have **Node.js (v18 or v20+)** installed on your computer:
- Download Node.js from [nodejs.org](https://nodejs.org/) (LTS version recommended).

---

### 2️⃣ Open the Project in VS Code
1. Download or extract the project ZIP file to a folder on your computer.
2. Open **Visual Studio Code**.
3. Go to **File -> Open Folder...** and select this project root folder.

---

### 3️⃣ Install Dependencies
Open the VS Code integrated terminal (`Ctrl + ~` or **Terminal -> New Terminal**) and run:

```bash
npm install
```

---

### 4️⃣ Start the Local Development Server
Run the following command in the terminal:

```bash
npm run dev
```

Your app will start running instantly:
👉 Open your browser at: **`http://localhost:3000`** (or the URL shown in your terminal).

---

## 🛠️ Project Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on port 3000 |
| `npm run build` | Builds the production-ready static assets into `dist/` |
| `npm run preview` | Previews the compiled production build locally |
| `npm run lint` | Runs TypeScript type checking |

---

## 🔑 Firebase Cloud Backend Configuration

The Firebase configuration is already embedded in `src/firebase.ts` and connected to Google Cloud Firestore & Firebase Authentication. All user registrations, roles, patients, appointments, and vitals persist directly to Cloud Firestore.

---

## 👥 Features & Role Portals
- **Admin**: Hospital governance, staff management, department oversight, and cloud database monitor.
- **Doctor**: OPD appointment queues, patient clinical notes, and digital e-prescriptions.
- **Nurse**: Ward admissions, bed occupancy, and real-time patient vitals telemetry.
- **Receptionist**: Patient intake registration, doctor appointments, and billing & payment collection.
- **Patient**: Personal medical history, appointment bookings, doctor prescriptions, and invoices.
- **Live Hospital Chat**: Multi-user interactive chat for patients and healthcare staff.
