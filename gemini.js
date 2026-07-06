const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function askGemini({ systemPrompt, manual, reglamento, pregunta }) {
  if (!GEMINI_API_KEY) {
    throw new Error('Falta GEMINI_API_KEY en las variables de entorno.');
  }

  // Se inyectan los documentos completos como parte de las instrucciones del sistema,
  // no como mensajes separados, para que el modelo los trate como fuente de verdad fija.
  const instrucciones = [
    systemPrompt,
    '\n\n# DOCUMENTO 1: MANUAL DE CONVIVENCIA\n',
    manual || '(documento no cargado todavía)',
    '\n\n# DOCUMENTO 2: REGLAMENTO DE PROPIEDAD HORIZONTAL\n',
    reglamento || '(documento no cargado todavía)',
  ].join('\n');

  const body = {
    system_instruction: {
      parts: [{ text: instrucciones }],
    },
    contents: [{ role: 'user', parts: [{ text: pregunta }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 800,
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error de la API de Gemini (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!texto) {
    throw new Error('La respuesta de Gemini no tuvo el formato esperado: ' + JSON.stringify(data));
  }

  return texto.trim();
}
