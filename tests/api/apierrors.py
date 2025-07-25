import os
import requests
import pytest
import responses
from dotenv import load_dotenv


load_dotenv(dotenv_path=".env.test")  # Adjust path as needed
BASE_URL = os.getenv("APPLICATION_URL") + "/api/chat"

TEST_PROMPT = "Wie ist der Status meiner Bestellung?"

# Hilfsfunktion zum Senden von Chat-Anfragen
def send_chat_request(message):
    response = requests.post(BASE_URL, json={"message": message}, timeout=5)
    return response

# Test 1: HTTP 500 simulieren
@responses.activate
def test_internal_server_error():
    responses.add(responses.POST, BASE_URL, status=500)

    with pytest.raises(requests.exceptions.HTTPError):
        response = send_chat_request(TEST_PROMPT)
        response.raise_for_status()

# Test 2: Timeout simulieren
def test_timeout(monkeypatch):
    def timeout_request(*args, **kwargs):
        raise requests.exceptions.Timeout("Timeout!")

    monkeypatch.setattr(requests, "post", timeout_request)

    with pytest.raises(requests.exceptions.Timeout):
        send_chat_request(TEST_PROMPT)

# Test 3: Leere Antwort simulieren
def test_empty_answer(monkeypatch):
    class MockResponse:
        status_code = 200
        def json(self):
            return {"response": ""}

    monkeypatch.setattr(requests, "post", lambda *a, **k: MockResponse())

    response = send_chat_request(TEST_PROMPT)
    assert response.json()["response"] == "", "Antwort sollte leer sein"
    # Hier evtl. prüfen, ob Bot korrekt darauf reagiert, z.B. mit Fallback-Nachricht

# Test 4: Fehlende Daten in der Antwort
def test_incomplete_response(monkeypatch):
    class MockResponse:
        status_code = 200
        def json(self):
            return {}  # Kein "response"-Feld

    monkeypatch.setattr(requests, "post", lambda *a, **k: MockResponse())

    response = send_chat_request(TEST_PROMPT)
    data = response.json()
    assert "response" not in data, "response-Feld fehlt"
