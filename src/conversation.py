"""
Motor de conversación del chatbot de WhatsApp de Handy Glass & Door LLC (HGD Sliding Door Repair).
"""
import json
import unicodedata
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from config import config
from src import knowledge_base as kb
from src.appointments import AppointmentRequest, save_appointment
from src.logger import setup_logger

logger = setup_logger(__name__)

# --- Conversation States ---
ST_GREETING_AND_TRIAGE = "greeting_and_triage"
ST_BOOKING_NAME = "booking_name"
ST_BOOKING_CITY_ZIP = "booking_city_zip"
ST_BOOKING_DESC = "booking_desc"
ST_BOOKING_MEDIA = "booking_media"
ST_BOOKING_OPTIONS = "booking_options"
ST_HUMAN_HANDOFF = "human_handoff"

AGENT_KEYWORDS = {
    "agente", "agent", "representante", "representative", "humano", "human", "asesor",
}
MENU_KEYWORDS = {"menu", "menú", "inicio", "start", "hola", "hi", "hello"}
CANCEL_KEYWORDS = {"cancelar", "cancel"}

MAP_INPUT_TO_SERVICE = {
    "1": "sliding_door_repair",
    "2": "glass_replacement",
    "3": "rescreen",
    "4": "patio_door_installation",
    "5": "screen_installation",
    "svc_sliding_door_repair": "sliding_door_repair",
    "svc_glass_replacement": "glass_replacement",
    "svc_rescreen": "rescreen",
    "svc_patio_door_installation": "patio_door_installation",
    "svc_screen_installation": "screen_installation"
}

@dataclass
class Session:
    whatsapp_number: str
    state: str = ST_GREETING_AND_TRIAGE
    language: str = "" # "es" or "en"
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

def _t(session: Session, es: str, en: str) -> str:
    return en if session.language == "en" else es

def detect_language_from_text(text: str) -> str:
    norm = _normalize(text)
    
    # Check for obvious English keywords
    english_words = {
        "hi", "hello", "good", "morning", "afternoon", "evening", "yes", "no", 
        "door", "glass", "screen", "repair", "replacement", "appointment", "book", 
        "help", "representative", "agent", "cost", "price", "thanks"
    }
    spanish_words = {
        "hola", "buenas", "buen", "dia", "tarde", "noche", "si", "no", 
        "puerta", "vidrio", "malla", "mosquitero", "reparacion", "reemplazo", "cita", 
        "ayuda", "representante", "agente", "costo", "precio", "gracias"
    }
    
    words = set(norm.split())
    eng_matches = len(words.intersection(english_words))
    esp_matches = len(words.intersection(spanish_words))
    
    # Specific English phrases
    if any(phrase in norm for phrase in ["how much", "sliding door", "broken glass", "do you speak english"]):
        eng_matches += 2
    # Specific Spanish phrases
    if any(phrase in norm for phrase in ["cuanto cuesta", "puerta corrediza", "vidrio roto", "hablas espanol"]):
        esp_matches += 2
        
    if eng_matches > esp_matches:
        return "en"
    return "es" # Default to Spanish

def _is_price_query(norm: str) -> bool:
    price_keywords = {
        "precio", "costo", "cuesta", "cuanto", "valor", "cotizacion", "cotizar", "presupuesto",
        "price", "cost", "how much", "estimate", "quote", "rate", "charge", "fee"
    }
    words = set(norm.split())
    return len(words.intersection(price_keywords)) > 0 or "cuanto cuesta" in norm or "how much" in norm

def _price_response(session: Session) -> str:
    if session.language == "en":
        return "The cost depends on the measurements and exact damage, so an inspection visit or a photo is necessary to give you an estimate. 😊"
    return "El costo depende de las medidas y el daño exacto, por lo que es necesaria una visita de inspección o una foto para darte un estimado preciso. 😊"

