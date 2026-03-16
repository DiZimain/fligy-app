import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib import error, request
from urllib.parse import parse_qs, urlparse


HOST = "127.0.0.1"
PORT = 8080
MODEL = "gemini-2.5-flash"
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
STATE_FILE = DATA_DIR / "fligy_state.json"
STATE_LOCK = Lock()


def read_json_body(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length) if length else b"{}"
    return json.loads(raw.decode("utf-8"))


def write_json(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def load_state_store():
    if not STATE_FILE.exists():
        return {}

    with STATE_FILE.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_state_store(payload):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with STATE_FILE.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def gemini_reply(message, context):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
      raise RuntimeError("Переменная окружения GEMINI_API_KEY не задана.")

    prompt = (
        "Ты краткий и практичный русскоязычный AI-коуч по продуктивности. "
        "Помогай пользователю выбрать следующий шаг, вернуть фокус и не перегружать себя. "
        "Отвечай структурно, коротко и конкретно."
    )

    payload = {
        "system_instruction": {
            "parts": [{"text": prompt}]
        },
        "contents": [{
            "parts": [{
                "text": json.dumps({
                    "message": message,
                    "context": context
                }, ensure_ascii=False)
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 700
        }
    }

    req = request.Request(
        url=f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key
        },
        method="POST"
    )

    with request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))

    candidates = data.get("candidates", [])
    if not candidates:
        raise RuntimeError("Gemini вернул пустой ответ.")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "\n".join(part.get("text", "") for part in parts if part.get("text"))
    if not text.strip():
        raise RuntimeError("Gemini не вернул текст ответа.")
    return text.strip()


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        parsed_url = urlparse(self.path)

        if parsed_url.path == "/api/health":
            write_json(self, 200, {"ok": True, "model": MODEL})
            return

        if parsed_url.path == "/api/state":
            client_id = parse_qs(parsed_url.query).get("client_id", [""])[0].strip()
            if not client_id:
                write_json(self, 400, {"error": "client_id_required"})
                return

            with STATE_LOCK:
                store = load_state_store()

            write_json(self, 200, {"state": store.get(client_id)})
            return

        if parsed_url.path == "/":
            self.path = "/fligy-mvp.html"

        return super().do_GET()

    def do_POST(self):
        parsed_url = urlparse(self.path)

        if parsed_url.path == "/api/state":
            try:
                payload = read_json_body(self)
                client_id = str(payload.get("clientId", "")).strip()
                state = payload.get("state")

                if not client_id:
                    write_json(self, 400, {"error": "client_id_required"})
                    return

                if not isinstance(state, dict):
                    write_json(self, 400, {"error": "state_object_required"})
                    return

                with STATE_LOCK:
                    store = load_state_store()
                    store[client_id] = state
                    save_state_store(store)

                write_json(self, 200, {"ok": True})
            except json.JSONDecodeError:
                write_json(self, 400, {"error": "invalid_json"})
            except Exception as exc:  # noqa: BLE001
                write_json(self, 500, {"error": "server_error", "details": repr(exc)})
            return

        if parsed_url.path != "/api/coach":
            write_json(self, 404, {"error": "not_found"})
            return

        try:
            payload = read_json_body(self)
            reply = gemini_reply(payload.get("message", ""), payload.get("context", {}))
            write_json(self, 200, {"reply": reply})
        except RuntimeError as exc:
            write_json(self, 500, {"error": str(exc)})
        except error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            write_json(self, exc.code, {"error": "gemini_http_error", "details": body})
        except error.URLError as exc:
            write_json(self, 502, {"error": "gemini_network_error", "details": repr(exc)})
        except Exception as exc:  # noqa: BLE001
            write_json(self, 500, {"error": "server_error", "details": repr(exc)})


def main():
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Momentum OS доступен на http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
