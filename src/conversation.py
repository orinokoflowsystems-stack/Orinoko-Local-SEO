"""
Motor de conversación del chatbot de WhatsApp de Handy Glass & Door LLC.

Implementa una máquina de estados simple y bilingüe (español/inglés) que:
  1. Saluda y detecta/pregunta el idioma preferido.
  2. Muestra un menú principal (ver servicios, agendar cita, horario, agente).
  3. Guía un flujo de agendamiento de citas recolectando los datos
     necesarios y los guarda en la base de datos de citas.

El motor es independiente del transporte: recibe texto (o el id de un
botón/lista) y un número de WhatsApp, y devuelve una lista de mensajes de
salida (`OutgoingMessage`). Esto permite reutilizarlo tanto desde el
webhook de Flask como desde un CLI de demostración sin credenciales.
"""
import unicodedata
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from config import config
from src import knowledge_base as kb
from src.appointments import AppointmentRequest, save_appointment
from src.logger import setup_logger

logger = setup_logger(__name__)

# --- Estados de la conversación ---
ST_LANG_SELECT = "lang_select"
ST_MAIN_MENU = "main_menu"
ST_SERVICES_MENU = "services_menu"
ST_BOOKING_SERVICE = "booking_service"
ST_BOOKING_NAME = "booking_name"
ST_BOOKING_ADDRESS = "booking_address"
ST_BOOKING_DATE = "booking_date"
ST_BOOKING_TIME = "booking_time"
ST_BOOKING_NOTES = "booking_notes"
ST_BOOKING_CONFIRM = "booking_confirm"
ST_HUMAN_HANDOFF = "human_handoff"

AGENT_KEYWORDS = {
    "agente", "agent", "representante", "representative", "humano", "human", "asesor",
}
MENU_KEYWORDS = {"menu", "menú", "inicio", "start", "hola", "hi", "hello"}
CANCEL_KEYWORDS = {"cancelar", "cancel"}


@dataclass
class Session:
    whatsapp_number: str
    state: str = ST_LANG_SELECT
    language: str = "es"
    profile_name: str = ""
    booking: Dict = field(default_factory=dict)


@dataclass
class OutgoingMessage:
    kind: str  # "text" | "buttons" | "list"
    body: str
    buttons: Optional[List[Dict[str, str]]] = None
    list_button_text: Optional[str] = None
    list_sections: Optional[List[Dict]] = None


class SessionStore:
    """Almacén de sesiones en memoria, indexado por número de WhatsApp."""

    def __init__(self):
        self._sessions: Dict[str, Session] = {}

    def get_or_create(self, whatsapp_number: str, profile_name: str = "") -> Session:
        session = self._sessions.get(whatsapp_number)
        if session is None:
            session = Session(whatsapp_number=whatsapp_number, profile_name=profile_name)
            self._sessions[whatsapp_number] = session
        elif profile_name:
            session.profile_name = profile_name
        return session

    def reset(self, whatsapp_number: str) -> None:
        self._sessions.pop(whatsapp_number, None)


def _normalize(text: str) -> str:
    text = text.strip().lower()
    text = "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )
    return text


def _detect_language(text: str) -> Optional[str]:
    norm = _normalize(text)
    if norm in {"1", "es", "espanol", "spanish", "lang_es"}:
        return "es"
    if norm in {"2", "en", "english", "ingles", "lang_en"}:
        return "en"
    return None


def _t(session: Session, es: str, en: str) -> str:
    return en if session.language == "en" else es


def _main_menu_message(session: Session) -> OutgoingMessage:
    sections = [
        {
            "title": _t(session, "Servicios", "Services"),
            "rows": [
                {
                    "id": "menu_services",
                    "title": _t(session, "Ver servicios", "View services"),
                },
                {
                    "id": "menu_book",
                    "title": _t(session, "Agendar una cita", "Book an appointment"),
                },
                {
                    "id": "menu_hours",
                    "title": _t(session, "Horario y ubicación", "Hours & location"),
                },
                {
                    "id": "menu_agent",
                    "title": _t(session, "Hablar con un representante", "Talk to a representative"),
                },
            ],
        }
    ]
    return OutgoingMessage(
        kind="list",
        body=kb.MAIN_MENU_TEXT[session.language],
        list_button_text=_t(session, "Ver opciones", "View options"),
        list_sections=sections,
    )


def _services_menu_message(session: Session) -> OutgoingMessage:
    rows = [
        {"id": f"svc_{s['id']}", "title": s["name_en"] if session.language == "en" else s["name_es"]}
        for s in kb.SERVICES
    ]
    body = kb.services_list_text(session.language) + "\n\n" + _t(
        session,
        "Selecciona un servicio para agendar una cita, o escribe *menu* para volver.",
        "Select a service to book an appointment, or type *menu* to go back.",
    )
    return OutgoingMessage(
        kind="list",
        body=body,
        list_button_text=_t(session, "Elegir servicio", "Choose service"),
        list_sections=[{"title": _t(session, "Servicios", "Services"), "rows": rows}],
    )


