import 'dotenv/config';
import express from 'express';
import { Bot, webhookCallback } from 'grammy';
import { loadKnowledgeBase } from './knowledge.js';
import { askGemini } from './gemini.js';
import { logInteraction } from './logger.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('Falta TELEGRAM_BOT_TOKEN en las variables de entorno. Revisa tu archivo .env');
  process.exit(1);
}

// Carga el prompt del sistema + los dos documentos una sola vez al iniciar el servidor.
const knowledgeBase = loadKnowledgeBase();

const bot = new Bot(BOT_TOKEN);

bot.command('start', (ctx) => {
  ctx.reply(
    'Hola 👋 Soy el asistente virtual de la copropiedad Mirabel.\n\n' +
    'Puedes preguntarme sobre parqueaderos, mascotas, ruido, cuotas, zonas comunes o asambleas.\n\n' +
    'Escribe tu pregunta como si le hablaras a un vecino, por ejemplo:\n' +
    '"¿Puedo tener un perro grande en mi apartamento?"'
  );
});

bot.command('ayuda', (ctx) => {
  ctx.reply(
    'Solo tienes que escribirme tu duda directamente, sin comandos.\n\n' +
    'Si en algún momento la respuesta no es suficiente, siempre puedes contactar directamente a la Administración.'
  );
});

/**
 * Divide un texto largo en partes que no superen `limite` caracteres,
 * intentando cortar en saltos de párrafo para no partir frases a la mitad.
 */
function partirEnPartes(texto, limite) {
  const partes = [];
  let restante = texto;

  while (restante.length > limite) {
    // Busca el último salto de párrafo antes del límite.
    let corte = restante.lastIndexOf('\n\n', limite);
    // Si no hay párrafo, busca el último salto de línea.
    if (corte === -1 || corte < limite / 2) corte = restante.lastIndexOf('\n', limite);
    // Si tampoco hay, corta en el espacio más cercano al límite.
    if (corte === -1 || corte < limite / 2) corte = restante.lastIndexOf(' ', limite);
    // Último recurso: corta exacto en el límite.
    if (corte === -1) corte = limite;

    partes.push(restante.slice(0, corte).trim());
    restante = restante.slice(corte).trim();
  }

  if (restante.length > 0) partes.push(restante);
  return partes;
}

bot.on('message:text', async (ctx) => {
  const pregunta = ctx.message.text.trim();

  if (!pregunta) return;

  await ctx.replyWithChatAction('typing');

  try {
    const respuesta = await askGemini({
      systemPrompt: knowledgeBase.systemPrompt,
      manual: knowledgeBase.manual,
      reglamento: knowledgeBase.reglamento,
      pregunta,
    });

    // Telegram acepta máximo 4096 caracteres por mensaje.
    // Si la respuesta es más larga, la partimos en trozos respetando párrafos.
    const LIMITE = 4000; // margen de seguridad de 96 caracteres
    if (respuesta.length <= LIMITE) {
      await ctx.reply(respuesta);
    } else {
      const partes = partirEnPartes(respuesta, LIMITE);
      for (const parte of partes) {
        await ctx.reply(parte);
      }
    }

    // El registro nunca debe romper la respuesta al usuario si falla.
    logInteraction({
      usuario: ctx.from?.username || ctx.from?.first_name || 'desconocido',
      pregunta,
      respuesta,
    }).catch((err) => console.error('No se pudo registrar en la bitácora:', err.message));
  } catch (err) {
    console.error('Error al consultar el modelo de IA:', err);
    await ctx.reply(
      'Lo siento, tuve un problema para procesar tu pregunta. Por favor intenta de nuevo en un momento, o eleva tu consulta directamente a la Administración.'
    );
  }
});

bot.catch((err) => {
  console.error('Error no controlado del bot:', err);
});

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Asistente Mirabel activo.');
});

// El token dentro de la ruta evita que alguien más "adivine" el endpoint del webhook.
app.use(`/webhook/${BOT_TOKEN}`, webhookCallback(bot, 'express'));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});