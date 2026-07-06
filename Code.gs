/**
 * Pega este código en script.google.com dentro de un proyecto vinculado
 * a la hoja de cálculo donde quieres guardar el historial del asistente.
 *
 * Pasos:
 * 1. Crea una hoja de cálculo nueva en Google Sheets.
 * 2. Extensiones > Apps Script.
 * 3. Borra el contenido de Code.gs y pega este archivo completo.
 * 4. Implementar > Nueva implementación > Tipo: Aplicación web.
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier usuario
 * 5. Copia la URL de la aplicación web y ponla en SHEETS_WEBHOOK_URL (.env)
 */

function doPost(e) {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registro') ||
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('Registro');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha', 'Usuario', 'Pregunta', 'Respuesta']);
  }

  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.fecha, data.usuario, data.pregunta, data.respuesta]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}
