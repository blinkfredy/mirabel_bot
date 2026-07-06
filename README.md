# Asistente Mirabel

Bot de Telegram que responde preguntas de copropietarios, residentes e inquilinos usando únicamente el manual de convivencia y el reglamento de propiedad horizontal de la copropiedad, apoyado en el modelo gratuito Gemini 2.5 Flash.

## Cómo funciona

1. El residente escribe una pregunta por Telegram.
2. El servidor arma un solo mensaje para la IA: el prompt de comportamiento + el manual completo + el reglamento completo + la pregunta.
3. Gemini responde basándose únicamente en esos documentos.
4. La respuesta se envía al residente y (opcionalmente) se guarda en una hoja de Google Sheets.

No se usa base de datos vectorial ni "chunking": los documentos se inyectan completos en cada consulta. Esto es más simple y más preciso mientras el reglamento quepa dentro del límite de contexto del modelo (1 millón de tokens en Gemini 2.5 Flash, muchísimo más de lo que ocupan estos dos documentos).

## Paso 1 — Reemplaza los documentos reales

Este proyecto trae marcadores de posición. Antes de correrlo, reemplaza:

- `docs/manual_convivencia.md`
- `docs/reglamento_propiedad_horizontal.md`

con el contenido real (puedes simplemente copiar y pegar el Markdown que ya tienes). El archivo `docs/prompt_asistente_mirabel.md` ya viene con tu prompt actual — no necesitas tocarlo salvo que quieras ajustarlo.

## Paso 2 — Crea el bot de Telegram

1. Abre Telegram y busca **@BotFather**.
2. Envía `/newbot` y sigue las instrucciones (nombre y username del bot).
3. BotFather te entrega un **token** — cópialo, lo necesitas en el siguiente paso.

## Paso 3 — Obtén tu llave gratuita de Gemini

1. Entra a [Google AI Studio](https://aistudio.google.com/apikey) con tu cuenta de Google.
2. Genera una API key (no pide tarjeta de crédito).
3. Guárdala — la capa gratuita tiene un límite diario de solicitudes, más que suficiente para una copropiedad.

## Paso 4 — Configura las variables de entorno

Copia `.env.example` a `.env` y llena:

```
TELEGRAM_BOT_TOKEN=el_token_de_botfather
GEMINI_API_KEY=tu_llave_de_gemini
PUBLIC_URL=              # lo llenas después de desplegar (paso 6)
SHEETS_WEBHOOK_URL=      # opcional, ver paso 7
```

## Paso 5 — Prueba localmente (opcional)

```bash
npm install
npm start
```

El servidor queda escuchando en `http://localhost:3000`, pero Telegram necesita una URL **pública** para enviarle mensajes (webhook), así que para probar de verdad necesitas desplegarlo (paso 6) o usar una herramienta como `ngrok` para exponer tu máquina temporalmente.

## Paso 6 — Despliega gratis en Render

1. Sube este proyecto a un repositorio de GitHub.
2. En [render.com](https://render.com), crea un **Web Service** nuevo apuntando a ese repositorio.
3. Configura:
   - Build command: `npm install`
   - Start command: `npm start`
4. Agrega las variables de entorno (`TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`, etc.) en la sección Environment de Render.
5. Una vez desplegado, Render te da una URL pública, por ejemplo `https://mirabel-bot.onrender.com`. Ponla como `PUBLIC_URL` en tus variables de entorno (tanto en Render como en tu `.env` local).

> Nota: el plan gratuito de Render "duerme" el servicio tras 15 minutos sin tráfico. El primer mensaje después de un rato de inactividad puede tardar unos segundos más en responder — normal en un MVP gratuito.

## Paso 7 — Conecta el webhook de Telegram

Con `PUBLIC_URL` ya configurado, ejecuta (localmente, una sola vez):

```bash
npm run set-webhook
```

Esto le dice a Telegram dónde enviar los mensajes de tus usuarios. Si todo salió bien verás `✅ Webhook configurado correctamente`.

## Paso 8 — Registro de conversaciones en Google Sheets (opcional pero recomendado)

1. Crea una hoja de cálculo nueva en Google Sheets.
2. Extensiones > Apps Script.
3. Pega el contenido de `apps-script/Code.gs`.
4. Implementar > Nueva implementación > Aplicación web, con acceso "Cualquier usuario".
5. Copia la URL que te entrega y ponla como `SHEETS_WEBHOOK_URL` en Render y en tu `.env`.

Desde ahí, cada pregunta y respuesta queda en la hoja "Registro" — útil para que la Administración detecte qué preguntas no se pudieron responder y así sepa qué actualizar en el manual o el reglamento.

## Estructura del proyecto

```
mirabel-bot/
├── docs/
│   ├── prompt_asistente_mirabel.md   ← comportamiento del asistente
│   ├── manual_convivencia.md         ← reemplázalo con el real
│   └── reglamento_propiedad_horizontal.md  ← reemplázalo con el real
├── src/
│   ├── server.js       ← servidor web + lógica del bot
│   ├── knowledge.js     ← carga los documentos al iniciar
│   ├── gemini.js        ← llamada a la API de Gemini
│   ├── logger.js         ← registro opcional en Sheets
│   └── set-webhook.js   ← script para conectar Telegram
├── apps-script/
│   └── Code.gs           ← pega esto en Google Apps Script
├── .env.example
└── package.json
```

## Siguientes pasos sugeridos (Fase 2 del plan)

- Agregar un menú de botones (`bot.command` con teclados de Telegram) para las categorías más frecuentes, para que los adultos mayores no tengan que escribir texto libre.
- Simplificar el formato de respuesta de 4 secciones a algo más corto para lectura rápida en el celular.
- Agregar reacciones 👍/👎 después de cada respuesta para medir satisfacción.
