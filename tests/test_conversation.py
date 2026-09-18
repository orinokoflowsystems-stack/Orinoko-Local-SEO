"""
Pruebas del motor de conversación del chatbot de WhatsApp.

Se enfocan en el flujo completo (selección de idioma -> menú -> reserva
de cita) tanto en español como en inglés, usando la base de datos de
citas en un archivo temporal para no afectar el proyecto real.
"""
import pytest

from config import config
from src.appointments import list_appointments
from src.conversation import Session, handle_message


@pytest.fixture(autouse=True)
def _temp_db(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "APPOINTMENTS_DB_PATH", str(tmp_path / "appointments.db"))
    yield


def _last(messages):
    return messages[-1]


def test_language_selection_spanish():
    session = Session(whatsapp_number="+10000000001")
    handle_message(session, "")  # saludo inicial
    messages = handle_message(session, "1")
    assert session.language == "es"
    assert session.state == "main_menu"
    assert any("Ver servicios" in m.body or "servicios" in m.body.lower() for m in messages)


def test_language_selection_english():
    session = Session(whatsapp_number="+10000000002")
    handle_message(session, "")
    messages = handle_message(session, "english")
    assert session.language == "en"
    assert session.state == "main_menu"


def test_unrecognized_language_reprompts():
    session = Session(whatsapp_number="+10000000003")
    messages = handle_message(session, "banana")
    assert session.state == "lang_select"
    assert "Español" in messages[0].body or "Spanish" in messages[0].body


def test_full_booking_flow_creates_appointment():
    session = Session(whatsapp_number="+10000000004")
    handle_message(session, "1")  # español

    handle_message(session, "menu_book")
    handle_message(session, "svc_sliding_door_repair")
    handle_message(session, "Juan Perez")
    handle_message(session, "123 Main St, Miami, FL 33101")
    handle_message(session, "2025-07-01")
    handle_message(session, "time_morning")
    handle_message(session, "no")
    confirm_messages = handle_message(session, "si")

    assert session.state == "main_menu"
    assert any("folio" in m.body.lower() for m in confirm_messages)

    rows = list_appointments("+10000000004")
    assert len(rows) == 1
    assert rows[0]["customer_name"] == "Juan Perez"
    assert rows[0]["service_id"] == "sliding_door_repair"
    assert rows[0]["preferred_date"] == "2025-07-01"


def test_booking_can_be_cancelled():
    session = Session(whatsapp_number="+10000000005")
    handle_message(session, "2")  # english

    handle_message(session, "menu_book")
    handle_message(session, "svc_glass_replacement")
    handle_message(session, "Jane Doe")
    handle_message(session, "500 Ocean Dr")
    handle_message(session, "2025-08-15")
    handle_message(session, "time_afternoon")
    handle_message(session, "no")
    messages = handle_message(session, "no")  # cancela en confirmación

    assert session.state == "main_menu"
    assert any("cancel" in m.body.lower() for m in messages)
    assert len(list_appointments("+10000000005")) == 0


def test_menu_keyword_resets_state_mid_booking():
    session = Session(whatsapp_number="+10000000006")
    handle_message(session, "1")
    handle_message(session, "menu_book")
    messages = handle_message(session, "menu")
    assert session.state == "main_menu"
    assert messages  # se reenvía el menú principal


def test_agent_handoff_available_from_any_state():
    session = Session(whatsapp_number="+10000000007")
    handle_message(session, "1")
    messages = handle_message(session, "agente")
    assert session.state == "human_handoff"
    assert len(messages) == 1