def _start_booking(session: Session) -> List[OutgoingMessage]:
    session.state = ST_BOOKING_SERVICE
    session.booking = {}
    rows = [
        {"id": f"svc_{s['id']}", "title": s["name_en"] if session.language == "en" else s["name_es"]}
        for s in kb.SERVICES
    ]
    msg = OutgoingMessage(
        kind="list",
        body=_t(session, "¿Qué servicio necesitas?", "Which service do you need?"),
        list_button_text=_t(session, "Elegir servicio", "Choose service"),
        list_sections=[{"title": _t(session, "Servicios", "Services"), "rows": rows}],
    )
    return [msg]


def _booking_summary_text(session: Session) -> str:
    b = session.booking
    service_name = kb.service_name(b.get("service_id", ""), session.language)
    if session.language == "en":
        return (
            "Please confirm your appointment request:\n"
            f"• Service: {service_name}\n"
            f"• Name: {b.get('name')}\n"
            f"• Address: {b.get('address')}\n"
            f"• Preferred date: {b.get('date')}\n"
            f"• Preferred time: {b.get('time')}\n"
            f"• Notes: {b.get('notes') or '-'}\n\n"
            "Reply *yes* to confirm or *no* to cancel."
        )
    return (
        "Por favor confirma tu solicitud de cita:\n"
        f"• Servicio: {service_name}\n"
        f"• Nombre: {b.get('name')}\n"
        f"• Dirección: {b.get('address')}\n"
        f"• Fecha preferida: {b.get('date')}\n"
        f"• Hora preferida: {b.get('time')}\n"
        f"• Notas: {b.get('notes') or '-'}\n\n"
        "Responde *si* para confirmar o *no* para cancelar."
    )


