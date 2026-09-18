"""
Configuración central del proyecto Orinoko Local SEO.

Todos los valores se leen de variables de entorno para no exponer
credenciales en el código fuente. Ver `.env.example` para la lista
completa de variables soportadas.
"""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Config:
    """Configuración compartida por los distintos módulos del proyecto."""

    # --- Google APIs (usado por src/google_api.py) ---
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
    GOOGLE_BUSINESS_ACCOUNT_ID = os.getenv("GOOGLE_BUSINESS_ACCOUNT_ID", "")
    TARGET_SERVICE = os.getenv("TARGET_SERVICE", "sliding glass door repair")

    # --- WhatsApp Cloud API (Meta) ---
    WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
    WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
    WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "handyglass-verify-token")
    WHATSAPP_API_VERSION = os.getenv("WHATSAPP_API_VERSION", "v20.0")
    WHATSAPP_APP_SECRET = os.getenv("WHATSAPP_APP_SECRET", "")

    # --- Datos del negocio: Handy Glass & Door LLC / HGD Sliding Door Repair ---
    BUSINESS_NAME = os.getenv("BUSINESS_NAME", "Handy Glass & Door LLC (HGD Sliding Door Repair)")
    BUSINESS_WEBSITE = os.getenv("BUSINESS_WEBSITE", "https://hgdslidingdoor-repair.com")
    BUSINESS_PHONE = os.getenv("BUSINESS_PHONE", "+1-000-000-0000")
    BUSINESS_EMAIL = os.getenv("BUSINESS_EMAIL", "info@hgdslidingdoor-repair.com")
    BUSINESS_ADDRESS = os.getenv("BUSINESS_ADDRESS", "South Florida, USA (servicio a domicilio)")
    BUSINESS_HOURS = os.getenv(
        "BUSINESS_HOURS",
        "Lunes a Sábado, 8:00 AM - 6:00 PM / Mon-Sat, 8:00 AM - 6:00 PM",
    )
    SERVICE_AREA = os.getenv("SERVICE_AREA", "South Florida y áreas cercanas")

    # --- Persistencia de citas/leads del chatbot ---
    APPOINTMENTS_DB_PATH = os.getenv("APPOINTMENTS_DB_PATH", "data/appointments.db")

    # --- Notificaciones internas (opcional) ---
    NOTIFY_PHONE_NUMBER = os.getenv("NOTIFY_PHONE_NUMBER", "")


config = Config()
