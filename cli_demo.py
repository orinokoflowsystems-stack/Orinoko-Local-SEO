"""
Demo interactiva por terminal del chatbot de Handy Glass & Door LLC,
sin necesidad de credenciales de WhatsApp Cloud API.

Uso:
    python cli_demo.py

Simula una conversación de WhatsApp: los mensajes de listas/botones se
muestran como texto numerado, y puedes responder escribiendo el número
de la opción o el texto libre.
"""
from src.conversation import OutgoingMessage, SessionStore, handle_message


def render(msg: OutgoingMessage) -> None:
    print(f"\n🤖 {msg.body}")
    if msg.kind == "buttons" and msg.buttons:
        for i, b in enumerate(msg.buttons, start=1):
            print(f"   [{i}] {b['title']} (id: {b['id']})")
    if msg.kind == "list" and msg.list_sections:
        for section in msg.list_sections:
            for i, row in enumerate(section.get("rows", []), start=1):
                print(f"   [{i}] {row['title']} (id: {row['id']})")


def main() -> None:
    print("=== Demo del ChatBot de Handy Glass & Door LLC (HGD Sliding Door Repair) ===")
    print("Escribe 'salir' para terminar la demo.\n")

    store = SessionStore()
    phone = "demo-user"
    session = store.get_or_create(phone, profile_name="Demo")

    for msg in handle_message(session, ""):
        render(msg)

    while True:
        try:
            text = input("\n🧑 Tú: ")
        except (EOFError, KeyboardInterrupt):
            break
        if text.strip().lower() in {"salir", "exit", "quit"}:
            break
        for msg in handle_message(session, text):
            render(msg)


if __name__ == "__main__":
    main()
