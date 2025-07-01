from locust import HttpUser, task, between
from random import choice

class ChatbotUser(HttpUser):
    wait_time = between(1, 2)  # Simuliert realistische Wartezeiten zwischen Anfragen

    prompts = [
        {
            "prompt": "Wie ist der Status meiner Bestellung?",
            "expected_keywords": ["status", "bestellung"]
        },
        {
            "prompt": "Was ist meine letzte Bestellung?",
            "expected_keywords": ["letzte", "bestellung"]
        },
        {
            "prompt": "Wo ist meine Bestellung 001?",
            "expected_keywords": ["bestellung", "001"]
        }
    ]

    @task
    def send_prompt(self):
        test_case = choice(self.prompts)
        prompt = test_case["prompt"]
        expected_keywords = test_case["expected_keywords"]

        payload = {"message": prompt}

        with self.client.post("/api/chat", json=payload, catch_response=True) as response:
            try:
                data = response.json()
            except Exception as e:
                response.failure(f"❌ Ungültiges JSON: {e} | Antwort: {response.text}")
                return

            # Versuche, die Antwort zu extrahieren (je nach API ggf. "message", "response", etc.)
            answer = data.get("response") or data.get("message") or ""
            
            if not answer:
                response.failure(f"⚠️ Leere Antwort erhalten: {data}")
            elif all(word.lower() in answer.lower() for word in expected_keywords):
                response.success()
            else:
                response.failure(f"❌ Semantisch inkorrekte Antwort. Prompt: '{prompt}' | Antwort: '{answer}'")