def _triage_message(session: Session) -> OutgoingMessage:
    if session.language == "en":
        body = (
            "👋 Hi! Welcome to *Handy Glass & Door LLC* (HGD Sliding Door Repair).\n"
            "Which service are you interested in today?\n\n"
            "1️⃣ Sliding glass door repairs (wheels, tracks, locks)\n"
            "2️⃣ Glass replacements (broken/foggy glass for doors/windows)\n"
            "3️⃣ Rescreen services (screen mesh replacement)\n"
            "4️⃣ Sliding patio door installations\n"
            "5️⃣ Window and door screens"
        )
        return OutgoingMessage(
            kind="list",
            body=body,
            list_button_text="Select Service",
            list_sections=[
                {
                    "title": "Services",
                    "rows": [
                        {"id": "svc_sliding_door_repair", "title": "Sliding Door Repair"},
                        {"id": "svc_glass_replacement", "title": "Glass Replacement"},
                        {"id": "svc_rescreen", "title": "Rescreen Service"},
                        {"id": "svc_patio_door_installation", "title": "Patio Door Installation"},
                        {"id": "svc_screen_installation", "title": "Window & Door Screens"},
                    ]
                }
            ]
        )
    else:
        body = (
            "👋 ¡Hola! Bienvenido a *Handy Glass & Door LLC* (HGD Sliding Door Repair).\n"
            "¿En qué servicio estás interesado hoy?\n\n"
            "1️⃣ Reparación de puertas corredizas (ruedas, rieles, cerraduras)\n"
            "2️⃣ Reemplazo de vidrios (rotos o empañados en puertas/ventanas)\n"
            "3️⃣ Servicio de Rescreen (cambio de mallas mosquiteras)\n"
            "4️⃣ Instalación de puertas corredizas de patio nuevas\n"
            "5️⃣ Mosquiteros para ventanas y puertas"
        )
        return OutgoingMessage(
            kind="list",
            body=body,
            list_button_text="Elegir servicio",
            list_sections=[
                {
                    "title": "Servicios",
                    "rows": [
                        {"id": "svc_sliding_door_repair", "title": "Reparación Puerta Corrediza"},
                        {"id": "svc_glass_replacement", "title": "Reemplazo de Vidrio"},
                        {"id": "svc_rescreen", "title": "Servicio de Rescreen"},
                        {"id": "svc_patio_door_installation", "title": "Instalación Puerta Patio"},
                        {"id": "svc_screen_installation", "title": "Mosquiteros Ventana/Puerta"},
                    ]
                }
            ]
        )

def extract_lead_json(session: Session) -> str:
    data = {
        "full_name": session.booking.get("name", ""),
        "city_or_zip": session.booking.get("city_or_zip", ""),
        "description": session.booking.get("description", ""),
        "has_media": session.booking.get("has_media", False),
        "service_id": session.booking.get("service_id", ""),
        "selected_option": session.booking.get("selected_option", ""),
        "language": session.language
    }
    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    logger.info(f"LEAD_EXTRACTION_JSON:\n{json_str}")
    print(f"LEAD_EXTRACTION_JSON:\n{json_str}")
    return json_str

