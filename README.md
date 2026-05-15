# AI-MODEL — Intelligent Q&A Web App

A clean, minimalist web app that answers any question using **Qwen 2.5-7B-Instruct** via the Hugging Face Inference API.

![AskAI Screenshot](https://img.shields.io/badge/Flask-3.x-blue) ![Python](https://img.shields.io/badge/Python-3.8+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Live Demo
You can try the live version here: [https://ai-model-whoh.onrender.com](https://ai-model-whoh.onrender.com)

## Features
- 💬 Chat-style interface with typing indicator
- ⚡ Powered by Qwen/Qwen2.5-7B-Instruct (via Featherless AI on Hugging Face)
- 🎨 Clean, professional UI — light theme with ink-blue accents
- 📱 Fully responsive
- 🔁 Suggestion chips to get started quickly

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/mdshameel/AI-MODEL.git
cd AI-MODEL
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set your Hugging Face token
Get a free token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)  
Enable **"Make calls to Inference Providers"** permission.

```bash
cp .env.example .env
# Edit .env and add your token
```

### 4. Run the app
```bash
python3 app.py
```

Open http://localhost:5000 in your browser.

## Deployment
This app is ready for deployment on **Render**, **Railway**, or **Vercel**. 
- See [DEPLOY.md](DEPLOY.md) for full deployment instructions.
- Ensure you set the `HF_TOKEN` environment variable on your hosting provider.

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | Python / Flask |
| AI Model | Qwen/Qwen2.5-7B-Instruct |
| Inference | Hugging Face Router (featherless-ai) |
| Frontend | Vanilla HTML, CSS, JS |
| Fonts | Inter + JetBrains Mono |

## License
MIT
