"""
Pruebas del motor de conversación del chatbot de WhatsApp.
"""
import pytest

from config import config
from src.appointments import list_appointments
from src.conversation import Session, handle_message, extract_lead_json


@pytest.fixture(autouse=True)
def _temp_db(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "APPOINTMENTS_DB_PATH", str(tmp_path / "appointments.db"))
    yield


def test_language_auto_detection():
    # Spanish greeting
    session = Session(whatsapp_number="+10000000001")
    messages = handle_message(session, "Hola, buenas tardes")
    assert session.language == "es"
    assert session.state == "greeting_and_triage"
    assert any("Elegir servicio" in m.body or "¿En qué servicio" in m.body for m in messages)

    # English greeting
    session2 = Session(whatsapp_number="+10000000002")
    messages2 = handle_message(session2, "Hi there, I need a door repair")
    assert session2.language == "en"
    assert session2.state == "greeting_and_triage"
    assert any("Select Service" in m.body or "Which service" in m.body for m in messages2)


def test_language_selection_explicit():
    # Explicit spanish request
    session = Session(whatsapp_number="+10000000003")
    handle_message(session, "spanish")
    assert session.language == "es"
    assert session.state == "greeting_and_triage"

    # Explicit english request
    session2 = Session(whatsapp_number="+10000000004")
    handle_message(session2, "english")
    assert session2.language == "en"
    assert session2.state == "greeting_and_triage"


def test_full_booking_flow_creates_appointment_spanish():
    session = Session(whatsapp_number="+10000000005")
    # Triage
    handle_message(session, "hola")
    assert session.state == "greeting_and_triage"
    
    # Choose service 1
    handle_message(session, "1")
    assert session.state == "booking_name"
    
    # Provide name
    handle_message(session, "Carlos Santana")
    assert session.state == "booking_city_zip"
    
    # Provide city/zip
    handle_message(session, "Orlando, 32801")
    assert session.state == "booking_desc"
    
    # Provide description
    handle_message(session, "La puerta de vidrio no rueda bien")
    assert session.state == "booking_media"
    
    # Provide photo (or type no)
    handle_message(session, "no")
    assert session.state == "booking_options"
    
    # Select booking option 1 (Mañana por la mañana)
    messages = handle_message(session, "1")
    
    # Ends booking, back to greeting
    assert session.state == "greeting_and_triage"
    assert any("folio" in m.body.lower() or "confirmada" in m.body.lower() for m in messages)
    
    # Verify DB entry
    rows = list_appointments("+10000000005")
    assert len(rows) == 1
    assert rows[0]["customer_name"] == "Carlos Santana"
    assert rows[0]["service_id"] == "sliding_door_repair"
    assert rows[0]["address"] == "Orlando, 32801"
    assert rows[0]["preferred_date"] == "Tomorrow"
    assert rows[0]["preferred_time"] == "Morning"


def test_full_booking_flow_creates_appointment_english():
    session = Session(whatsapp_number="+10000000006")
    # Triage
    handle_message(session, "hello")
    assert session.state == "greeting_and_triage"
    
    # Choose service 2 (Glass replacement)
    handle_message(session, "2")
    assert session.state == "booking_name"
    
    # Provide name
    handle_message(session, "John Smith")
    assert session.state == "booking_city_zip"
    
    # Provide city/zip
    handle_message(session, "Kissimmee")
    assert session.state == "booking_desc"
    
    # Provide description
    handle_message(session, "Broken window glass in bedroom")
    assert session.state == "booking_media"
    
    # Provide photo (actually sent)
    handle_message(session, "sent photo")
    assert session.state == "booking_options"
    
    # Select booking option 2 (Wednesday afternoon)
    messages = handle_message(session, "2")
    
    # Ends booking, back to greeting
    assert session.state == "greeting_and_triage"
    assert any("confirmed" in m.body.lower() or "confirmation" in m.body.lower() for m in messages)
    
    # Verify DB entry
    rows = list_appointments("+10000000006")
    assert len(rows) == 1
    assert rows[0]["customer_name"] == "John Smith"
    assert rows[0]["service_id"] == "glass_replacement"
    assert rows[0]["address"] == "Kissimmee"
    assert rows[0]["preferred_date"] == "Wednesday"
    assert rows[0]["preferred_time"] == "Afternoon"


def test_price_query_does_not_break_flow():
    session = Session(whatsapp_number="+10000000007")
    handle_message(session, "hola")
    handle_message(session, "1") # Service 1
    
    # Currently asking for Name. Let's ask for price instead
    messages = handle_message(session, "¿Cuánto cuesta?")
    # State should remain booking_name
    assert session.state == "booking_name"
    # Response should explain cost and ask for name again
    assert any("costo depende" in m.body or "estimado" in m.body for m in messages)
    assert any("nombre" in m.body for m in messages)
    
    # Provide name
    handle_message(session, "Juan Perez")
    assert session.state == "booking_city_zip"


def test_menu_keyword_resets_state_mid_booking():
    session = Session(whatsapp_number="+10000000008")
    handle_message(session, "hola")
    handle_message(session, "1")
    handle_message(session, "Juan Perez")
    assert session.state == "booking_city_zip"
    
    messages = handle_message(session, "menu")
    assert session.state == "greeting_and_triage"
    assert any("¿En qué servicio" in m.body or "Elegir servicio" == m.list_button_text for m in messages)


def test_agent_handoff_available_from_any_state():
    session = Session(whatsapp_number="+10000000009")
    handle_message(session, "hola")
    messages = handle_message(session, "agente")
    assert session.state == "human_handoff"
    assert any("contactará" in m.body or "representante" in m.body for m in messages)
