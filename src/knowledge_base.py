"""
Base de conocimiento bilingüe (ES/EN) del chatbot de Handy Glass & Door LLC
(HGD Sliding Door Repair - https://hgdslidingdoor-repair.com).

Contiene los servicios ofrecidos, textos de bienvenida/menú y preguntas
frecuentes usados por el motor de conversación. Los datos de contacto y
horario provienen de `config.py` (variables de entorno) para que puedan
actualizarse sin tocar código.

Nota: el catálogo de servicios se definió a partir de la información
proporcionada directamente para este proyecto. Si el sitio web cambia
o agrega servicios, actualiza `SERVICES` a continuación.
"""
from typing import Dict, List

from config import config

# Identificadores estables usados como `service_id` en toda la app.
SERVICES: List[Dict] = [
    {
        "id": "sliding_door_repair",
        "name_es": "Reparación de puertas corredizas de vidrio",
        "name_en": "Sliding glass door repair",
        "desc_es": "Ajuste y reparación de rieles, rodamientos, cerraduras y manijas de puertas corredizas.",
        "desc_en": "Track, roller, lock and handle adjustment and repair for sliding glass doors.",
    },
    {
        "id": "glass_replacement",
        "name_es": "Reemplazo de vidrios para puertas y ventanas",
        "name_en": "Glass replacement for doors and windows",
        "desc_es": "Reemplazo de vidrios rotos, empañados o dañados en puertas y ventanas, incluyendo vidrio de impacto.",
        "desc_en": "Replacement of broken, foggy or damaged glass in doors and windows, including impact glass.",
    },
    {
        "id": "rescreen",
        "name_es": "Servicio de reescreen (cambio de malla)",
        "name_en": "Rescreen service",
        "desc_es": "Cambio de malla/mosquitero en marcos existentes de puertas, ventanas y patios.",
        "desc_en": "Screen mesh replacement on existing frames for doors, windows and patio enclosures.",
    },
    {
        "id": "patio_door_installation",
        "name_es": "Instalación de puertas corredizas de patio",
        "name_en": "Sliding patio door installation",
        "desc_es": "Instalación completa de puertas corredizas de patio nuevas.",
        "desc_en": "Full installation of new sliding patio doors.",
    },
    {
        "id": "screen_installation",
        "name_es": "Instalación de mosquiteros para puertas y ventanas",
        "name_en": "Screen installation for doors and windows",
        "desc_es": "Instalación de mosquiteros nuevos a la medida para puertas y ventanas.",
        "desc_en": "New custom-fit screen installation for doors and windows.",
    },
]

SERVICE_BY_ID = {s["id"]: s for s in SERVICES}


def services_list_text(lang: str) -> str:
    """Texto plano con la lista numerada de servicios en el idioma dado."""
    lines = []
    for i, s in enumerate(SERVICES, start=1):
        if lang == "en":
            lines.append(f"{i}. *{s['name_en']}* — {s['desc_en']}")
        else:
            lines.append(f"{i}. *{s['name_es']}* — {s['desc_es']}")
    return "\n".join(lines)


def service_name(service_id: str, lang: str) -> str:
    service = SERVICE_BY_ID.get(service_id)
    if not service:
        return service_id
    return service["name_en"] if lang == "en" else service["name_es"]


def business_info_text(lang: str) -> str:
    if lang == "en":
        return (
            f"*{config.BUSINESS_NAME}*\n"
            f"Website: {config.BUSINESS_WEBSITE}\n"
            f"Phone: {config.BUSINESS_PHONE}\n"
            f"Email: {config.BUSINESS_EMAIL}\n"
            f"Service area: {config.SERVICE_AREA}\n"
            f"Hours: {config.BUSINESS_HOURS}"
        )
    return (
        f"*{config.BUSINESS_NAME}*\n"
        f"Sitio web: {config.BUSINESS_WEBSITE}\n"
        f"Teléfono: {config.BUSINESS_PHONE}\n"
        f"Correo: {config.BUSINESS_EMAIL}\n"
        f"Área de servicio: {config.SERVICE_AREA}\n"
        f"Horario: {config.BUSINESS_HOURS}"
    )


WELCOME_TEXT = (
    "👋 ¡Hola! Bienvenido/a a *Handy Glass & Door LLC* (HGD Sliding Door Repair).\n"
    "Hello! Welcome to *Handy Glass & Door LLC* (HGD Sliding Door Repair).\n\n"
    "¿En qué idioma prefieres continuar? / Which language would you like to continue in?\n"
    "1️⃣ Español\n"
    "2️⃣ English"
)

MAIN_MENU_TEXT = {
    "es": (
        "¿Cómo puedo ayudarte hoy?\n"
        "1. Ver servicios\n"
        "2. Agendar una cita\n"
        "3. Horario y ubicación\n"
        "4. Hablar con un representante"
    ),
    "en": (
        "How can I help you today?\n"
        "1. View services\n"
        "2. Book an appointment\n"
        "3. Hours & location\n"
        "4. Talk to a representative"
    ),
}

HUMAN_HANDOFF_TEXT = {
    "es": (
        "Perfecto, un miembro de nuestro equipo te contactará pronto. "
        f"También puedes llamarnos directamente al {config.BUSINESS_PHONE}."
    ),
    "en": (
        "Great, a member of our team will reach out to you shortly. "
        f"You can also call us directly at {config.BUSINESS_PHONE}."
    ),
}

FALLBACK_TEXT = {
    "es": "No entendí tu mensaje 🙏. Escribe *menu* para ver las opciones disponibles.",
    "en": "Sorry, I didn't understand that 🙏. Type *menu* to see the available options.",
}
