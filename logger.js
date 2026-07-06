const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;

/**
 * Envía cada pregunta/respuesta a una hoja de Google Sheets a través de un
 * Web App de Google Apps Script (ver apps-script/Code.gs).
 * Si no se configura SHEETS_WEBHOOK_URL, el registro simplemente se omite
 * sin afectar el funcionamiento del bot.
 */
export async function logInteraction({ usuario, pregunta, respuesta }) {
  if (!SHEETS_WEBHOOK_URL) return;

  await fetch(SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fecha: new Date().toISOString(),
      usuario,
      pregunta,
      respuesta,
    }),
  });
}
