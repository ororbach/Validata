# Validata

Validata is a modern clinical dashboard and study management application built with **Next.js** and **Supabase**. It is designed to track clinical participants, log measurements (comparing manual goniometer readings vs. AI models), and generate real-time statistical analyses (including RMSE, MAE, Bland-Altman plots, and pass rates).

## Features

- **Authentication & Authorization**: Role-based access control (Mentors vs. Team Members) powered by Supabase Auth.
- **Study Management**: Mentors can create and manage studies, setting recruitment goals.
- **Participant Tracking**: Add participants, track their consent, demographics, and health status.
- **Measurements Logging**: Record joint angle measurements (Goniometer vs. AI), including validity toggles.
- **Statistical Analysis**: Real-time generation of advanced statistics and visualizations.
- **Dark/Light Mode**: Full theme support utilizing React Context and Tailwind CSS.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## Creators

- [@ororbach](https://github.com/ororbach)
- [@liraztubul](https://github.com/liraztubul)
- [@adipeled1](https://github.com/adipeled1)
- [@shakedm341-lang](https://github.com/shakedm341-lang)
- [@ofir2207](https://github.com/ofir2207)
