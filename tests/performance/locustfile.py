from locust import HttpUser, task, constant
from random import choice


class ChatbotUser(HttpUser):
    wait_time = constant(1)  # Wartezeit zwischen den Requests

    prompts = [
        {
            "messages": [
                {"role": "user", "content": "Wie ist der Status meiner Bestellung mit der Bestellnummer OR123?"}
            ],
            "expected_keywords": ["status", "bestellung"]
        },
        {
            "messages": [
                {"role": "user", "content": "Was war meine letzte Bestellung, die ich hier bestellt habe?"}
            ],
            "expected_keywords": ["letzte", "bestellung"]
        },
        {
            "messages": [
                {"role": "user", "content": "Wo ist meine Bestellung mit der Bestellnummer OR123?"}
            ],
            "expected_keywords": ["bestellung", "OR123"]
        }
    ]

    @task
    def send_prompt(self):
        test_case = choice(self.prompts)
        messages = test_case["messages"]
        expected_keywords = test_case["expected_keywords"]

        payload = {
            "messages": messages,
            "customer": {"name": "Max Mustermann", "id": 1, "email": "kunde@example.com"}
        }

        with self.client.post("/api/chat", json=payload, catch_response=True) as response:
            try:
                data = response.json()
            except Exception as e:
                response.failure(f"❌ Ungültiges JSON: {e} | Antwort: {response.text}")
                return

            # Überprüfe, ob die API mit 'reply' geantwortet hat
            if data.get("status") == "reply":
                answer = data.get("reply", "")
                if not answer:
                    response.failure(f"⚠️ Leere Antwort erhalten: {data}")
                elif all(word.lower() in answer.lower() for word in expected_keywords):
                    response.success()
                else:
                    response.failure(
                        f"❌ Semantisch inkorrekte Antwort. Prompt: '{messages}' | Antwort: '{answer}'"
                    )
            elif data.get("status") == "function_call":
                response.success()  # Wenn Function Call korrekt erkannt wurde
            else:
                response.failure(f"⚠️ Unerwartetes Antwortformat: {data}")