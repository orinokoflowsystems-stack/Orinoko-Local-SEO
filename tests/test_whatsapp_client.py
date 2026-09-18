import hashlib
import hmac

from src.whatsapp_client import WhatsAppClient, extract_incoming_message


def test_extract_incoming_text_message():
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "contacts": [{"profile": {"name": "Ana"}}],
                            "messages": [
                                {
                                    "from": "13051234567",
                                    "id": "wamid.123",
                                    "type": "text",
                                    "text": {"body": "Hola"},
                                }
                            ],
                        }
                    }
                ]
            }
        ]
    }
    result = extract_incoming_message(payload)
    assert result == {
        "from": "13051234567",
        "message_id": "wamid.123",
        "text": "Hola",
        "profile_name": "Ana",
    }


def test_extract_incoming_button_reply():
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "messages": [
                                {
                                    "from": "13051234567",
                                    "id": "wamid.456",
                                    "type": "interactive",
                                    "interactive": {
                                        "type": "list_reply",
                                        "list_reply": {"id": "menu_book", "title": "Book"},
                                    },
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
    result = extract_incoming_message(payload)
    assert result["text"] == "menu_book"


def test_extract_status_update_returns_none():
    payload = {"entry": [{"changes": [{"value": {"statuses": [{"status": "delivered"}]}}]}]}
    assert extract_incoming_message(payload) is None


def test_verify_webhook_signature_valid():
    secret = "s3cr3t"
    body = b'{"hello":"world"}'
    signature = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    assert WhatsAppClient.verify_webhook_signature(secret, body, signature) is True


def test_verify_webhook_signature_invalid():
    secret = "s3cr3t"
    body = b'{"hello":"world"}'
    assert WhatsAppClient.verify_webhook_signature(secret, body, "sha256=deadbeef") is False


def test_verify_webhook_signature_missing_header():
    assert WhatsAppClient.verify_webhook_signature("s3cr3t", b"{}", None) is False
