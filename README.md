# AskAI — Intelligent Q&A Web App

A clean, minimalist web app that answers any question using **Qwen 2.5-7B-Instruct** via the Hugging Face Inference API.

![AskAI Screenshot](https://img.shields.io/badge/Flask-3.x-blue) ![Python](https://img.shields.io/badge/Python-3.8+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Features
- 💬 Chat-style interface with typing indicator
- ⚡ Powered by Qwen/Qwen2.5-7B-Instruct (via Featherless AI on Hugging Face)
- 🎨 Clean, professional UI — light theme with ink-blue accents
- 📱 Fully responsive
- 🔁 Suggestion chips to get started quickly

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/askai-app.git
cd askai-app
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set your Hugging Face token
Get a free token at https://huggingface.co/settings/tokens  
Enable **"Make calls to Inference Providers"** permission.

```bash
cp .env.example .env
# Edit .env and add your token
```

Or set it directly:
```bash
export HF_TOKEN=hf_your_token_here
```

### 4. Run the app
```bash
python3 app.py
```

Open http://localhost:5000 in your browser.

## Deploy to Render (Free)
See [DEPLOY.md](DEPLOY.md) for full deployment instructions.

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
