import pytest

from config import config
from src.appointments import AppointmentRequest, get_appointment, save_appointment, update_status


@pytest.fixture(autouse=True)
def _temp_db(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "APPOINTMENTS_DB_PATH", str(tmp_path / "appointments.db"))
    yield


def test_save_and_get_appointment():
    appt = AppointmentRequest(
        whatsapp_number="+10000000099",
        customer_name="Maria Lopez",
        service_id="rescreen",
        address="1 Test Ave",
        preferred_date="2025-09-01",
        preferred_time="Morning",
        notes="Urgent",
        language="en",
    )
    folio = save_appointment(appt)
    assert folio == appt.id

    row = get_appointment(folio)
    assert row is not None
    assert row["customer_name"] == "Maria Lopez"
    assert row["status"] == "pending"


def test_update_status():
    appt = AppointmentRequest(whatsapp_number="+10000000098", customer_name="Test User")
    folio = save_appointment(appt)

    assert update_status(folio, "confirmed") is True
    row = get_appointment(folio)
    assert row["status"] == "confirmed"

    assert update_status("does-not-exist", "confirmed") is False
