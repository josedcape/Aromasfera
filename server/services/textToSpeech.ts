import * as textToSpeech from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';

// Crea un cliente de Text-to-Speech
const client = new textToSpeech.TextToSpeechClient();

/**
 * Convierte texto a voz y guarda el resultado como un archivo de audio
 * @param text Texto a convertir en voz
 * @param outputFileName Nombre del archivo de salida (sin extensión)
 * @param languageCode Código del idioma (por defecto es español)
 * @returns Ruta al archivo de audio generado
 */
export async function textToSpeechConverter(
  text: string,
  outputFileName: string,
  languageCode: string = 'es-ES'
): Promise<string> {
  try {
    // Construye la solicitud
    const request = {
      input: { text },
      // Selecciona la voz y el idioma
      voice: {
        languageCode,
        ssmlGender: 'FEMALE' as const,
        name: languageCode === 'es-ES' ? 'es-ES-Standard-A' : 'en-US-Standard-C',
      },
      // Selecciona el tipo de audio
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    // Realiza la solicitud
    const [response] = await client.synthesizeSpeech(request);

    // Asegúrate de que el directorio de salida exista
    const outputDir = path.join(process.cwd(), 'server/public/audio');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Crea la ruta completa del archivo de salida
    const outputFile = path.join(outputDir, `${outputFileName}.mp3`);

    // Escribe el audio en el archivo
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFile, response.audioContent as Buffer, 'binary');

    // Retorna la ruta relativa para ser servida estáticamente
    return `/audio/${outputFileName}.mp3`;
  } catch (error) {
    console.error('Error en la conversión de texto a voz:', error);
    throw error;
  }
}