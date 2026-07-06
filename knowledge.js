import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, '..', 'docs');

function readDoc(filename) {
  const filePath = path.join(DOCS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`Aviso: no se encontró "${filename}" en /docs. El asistente responderá sin ese documento.`);
    return '';
  }

  return fs.readFileSync(filePath, 'utf-8');
}

export function loadKnowledgeBase() {
  const systemPrompt = readDoc('prompt_asistente_mirabel.md');
  const manual = readDoc('manual_convivencia.md');
  const reglamento = readDoc('reglamento_propiedad_horizontal.md');

  if (!systemPrompt) {
    throw new Error(
      'No se encontró prompt_asistente_mirabel.md en /docs. El asistente no puede iniciar sin sus instrucciones.'
    );
  }

  console.log('Base de conocimiento cargada:');
  console.log(`  - prompt_asistente_mirabel.md: ${systemPrompt.length} caracteres`);
  console.log(`  - manual_convivencia.md: ${manual.length} caracteres`);
  console.log(`  - reglamento_propiedad_horizontal.md: ${reglamento.length} caracteres`);

  return { systemPrompt, manual, reglamento };
}
