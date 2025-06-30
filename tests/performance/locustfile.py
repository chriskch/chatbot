from locust import HttpUser, task, between
import random

class ChatbotUser(HttpUser):
    wait_time = between(1, 3)  # realistischere Denkpausen

    def on_start(self):
        self.user_context = {
            "messages": [
                "Hi, can you help me?",
                "What can you do?",
                "Tell me a joke!",
                "How do I reset my password?",
                "What are your opening hours?",
                "Can you recommend a product?",
                "I want to cancel my order.",
                "Thanks!"
            ],
            "conversation_history": []
        }

    @task
    def start_conversation(self):
        message = random.choice(self.user_context["messages"])
        payload = {
            "message": message,
            "history": self.user_context["conversation_history"]
        }

        with self.client.post("/api/chat", json=payload, catch_response=True) as response:
            if response.status_code == 200:
                self.user_context["conversation_history"].append({"role": "user", "content": message})
                self.user_context["conversation_history"].append({"role": "assistant", "content": response.json().get("reply", "")})
                response.success()
            else:
                response.failure(f"Unexpected status code: {response.status_code}")