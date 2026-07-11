# 🏥 Validata — Clinical Research Platform

**Clinical Research & Measurement Validation Dashboard**  
*Real-time AI vs. Manual Measurement Validation for Clinical Studies*

⚠️ **Work in Progress** — This project is in active development. Features, structure, and design may evolve.

---

## 📋 Overview

**Validata** is a modern clinical dashboard and study management web application designed to track clinical participants, log medical measurements, and validate AI-based measurements against manual reference measurements (e.g., goniometers). 

Built for project **D-26-4-1 (Dorsiflexion Angle Measurement)** at Braude College, Validata specifically compares AI image-analysis angle measurements to goniometer reference values, providing researchers with real-time statistical validation and reliability metrics.

## ✨ Features

### 👥 Role-Based Study Management
- **Authentication & Authorization**: Secure, role-based access control separating **Mentors** (Study Admins) and **Team Members** powered by Supabase Auth.
- **Study Lifecycle**: Mentors can create, configure, and manage studies while setting active recruitment goals.

### 📝 Participant Tracking & Measurement Logging
- **Patient Cohort Management**: Add participants, track informed consent, demographics, and baseline health status.
- **Clinical Logging**: Record detailed joint angle measurements comparing **Goniometer** (Manual) vs. **AI** (Computer Vision) results, including validity toggles for outlier filtering.

### 📊 Advanced Statistical Analysis Dashboard
Real-time generation of advanced statistics and interactive visualizations:
- **Agreement Scatter Plot**: Visual comparison of AI vs. goniometer measurements.
- **Bland-Altman Plot**: Evaluates bias and limits of agreement between the two methods.
- **Error Distribution**: Error histograms and distribution curves.
- **Trend Analysis**: RMSE and MAE tracking over sessions.
- **Threshold Pass Rate**: Real-time pass/fail rates based on predefined clinical accuracy thresholds.

### 🌙 Modern UI & Theming
- **Dark/Light Mode**: Full theme support utilizing React Context and Tailwind CSS for a comfortable viewing experience in any clinical environment.

---

## 🗂️ Project Structure

```text
Validata/
├── validata-app/             # Main application (Next.js)
├── react-prototype/          # Early React prototype
├── Tutorial1/prototype/      # Initial learning prototype
├── B16_GROUP_part1_ER.docx   # Entity-Relationship diagram & requirements (Part 1)
└── diagram.md                # Architecture diagram
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Data Visualization** | Recharts |
| **Icons** | Lucide React |
| **AI Integration** | OpenAI API |

---

## 🚀 Getting Started

To run the Validata platform locally, ensure you have Node.js installed.

### 1. Clone & Install
```bash
cd validata-app
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Database and OpenAI keys (if applicable)
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
```

### 3. Run Development Server
```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🎓 Project Context

**Braude College of Engineering** — *Department of Electrical Engineering*
- **Project Code**: D-26-4-1 (Dorsiflexion Angle Measurement)
- **Project Advisor**: Dr. Einat Ravid

## 👥 Contributors

- [@ororbach](https://github.com/ororbach)
- [@liraztubul](https://github.com/liraztubul)
- [@adipeled1](https://github.com/adipeled1)
- [@shakedm341-lang](https://github.com/shakedm341-lang)
- [@ofir2207](https://github.com/ofir2207)

---
*"Validating the future of clinical AI measurements, one angle at a time."*
