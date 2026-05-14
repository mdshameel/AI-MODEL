from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import requests
import os

load_dotenv()

app = Flask(__name__)

# ── API config ──────────────────────────────────────────────────────────────
HF_TOKEN = os.environ.get("HF_TOKEN", "")  # Set HF_TOKEN in your environment or .env file
HEADERS  = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}

# featherless-ai provider — confirmed working
API_URL = "https://router.huggingface.co/featherless-ai/v1/chat/completions"
MODEL   = "Qwen/Qwen2.5-7B-Instruct"


# ── Routes ──────────────────────────────────────────────────────────────────
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():
    question = request.form.get("question", "").strip()

    if not question:
        return jsonify({"answer": None, "error": "Please enter a question."})

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer questions clearly and concisely."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        "max_tokens": 300
    }

    try:
        resp = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        answer = data["choices"][0]["message"]["content"].strip()
        return jsonify({"answer": answer, "error": None})

    except requests.exceptions.Timeout:
        return jsonify({"answer": None, "error": "Request timed out. Please try again."})
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        if status == 401:
            return jsonify({"answer": None, "error": "Invalid API token."})
        if status == 403:
            return jsonify({"answer": None, "error": "Token missing 'Inference Providers' permission."})
        return jsonify({"answer": None, "error": f"API error ({status}). Please try again."})
    except (KeyError, IndexError):
        return jsonify({"answer": None, "error": "Unexpected response from model. Please try again."})
    except Exception as e:
        return jsonify({"answer": None, "error": str(e)})


if __name__ == "__main__":
    # host=0.0.0.0 makes it accessible on your local network
    app.run(host="0.0.0.0", port=5000, debug=True)
