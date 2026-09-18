# Orinoko-Local-SEO

Repository name: orinoko-local-seo
Description: "Agente de Marketing SEO inteligente para posicionamiento en Google Business Profiles - Servicios locales de reparación de puertas corredizas de Patio e Instalación de Vidrios."

## ChatBot de WhatsApp — Handy Glass & Door LLC

Mini aplicación funcional de ChatBot inteligente y **bilingüe (Español/English)**
integrado a WhatsApp para **Handy Glass & Door LLC** (HGD Sliding Door Repair —
https://hgdslidingdoor-repair.com). El bot captura leads y agenda citas para:

1. Reparación de puertas corredizas de vidrio.
2. Reemplazo de vidrios para puertas y ventanas.
3. Servicio de reescreen (cambio de malla).
4. Instalación de puertas corredizas de patio.
5. Instalación de mosquiteros para puertas y ventanas.

### Arquitectura

```
config.py                  Configuración central (variables de entorno)
app.py                      Servidor Flask: webhook de WhatsApp Cloud API
cli_demo.py                 Demo por terminal, sin credenciales de WhatsApp
src/
  logger.py                 Logging compartido
  whatsapp_client.py         Cliente de WhatsApp Cloud API (envío + verificación de firma)
  knowledge_base.py          Catálogo de servicios y textos bilingües
  conversation.py            Máquina de estados de la conversación
  appointments.py            Persistencia de citas/leads (SQLite)
  google_api.py               Integración con Google Business Profile / Maps
tests/                      Pruebas automatizadas (pytest)
```

El motor de conversación (`src/conversation.py`) es independiente del
transporte: recibe texto (o el id de un botón/lista) y devuelve mensajes
de salida. Esto permite reutilizarlo tanto desde el webhook real de
WhatsApp (`app.py`) como desde la demo de terminal (`cli_demo.py`).

### Flujo de la conversación

1. Saludo bilingüe y selección de idioma (Español/English).
2. Menú principal: ver servicios, agendar cita, horario y ubicación, o
   hablar con un representante.
3. Flujo de agendamiento: servicio → nombre → dirección → fecha → horario
   preferido → notas → confirmación.
4. Al confirmar, la cita se guarda en SQLite con un folio único y el
   cliente recibe confirmación inmediata por WhatsApp.
5. Comandos globales disponibles en cualquier punto: `menu` (reinicia al
   menú principal) y `agente` / `agent` (deriva a un humano).

### Instalación

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # completa tus credenciales y datos del negocio
```

### Probar sin credenciales de WhatsApp (demo por terminal)

```bash
python cli_demo.py
```

### Ejecutar el servidor del webhook

```bash
python app.py
```

Para recibir mensajes reales de WhatsApp:

1. Crea una app de tipo "Business" en https://developers.facebook.com/apps
   y agrega el producto **WhatsApp**.
2. Expón tu servidor local (por ejemplo con `ngrok http 5000`).
3. En **WhatsApp > Configuration**, registra la URL de callback
   `https://<tu-dominio>/webhook` y usa el valor de `WHATSAPP_VERIFY_TOKEN`
   (definido en `.env`) como *Verify token*. Suscríbete al campo `messages`.
4. Copia el *Temporary access token* (o un token permanente de un System
   User) a `WHATSAPP_TOKEN`, y el *Phone number ID* a `WHATSAPP_PHONE_NUMBER_ID`.
5. (Recomendado) Copia el *App Secret* a `WHATSAPP_APP_SECRET` para que el
   webhook valide la firma `X-Hub-Signature-256` de cada solicitud.

### Consultar las citas capturadas

```bash
curl "http://localhost:5000/admin/appointments?token=$ADMIN_TOKEN"
```

Si `ADMIN_TOKEN` no está configurado, el endpoint queda abierto — se
recomienda definirlo en producción, o exponerlo solo dentro de una red
privada.

### Pruebas

```bash
pytest
```

### Notas

- Los datos de contacto/horario del negocio (teléfono, correo, horario,
  área de servicio) se configuran vía variables de entorno en `.env` —
  actualízalos con la información real de Handy Glass & Door LLC.
- La base de datos de citas (`data/appointments.db`, SQLite) es local y
  no se versiona en git.
- Este chatbot no requiere servicios de pago adicionales: usa WhatsApp
  Cloud API (gratuita hasta cierto volumen de conversaciones) y SQLite
  para persistencia.
