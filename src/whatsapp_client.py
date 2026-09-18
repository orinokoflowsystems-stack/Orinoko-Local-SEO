"""
Cliente para la API de WhatsApp Cloud (Meta) usado por el chatbot de
Handy Glass & Door LLC / HGD Sliding Door Repair.

Encapsula el envío de mensajes de texto, botones interactivos y listas,
además de la verificación de firma del webhook.
"""
import hashlib
import hmac
from typing import Dict, List, Optional

import requests

from config import config
from src.logger import setup_logger

logger = setup_logger(__name__)


class WhatsAppClient:
    """Envía y valida mensajes usando la WhatsApp Business Cloud API."""

    def __init__(self):
        self.token = config.WHATSAPP_TOKEN
        self.phone_number_id = config.WHATSAPP_PHONE_NUMBER_ID
        self.api_version = config.WHATSAPP_API_VERSION
        self.base_url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def _post(self, payload: Dict) -> bool:
        try:
            response = requests.post(self.base_url, json=payload, headers=self.headers, timeout=10)
            response.raise_for_status()
            logger.info(f"Mensaje enviado a {payload.get('to')}")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al enviar mensaje de WhatsApp: {e}")
            return False

    def send_text(self, to: str, body: str) -> bool:
        """Envía un mensaje de texto simple."""
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"preview_url": False, "body": body},
        }
        return self._post(payload)

    def send_buttons(self, to: str, body: str, buttons: List[Dict[str, str]]) -> bool:
        """
        Envía un mensaje con botones de respuesta rápida.
        `buttons` es una lista de hasta 3 dicts: {"id": "...", "title": "..."}
        """
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": body},
                "action": {
                    "buttons": [
                        {"type": "reply", "reply": {"id": b["id"], "title": b["title"]}}
                        for b in buttons[:3]
                    ]
                },
            },
        }
        return self._post(payload)

    def send_list(self, to: str, body: str, button_text: str, sections: List[Dict]) -> bool:
        """Envía un mensaje de lista interactiva (menú de opciones)."""
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "list",
                "body": {"text": body},
                "action": {"button": button_text, "sections": sections},
            },
        }
        return self._post(payload)

    def mark_as_read(self, message_id: str) -> bool:
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id,
        }
        return self._post(payload)

    @staticmethod
    def verify_webhook_signature(app_secret: str, payload_body: bytes, signature_header: Optional[str]) -> bool:
        """
        Valida el header `X-Hub-Signature-256` que Meta envía con cada
        notificación de webhook, para asegurar que el request proviene de
        WhatsApp/Meta y no de un tercero.
        """
        if not app_secret:
            # Sin app secret configurado no se puede validar; se deja pasar
            # solo en entornos de desarrollo (advertido en el log).
            logger.warning("WHATSAPP_APP_SECRET no configurado: se omite verificación de firma")
            return True
        if not signature_header or not signature_header.startswith("sha256="):
            return False
        expected = hmac.new(app_secret.encode(), payload_body, hashlib.sha256).hexdigest()
        received = signature_header.split("sha256=", 1)[1]
        return hmac.compare_digest(expected, received)


def extract_incoming_message(webhook_payload: Dict) -> Optional[Dict]:
    """
    Extrae el primer mensaje entrante de un payload de webhook de WhatsApp,
    normalizando texto simple e interacciones de botón/lista a un solo
    formato: {"from": str, "message_id": str, "text": str, "profile_name": str}
    """
    try:
        entry = webhook_payload["entry"][0]
        change = entry["changes"][0]["value"]
        messages = change.get("messages")
        if not messages:
            return None
        message = messages[0]
        contacts = change.get("contacts", [])
        profile_name = contacts[0]["profile"]["name"] if contacts else ""

        msg_type = message.get("type")
        text = ""
        if msg_type == "text":
            text = message["text"]["body"]
        elif msg_type == "interactive":
            interactive = message["interactive"]
            if interactive.get("type") == "button_reply":
                text = interactive["button_reply"]["id"]
            elif interactive.get("type") == "list_reply":
                text = interactive["list_reply"]["id"]

        return {
            "from": message["from"],
            "message_id": message["id"],
            "text": text.strip(),
            "profile_name": profile_name,
        }
    except (KeyError, IndexError, TypeError):
        return None