def handle_message(session: Session, raw_text: str) -> List[OutgoingMessage]:
    text = (raw_text or "").strip()
    norm = _normalize(text)

    # Global Commands: Agent handoff
    if norm in AGENT_KEYWORDS or norm == "menu_agent":
        session.state = ST_HUMAN_HANDOFF
        body_msg = (
            "Perfect, a member of our team will reach out to you shortly. 😊"
            if session.language == "en"
            else "Perfecto, un miembro de nuestro equipo te contactará pronto. 😊"
        )
        return [OutgoingMessage(kind="text", body=body_msg)]

    # Global Commands: Menu / Reset
    if norm in MENU_KEYWORDS or norm == "menu_main" or (not text and session.state == ST_GREETING_AND_TRIAGE):
        session.state = ST_GREETING_AND_TRIAGE
        session.booking = {}
        if text and not session.language:
            session.language = detect_language_from_text(text)
        return [_triage_message(session)]

    # Dynamic language override if explicitly requested
    if norm in {"espanol", "spanish", "lang_es"}:
        session.language = "es"
        if session.state == ST_GREETING_AND_TRIAGE:
            return [OutgoingMessage(kind="text", body="¡Perfecto! Continuemos en español. 😊"), _triage_message(session)]
    elif norm in {"english", "ingles", "lang_en"}:
        session.language = "en"
        if session.state == ST_GREETING_AND_TRIAGE:
            return [OutgoingMessage(kind="text", body="Great! We'll continue in English. 😊"), _triage_message(session)]

    # Detect language if not set yet
    if text and not session.language:
        session.language = detect_language_from_text(text)

    # Handle price query if not in triage (in triage we want them to pick a service first)
    if session.state != ST_GREETING_AND_TRIAGE and _is_price_query(norm):
        price_exp = _price_response(session)
        # We will prepend this explanation and repeat the current state prompt
        current_prompt = ""
        if session.state == ST_BOOKING_NAME:
            current_prompt = _t(session, "¿Cuál es tu nombre completo?", "What's your full name?")
        elif session.state == ST_BOOKING_CITY_ZIP:
            current_prompt = _t(session, "¿En qué ciudad o código postal de Central Florida te encuentras?", "What city or zip code in Central Florida are you located in?")
        elif session.state == ST_BOOKING_DESC:
            current_prompt = _t(session, "¿Podrías darme una breve descripción del problema? (Ej. 'la puerta no rueda' o 'el vidrio está roto')", "Could you please provide a brief description of the problem? (E.g., 'the door doesn't slide' or 'the glass is broken')")
        elif session.state == ST_BOOKING_MEDIA:
            current_prompt = _t(session, "Por favor, ¿podrías enviarme una foto o video corto del problema? Esto nos ayuda a darte un mejor estimado.", "Could you kindly send me a photo or a short video of the issue? This helps us provide a better estimate.")
        elif session.state == ST_BOOKING_OPTIONS:
            current_prompt = _t(
                session,
                "Para la visita de inspección, ¿cuál de estas opciones prefieres?\n1️⃣ Mañana por la mañana\n2️⃣ El miércoles por la tarde",
                "For the inspection visit, which of these options do you prefer?\n1️⃣ Tomorrow morning\n2️⃣ Wednesday afternoon"
            )
        
        return [OutgoingMessage(kind="text", body=f"{price_exp}\n\n{current_prompt}")]

    # State Machine Transitions
    if session.state == ST_GREETING_AND_TRIAGE:
        # Check if they selected a service
        service_id = MAP_INPUT_TO_SERVICE.get(norm) or MAP_INPUT_TO_SERVICE.get(text)
        if not service_id:
            # Check if any part of the text matches service names/keywords
            for key, val in MAP_INPUT_TO_SERVICE.items():
                if key.startswith("svc_") and key[4:].replace("_", " ") in norm:
                    service_id = val
                    break
        
        if service_id:
            session.booking = {"service_id": service_id}
            session.state = ST_BOOKING_NAME
            return [OutgoingMessage(kind="text", body=_t(session, "Entendido. Para poder darte un estimado o agendar, ¿me podrías decir tu nombre completo? 😊", "Got it. To provide an estimate or schedule, could you please give me your full name? 😊"))]
        else:
            # Remind them to pick a service from the list
            fallback_msg = _t(
                session,
                "Por favor selecciona una de las opciones de servicios de la lista para continuar. 😊",
                "Please select one of the service options from the list to continue. 😊"
            )
            return [OutgoingMessage(kind="text", body=fallback_msg), _triage_message(session)]

    elif session.state == ST_BOOKING_NAME:
        if not text:
            return [OutgoingMessage(kind="text", body=_t(session, "¿Cuál es tu nombre completo?", "What's your full name?"))]
        session.booking["name"] = text
        session.state = ST_BOOKING_CITY_ZIP
        return [OutgoingMessage(kind="text", body=_t(
            session,
            f"Gracias, {text}. ¿En qué ciudad o código postal de Central Florida te encuentras? (Para confirmar que estás en nuestra área de servicio)",
            f"Thank you, {text}. What city or zip code in Central Florida are you located in? (To confirm you are in our service area)"
        ))]

    elif session.state == ST_BOOKING_CITY_ZIP:
        if not text:
            return [OutgoingMessage(kind="text", body=_t(session, "Por favor, indica tu ciudad o código postal.", "Please indicate your city or zip code."))]
        session.booking["city_or_zip"] = text
        session.state = ST_BOOKING_DESC
        return [OutgoingMessage(kind="text", body=_t(
            session,
            "¡Perfecto! ¿Podrías darme una breve descripción del problema? (Ej. 'la puerta no rueda' o 'el vidrio está roto')",
            "Perfect! Could you please give me a brief description of the problem? (E.g., 'the door doesn't slide' or 'the glass is broken')"
        ))]

    elif session.state == ST_BOOKING_DESC:
        if not text:
            return [OutgoingMessage(kind="text", body=_t(session, "Por favor describe brevemente el problema.", "Please describe the problem briefly."))]
        session.booking["description"] = text
        session.state = ST_BOOKING_MEDIA
        return [OutgoingMessage(kind="text", body=_t(
            session,
            "Por favor, ¿podrías enviarme una foto o video corto del problema? Esto nos ayuda a evaluar mejor el daño.",
            "Could you kindly send me a photo or a short video of the issue? This helps us better assess the damage."
        ))]

    elif session.state == ST_BOOKING_MEDIA:
        # Check if they sent media or typed something
        has_media = True
        if norm in {"no", "no puedo", "no tengo", "none", "i can't", "cant", "don't have"}:
            has_media = False
        session.booking["has_media"] = has_media
        session.state = ST_BOOKING_OPTIONS
        
        body_msg = _t(
            session,
            "¡Muchas gracias! Para la visita de inspección, ¿cuál de estas opciones prefieres?\n1️⃣ Mañana por la mañana\n2️⃣ El miércoles por la tarde",
            "Thank you so much! For the inspection visit, which of these options do you prefer?\n1️⃣ Tomorrow morning\n2️⃣ Wednesday afternoon"
        )
        buttons_list = [
            {"id": "opt_tomorrow", "title": _t(session, "Mañana mañana", "Tomorrow morning")},
            {"id": "opt_wednesday", "title": _t(session, "Miércoles tarde", "Wednesday afternoon")},
        ]
        return [OutgoingMessage(kind="buttons", body=body_msg, buttons=buttons_list)]

    elif session.state == ST_BOOKING_OPTIONS:
        chosen_option = ""
        preferred_date = ""
        preferred_time = ""
        
        if norm in {"1", "opt_tomorrow", "tomorrow", "tomorrow morning", "manana", "manana por la manana"}:
            chosen_option = _t(session, "Mañana por la mañana", "Tomorrow morning")
            preferred_date = "Tomorrow"
            preferred_time = "Morning"
        elif norm in {"2", "opt_wednesday", "wednesday", "wednesday afternoon", "miercoles", "miercoles por la tarde"}:
            chosen_option = _t(session, "El miércoles por la tarde", "Wednesday afternoon")
            preferred_date = "Wednesday"
            preferred_time = "Afternoon"
        else:
            if text:
                chosen_option = text
                preferred_date = text
                preferred_time = "Flexible"
            else:
                body_msg = _t(
                    session,
                    "Por favor selecciona una de las opciones válidas:\n1️⃣ Mañana por la mañana\n2️⃣ El miércoles por la tarde",
                    "Please select one of the valid options:\n1️⃣ Tomorrow morning\n2️⃣ Wednesday afternoon"
                )
                buttons_list = [
                    {"id": "opt_tomorrow", "title": _t(session, "Mañana mañana", "Tomorrow morning")},
                    {"id": "opt_wednesday", "title": _t(session, "Miércoles tarde", "Wednesday afternoon")},
                ]
                return [OutgoingMessage(kind="buttons", body=body_msg, buttons=buttons_list)]
                
        session.booking["selected_option"] = chosen_option
        session.booking["preferred_date"] = preferred_date
        session.booking["preferred_time"] = preferred_time
        
        # Extract and log JSON lead information
        extract_lead_json(session)
        
        # Save to database
        appt = AppointmentRequest(
            whatsapp_number=session.whatsapp_number,
            customer_name=session.booking.get("name", ""),
            service_id=session.booking.get("service_id", ""),
            address=session.booking.get("city_or_zip", ""),
            preferred_date=preferred_date,
            preferred_time=preferred_time,
            notes=session.booking.get("description", ""),
            language=session.language,
        )
        folio = save_appointment(appt)
        
        # Reset state
        session.state = ST_GREETING_AND_TRIAGE
        session.booking = {}
        
        closure_msg = _t(
            session,
            f"✅ ¡Cita confirmada! Tu número de folio es *{folio}*. Un técnico de Handy Glass & Door LLC se pondrá en contacto contigo pronto para coordinar los detalles. ¡Gracias! 😊",
            f"✅ Appointment confirmed! Your confirmation number is *{folio}*. A technician from Handy Glass & Door LLC will contact you shortly to coordinate the details. Thank you! 😊"
        )
        return [OutgoingMessage(kind="text", body=closure_msg)]

    elif session.state == ST_HUMAN_HANDOFF:
        if norm in MENU_KEYWORDS:
            session.state = ST_GREETING_AND_TRIAGE
            return [_triage_message(session)]
        body_msg = (
            "We have notified our team. A representative will contact you shortly. 😊"
            if session.language == "en"
            else "Hemos notificado a nuestro equipo. Un representante se pondrá en contacto contigo en breve. 😊"
        )
        return [OutgoingMessage(kind="text", body=body_msg)]

    # Unknown state reset
    session.state = ST_GREETING_AND_TRIAGE
    return [_triage_message(session)]
