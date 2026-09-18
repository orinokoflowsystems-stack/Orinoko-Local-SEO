"""
Persistencia de leads/citas capturados por el chatbot de WhatsApp.

Usa SQLite (sin dependencias externas) para que la app funcione de
inmediato sin necesidad de levantar una base de datos aparte.
"""
import os
import sqlite3
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

from config import config
from src.logger import setup_logger

logger = setup_logger(__name__)

SCHEMA = """
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    whatsapp_number TEXT NOT NULL,
    customer_name TEXT,
    service_id TEXT,
    address TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    notes TEXT,
    language TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
);
"""


@contextmanager
def _get_connection():
    db_path = config.APPOINTMENTS_DB_PATH
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with _get_connection() as conn:
        conn.execute(SCHEMA)
    logger.info(f"Base de datos de citas inicializada en {config.APPOINTMENTS_DB_PATH}")


@dataclass
class AppointmentRequest:
    whatsapp_number: str
    customer_name: str = ""
    service_id: str = ""
    address: str = ""
    preferred_date: str = ""
    preferred_time: str = ""
    notes: str = ""
    language: str = "es"
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:8].upper())
    status: str = "pending"
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


def save_appointment(appt: AppointmentRequest) -> str:
    """Guarda una solicitud de cita y devuelve su folio de confirmación."""
    init_db()
    with _get_connection() as conn:
        conn.execute(
            """
            INSERT INTO appointments (
                id, whatsapp_number, customer_name, service_id, address,
                preferred_date, preferred_time, notes, language, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                appt.id,
                appt.whatsapp_number,
                appt.customer_name,
                appt.service_id,
                appt.address,
                appt.preferred_date,
                appt.preferred_time,
                appt.notes,
                appt.language,
                appt.status,
                appt.created_at,
            ),
        )
    logger.info(f"Cita guardada con folio {appt.id} para {appt.whatsapp_number}")
    return appt.id


def list_appointments(whatsapp_number: Optional[str] = None) -> List[sqlite3.Row]:
    init_db()
    with _get_connection() as conn:
        if whatsapp_number:
            rows = conn.execute(
                "SELECT * FROM appointments WHERE whatsapp_number = ? ORDER BY created_at DESC",
                (whatsapp_number,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM appointments ORDER BY created_at DESC").fetchall()
    return rows


def get_appointment(appointment_id: str) -> Optional[sqlite3.Row]:
    init_db()
    with _get_connection() as conn:
        return conn.execute(
            "SELECT * FROM appointments WHERE id = ?", (appointment_id,)
        ).fetchone()


def update_status(appointment_id: str, status: str) -> bool:
    init_db()
    with _get_connection() as conn:
        cursor = conn.execute(
            "UPDATE appointments SET status = ? WHERE id = ?", (status, appointment_id)
        )
    return cursor.rowcount > 0
