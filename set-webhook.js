import 'dotenv/config';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PUBLIC_URL = process.env.PUBLIC_URL; // ej: https://mirabel-bot.onrender.com

if (!BOT_TOKEN || !PUBLIC_URL) {
  console.error('Define TELEGRAM_BOT_TOKEN y PUBLIC_URL en tu .env antes de ejecutar este script.');
  process.exit(1);
}

const webhookUrl = `${PUBLIC_URL}/webhook/${BOT_TOKEN}`;

const res = await fetch(
  `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
);
const data = await res.json();

console.log('Respuesta de Telegram:', data);

if (data.ok) {
  console.log('\n✅ Webhook configurado correctamente en:', webhookUrl);
} else {
  console.log('\n❌ Algo falló. Revisa el token y la URL pública.');
}
