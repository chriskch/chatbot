# tests/test_terminbuchung.py

import os
import time
import requests
from dotenv import load_dotenv

# 1) .env einlesen
load_dotenv(dotenv_path=".env.test") 
BASE_URL = os.getenv("APPLICATION_URL") + "/api/chat"

# 2) KPI-Schwellen aus der .env (Default-Werte in Klammern)
SAMPLES                       = int(os.getenv("KPI_FUNC_SAMPLES",                       "10"))
KEYWORD_SUCCESS_RATE_THRESH   = float(os.getenv("KPI_FUNC_KEYWORD_SUCCESS_RATE_THRESHOLD","1.0"))
KEYWORD_PRESENCE_RATE_THRESH  = float(os.getenv("KPI_FUNC_KEYWORD_PRESENCE_RATE",      "1.0"))
MAX_LATENCY_MS                = int(os.getenv("KPI_FUNC_MAX_LATENCY_MS",               "8000"))

SYSTEM_PROMPT = "Du bist Lisa König, unser E-Commerce-Shop-Chatbot. Du hilfst bei Bestellungen, Zahlungen, Produktinformationen, Bestellstatus und Support. Du vereinbarst keine Termine und entschuldigst dich auch entsprechend, dass diese Funktion nicht vorhanden ist."
CUSTOMER = {
    "id":     os.getenv("TEST_CUSTOMER_ID",    "max-schmidt"),
    "Name":   os.getenv("TEST_CUSTOMER_NAME",  "Max Schmidt"),
    "E-Mail": os.getenv("TEST_CUSTOMER_EMAIL", "max@example.com"),
    "Telefon":os.getenv("TEST_CUSTOMER_PHONE", "12345678"),
    "Ausweis":os.getenv("TEST_CUSTOMER_AUSWEIS","XYZ123"),
}

# 5) Helper zum Payload-Bau
def build_payload(user_text: str) -> dict:
    return {
        "customer": CUSTOMER,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_text}
        ]
    }

# ─── Test A: Keyword-Success-Rate ──────────────────────────────────────────────
def test_terminbuchung_keyword_success_rate():
    """
    Schickt SAMPLES-mal 'ich möchte einen Termin' und erwartet in ≥ KEYWORD_SUCCESS_RATE_THRESH
    aller Antworten sowohl ein Entschuldigungs-Keyword als auch 'termin'.
    """
    apologies = ["entschuldigung", "es tut mir leid", "tut mir leid"]
    successes = 0

    for _ in range(SAMPLES):
        resp = requests.post(BASE_URL, json=build_payload("ich möchte einen Termin")).json()
        text = resp["reply"].lower()
        if any(a in text for a in apologies) and "termin" in text:
            successes += 1

    rate = successes / SAMPLES
    assert rate >= KEYWORD_SUCCESS_RATE_THRESH, (
        f"Keyword-Success-Rate {rate:.2f} < Schwelle {KEYWORD_SUCCESS_RATE_THRESH}"
    )

# ─── Test B: Antwort-Latenz ───────────────────────────────────────────────────
def test_terminbuchung_response_latency():
    """
    Misst die Antwortzeit und erwartet ≤ MAX_LATENCY_MS Millisekunden.
    """
    start_ms = time.time()
    requests.post(BASE_URL, json=build_payload("ich möchte einen Termin"))
    duration_ms = (time.time() - start_ms) * 1000

    assert duration_ms <= MAX_LATENCY_MS, (
        f"Antwortzeit {duration_ms:.0f} ms > erlaubte {MAX_LATENCY_MS} ms"
    )

# ─── Test C: Keyword-Presence ─────────────────────────────────────────────────
def test_terminbuchung_response_contains_keyword():
    """
    Prüft, dass die Antwort mindestens 'Termin' oder 'buchen' enthält (Presence-Rate 100%).
    """
    resp  = requests.post(BASE_URL, json=build_payload("ich möchte einen Termin")).json()
    reply = resp["reply"]

    # Ausgabe, damit du siehst, was der Bot tatsächlich zurückliefert
    print("\n=== BOT-REPLY ===")
    print(reply)
    print("===============\n")

    assert ("Termin" in reply) or ("buchen" in reply), f"Unerwartete Antwort: {reply}"
