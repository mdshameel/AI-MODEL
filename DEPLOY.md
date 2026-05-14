# AskAI — Deployment Guide

## Quick Share (Same Wi-Fi Network)
Your friend must be on the **same Wi-Fi** as you.
Run the server with:
```
python3 app.py
```
Then tell your friend to open: `http://192.168.0.111:5000`

---

## Deploy to Render (Free — works anywhere in the world)

1. **Create a free account** at https://render.com (no credit card needed)

2. **Push code to GitHub**
   ```bash
   cd /home/kali/.gemini/antigravity/scratch/flan-qa-app
   git init
   git add .
   git commit -m "Initial commit"
   # Create a new repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/askai-app.git
   git push -u origin main
   ```

3. **Deploy on Render**
   - Go to https://render.com → New → Web Service
   - Connect your GitHub repo
   - Set these settings:
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn app:app`
     - **Environment:** Python 3
   - Add **Environment Variable:**
     - Key: `HF_TOKEN`
     - Value: `your_huggingface_token_here`
   - Click **Create Web Service**

4. Render gives you a free URL like `https://askai-app.onrender.com` — share that link with anyone!

---

## Deploy to Railway (Alternative — also free)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add `HF_TOKEN` environment variable
4. Done — Railway auto-detects the Procfile
