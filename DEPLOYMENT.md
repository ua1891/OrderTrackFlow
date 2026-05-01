# TrackFlow — Deployment Guide

This guide covers deploying TrackFlow with:
- **Frontend** on [Vercel](https://vercel.com)
- **Backend** on [Render](https://render.com)
- **Database** on Render PostgreSQL (Free Tier)

---

## Prerequisites
- Code pushed to a GitHub repository
- A Render account (free) → [render.com](https://render.com)
- A Vercel account (free) → [vercel.com](https://vercel.com)

---

## Step 1 — Create PostgreSQL Database on Render

1. Log in to Render → Click **"New +"** → Select **"PostgreSQL"**
2. Set name to `trackflow-db`, choose the Free plan
3. Click **"Create Database"**
4. Copy the **"External Database URL"** — you'll need this in Step 2

---

## Step 2 — Deploy Backend on Render

1. Render → **"New +"** → **"Web Service"** → Connect your GitHub repo
2. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
3. Add all **Environment Variables** from `backend/.env.example`
   - Set `DATABASE_URL` to the PostgreSQL URL from Step 1
   - Leave `FRONTEND_URL` blank for now
4. Click **"Create Web Service"**
5. Copy your backend URL (e.g. `https://trackflow-backend.onrender.com`)

---

## Step 3 — Deploy Frontend on Vercel

1. Vercel → **"Add New Project"** → Import your GitHub repo
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Output Directory:** `dist`
3. Add **Environment Variable:**
   - `VITE_API_URL` = your Render backend URL from Step 2
4. Click **"Deploy"**
5. Copy your Vercel URL (e.g. `https://trackflow-xyz.vercel.app`)

---

## Step 4 — Connect Frontend URL to Backend

1. Go back to Render → your backend service → **"Environment"** tab
2. Set `FRONTEND_URL` = your Vercel URL from Step 3
3. Save — Render will redeploy automatically

---

## Verification Checklist

- [ ] Signup page loads on Vercel URL
- [ ] Account creation works & confirmation email arrives
- [ ] Login works and dashboard loads
- [ ] Orders can be added with a TCS tracking number
- [ ] Alerts appear when order status changes

---

## Keep Backend Awake (Render Free Tier)

Render free services sleep after 15 minutes of inactivity. To prevent this during testing:

1. Go to [uptimerobot.com](https://uptimerobot.com) → Create free account
2. Add a new **HTTP(S)** monitor
3. URL: your Render backend URL
4. Interval: **14 minutes**

This keeps the server awake 24/7 while testing.
