"""
Servidor del chatbot de WhatsApp para Handy Glass & Door LLC (HGD Sliding
Door Repair). Expone el webhook que consume la WhatsApp Cloud API (Meta)
y conecta los mensajes entrantes con el motor de conversación.

Ejecutar localmente:
    pip install -r requirements.txt
    python app.py

Luego expón el puerto (por ejemplo con ngrok) y registra la URL
`https://<tu-dominio>/webhook` como webhook de WhatsApp en Meta for
Developers, usando WHATSAPP_VERIFY_TOKEN como verify token.
"""
import os

from flask import Flask, jsonify, request

from config import config
from src.appointments import list_appointments
from src.conversation import Session, SessionStore, handle_message
from src.logger import setup_logger
from src.whatsapp_client import WhatsAppClient, extract_incoming_message

logger = setup_logger(__name__)

app = Flask(__name__)
whatsapp = WhatsAppClient()
sessions = SessionStore()


def _dispatch(to: str, messages: list) -> None:
    for msg in messages:
        if msg.kind == "text":
            whatsapp.send_text(to, msg.body)
        elif msg.kind == "buttons":
            whatsapp.send_buttons(to, msg.body, msg.buttons or [])
        elif msg.kind == "list":
            whatsapp.send_list(to, msg.body, msg.list_button_text or "Menu", msg.list_sections or [])
        else:
            logger.warning(f"Tipo de mensaje saliente desconocido: {msg.kind}")


@app.get("/")
def health():
    return jsonify({"status": "ok", "service": "handy-glass-whatsapp-chatbot"})


@app.get("/webhook")
def verify_webhook():
    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode == "subscribe" and token == config.WHATSAPP_VERIFY_TOKEN:
        logger.info("Webhook verificado correctamente por Meta")
        return challenge or "", 200
    logger.warning("Falló la verificación del webhook (token inválido)")
    return "Forbidden", 403


@app.post("/webhook")
def receive_webhook():
    signature = request.headers.get("X-Hub-Signature-256")
    if not WhatsAppClient.verify_webhook_signature(config.WHATSAPP_APP_SECRET, request.get_data(), signature):
        logger.warning("Firma de webhook inválida, solicitud rechazada")
        return "Forbidden", 403

    payload = request.get_json(silent=True) or {}
    incoming = extract_incoming_message(payload)
    if incoming is None:
        # Puede ser un evento de estado (delivered/read) sin mensaje; se ignora.
        return jsonify({"status": "ignored"}), 200

    session: Session = sessions.get_or_create(incoming["from"], incoming.get("profile_name", ""))
    outgoing = handle_message(session, incoming["text"])

    whatsapp.mark_as_read(incoming["message_id"])
    _dispatch(incoming["from"], outgoing)

    return jsonify({"status": "processed"}), 200


@app.get("/admin/appointments")
def admin_appointments():
    """Endpoint de solo lectura para que el negocio consulte las citas capturadas."""
    admin_token = os.getenv("ADMIN_TOKEN", "")
    if admin_token and request.args.get("token") != admin_token:
        return "Forbidden", 403

    rows = list_appointments(request.args.get("whatsapp_number"))
    return jsonify([dict(row) for row in rows])


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