def handle_message(session: Session, raw_text: str) -> List[OutgoingMessage]:
    """
    Procesa un mensaje entrante dado el estado actual de la sesión y
    devuelve la lista de mensajes salientes a enviar.
    """
    text = (raw_text or "").strip()
    norm = _normalize(text)

    # Comandos globales, disponibles desde cualquier estado.
    if norm in AGENT_KEYWORDS or norm == "menu_agent":
        session.state = ST_HUMAN_HANDOFF
        return [OutgoingMessage(kind="text", body=kb.HUMAN_HANDOFF_TEXT[session.language])]

    if (session.state != ST_LANG_SELECT and norm in MENU_KEYWORDS) or norm == "menu_main":
        session.state = ST_MAIN_MENU
        return [_main_menu_message(session)]

    if session.state == ST_LANG_SELECT:
        lang = _detect_language(text)
        if lang is None:
            return [OutgoingMessage(kind="text", body=kb.WELCOME_TEXT)]
        session.language = lang
        session.state = ST_MAIN_MENU
        greeting = _t(
            session,
            f"¡Perfecto! Continuemos en español. 😊",
            "Great! We'll continue in English. 😊",
        )
        return [OutgoingMessage(kind="text", body=greeting), _main_menu_message(session)]

    if session.state == ST_MAIN_MENU:
        if norm in {"1", "menu_services"}:
            session.state = ST_SERVICES_MENU
            return [_services_menu_message(session)]
        if norm in {"2", "menu_book"}:
            return _start_booking(session)
        if norm in {"3", "menu_hours"}:
            return [
                OutgoingMessage(kind="text", body=kb.business_info_text(session.language)),
                _main_menu_message(session),
            ]
        if norm in {"4", "menu_agent"}:
            session.state = ST_HUMAN_HANDOFF
            return [OutgoingMessage(kind="text", body=kb.HUMAN_HANDOFF_TEXT[session.language])]
        return [
            OutgoingMessage(kind="text", body=kb.FALLBACK_TEXT[session.language]),
            _main_menu_message(session),
        ]

    if session.state == ST_SERVICES_MENU:
        if norm.startswith("svc_"):
            return _start_booking_with_service(session, norm[len("svc_"):])
        return [
            OutgoingMessage(kind="text", body=kb.FALLBACK_TEXT[session.language]),
            _services_menu_message(session),
        ]

    if session.state == ST_BOOKING_SERVICE:
        if norm.startswith("svc_") and norm[len("svc_"):] in kb.SERVICE_BY_ID:
            return _start_booking_with_service(session, norm[len("svc_"):])
        # También permitir elegir por número (1-5) igual que la lista de servicios.
        if norm.isdigit() and 1 <= int(norm) <= len(kb.SERVICES):
            service_id = kb.SERVICES[int(norm) - 1]["id"]
            return _start_booking_with_service(session, service_id)
        return [
            OutgoingMessage(
                kind="text",
                body=_t(
                    session,
                    "Por favor selecciona un servicio válido de la lista.",
                    "Please select a valid service from the list.",
                ),
            )
        ]

    if session.state == ST_BOOKING_NAME:
        if not text:
            return [OutgoingMessage(kind="text", body=_t(session, "¿Cuál es tu nombre completo?", "What's your full name?"))]
        session.booking["name"] = text
        session.state = ST_BOOKING_ADDRESS
        return [OutgoingMessage(kind="text", body=_t(
            session,
            "¿Cuál es la dirección donde se realizará el servicio? (calle, ciudad, código postal)",
            "What's the address where the service will take place? (street, city, zip code)",
        ))]

    if session.state == ST_BOOKING_ADDRESS:
        if not text:
            return [OutgoingMessage(kind="text", body=_t(session, "Por favor indica la dirección.", "Please provide the address."))]
        session.booking["address"] = text
        session.state = ST_BOOKING_DATE
        return [OutgoingMessage(kind="text", body=_t(
            session,
            f"¿Qué fecha prefieres para tu cita? (nuestro horario: {_business_hours(session)})",
            f"What date would you prefer for your appointment? (our hours: {_business_hours(session)})",
        ))]

    if session.state == ST_BOOKING_DATE:
        if not text:
            return [OutgoingMessage(kind="text", body=_t(session, "Por favor indica una fecha (ej. 2025-06-20).", "Please provide a date (e.g. 2025-06-20)."))]
        session.booking["date"] = text
        session.state = ST_BOOKING_TIME
        return [OutgoingMessage(kind="buttons", body=_t(
            session, "¿Qué horario prefieres?", "What time window do you prefer?"
        ), buttons=[
            {"id": "time_morning", "title": _t(session, "Mañana", "Morning")},
            {"id": "time_afternoon", "title": _t(session, "Tarde", "Afternoon")},
            {"id": "time_any", "title": _t(session, "Cualquiera", "Any")},
        ])]

    if session.state == ST_BOOKING_TIME:
        time_map = {
            "time_morning": _t(session, "Mañana", "Morning"),
            "time_afternoon": _t(session, "Tarde", "Afternoon"),
            "time_any": _t(session, "Cualquiera", "Any"),
            "1": _t(session, "Mañana", "Morning"),
            "2": _t(session, "Tarde", "Afternoon"),
            "3": _t(session, "Cualquiera", "Any"),
        }
        chosen = time_map.get(norm)
        if not chosen:
            if not text:
                return [OutgoingMessage(kind="text", body=_t(session, "Indica un horario preferido.", "Please provide a preferred time."))]
            chosen = text
        session.booking["time"] = chosen
        session.state = ST_BOOKING_NOTES
        return [OutgoingMessage(kind="text", body=_t(
            session,
            "¿Deseas agregar alguna nota sobre el problema o servicio? (escribe *no* si no aplica)",
            "Would you like to add any notes about the issue or service? (type *no* if not applicable)",
        ))]

    if session.state == ST_BOOKING_NOTES:
        session.booking["notes"] = "" if norm in {"no", "n/a", "na"} else text
        session.state = ST_BOOKING_CONFIRM
        return [OutgoingMessage(kind="text", body=_booking_summary_text(session))]

    if session.state == ST_BOOKING_CONFIRM:
        if norm in {"si", "sí", "yes", "y", "s", "confirmar", "confirm"}:
            appt = AppointmentRequest(
                whatsapp_number=session.whatsapp_number,
                customer_name=session.booking.get("name", ""),
                service_id=session.booking.get("service_id", ""),
                address=session.booking.get("address", ""),
                preferred_date=session.booking.get("date", ""),
                preferred_time=session.booking.get("time", ""),
                notes=session.booking.get("notes", ""),
                language=session.language,
            )
            folio = save_appointment(appt)
            session.state = ST_MAIN_MENU
            confirmation = _t(
                session,
                f"✅ ¡Listo! Tu cita fue registrada con el folio *{folio}*.\n"
                f"Un miembro de {_business_name()} se comunicará contigo para confirmar el horario exacto.",
                f"✅ All set! Your appointment was recorded with confirmation number *{folio}*.\n"
                f"A member of {_business_name()} will contact you to confirm the exact time.",
            )
            return [OutgoingMessage(kind="text", body=confirmation), _main_menu_message(session)]
        if norm in CANCEL_KEYWORDS or norm in {"no", "n"}:
            session.state = ST_MAIN_MENU
            return [
                OutgoingMessage(kind="text", body=_t(session, "Solicitud cancelada.", "Request cancelled.")),
                _main_menu_message(session),
            ]
        return [OutgoingMessage(kind="text", body=_booking_summary_text(session))]

    if session.state == ST_HUMAN_HANDOFF:
        if norm in MENU_KEYWORDS:
            session.state = ST_MAIN_MENU
            return [_main_menu_message(session)]
        return [OutgoingMessage(kind="text", body=kb.HUMAN_HANDOFF_TEXT[session.language])]

    # Estado desconocido: reiniciar al menú principal.
    session.state = ST_MAIN_MENU
    return [_main_menu_message(session)]


def _start_booking_with_service(session: Session, service_id: str) -> List[OutgoingMessage]:
    session.booking = {"service_id": service_id}
    session.state = ST_BOOKING_NAME
    return [OutgoingMessage(kind="text", body=_t(session, "¿Cuál es tu nombre completo?", "What's your full name?"))]


def _business_hours(session: Session) -> str:
    return config.BUSINESS_HOURS


def _business_name() -> str:
    return config.BUSINESS_NAME
