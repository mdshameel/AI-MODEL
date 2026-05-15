from flask import Flask, render_template, request, jsonify, Response
from dotenv import load_dotenv
import requests
import json
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

    payload["stream"] = True

    def generate():
        try:
            with requests.post(API_URL, headers=HEADERS, json=payload, stream=True, timeout=30) as resp:
                resp.raise_for_status()
                for line in resp.iter_lines():
                    if line:
                        decoded_line = line.decode('utf-8')
                        yield decoded_line + '\n\n'
        except requests.exceptions.Timeout:
            yield f'data: {json.dumps({"error": "Request timed out. Please try again."})}\n\n'
        except requests.exceptions.ConnectionError:
            yield f'data: {json.dumps({"error": "You are offline. Please check your internet connection."})}\n\n'
        except requests.exceptions.HTTPError as e:
            status = e.response.status_code
            if status == 401:
                yield f'data: {json.dumps({"error": "Invalid API token."})}\n\n'
            elif status == 403:
                yield f'data: {json.dumps({"error": "Token missing \'Inference Providers\' permission."})}\n\n'
            else:
                yield f'data: {json.dumps({"error": f"API error ({status}). Please try again."})}\n\n'
        except Exception as e:
            yield f'data: {json.dumps({"error": str(e)})}\n\n'

    return Response(generate(), mimetype='text/event-stream')


if __name__ == "__main__":
    # host=0.0.0.0 makes it accessible on your local network
    app.run(host="0.0.0.0", port=5000, debug=True)
