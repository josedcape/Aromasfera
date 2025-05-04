import { UserPreferences } from './utils';
import { apiRequest } from './queryClient';

/**
 * Interfaz para las respuestas del asistente
 */
export interface AssistantResponse {
  text: string;
  suggestedResponses?: string[];
  audioUrl?: string;
}

/**
 * Interfaz para los mensajes de la conversación
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Envía un mensaje al asistente virtual y obtiene una respuesta
 * @param conversation Historia de la conversación
 * @param currentStep Paso actual en el flujo de la conversación
 * @returns Respuesta del asistente
 */
export async function sendMessageToAssistant(
  conversation: ConversationMessage[],
  currentStep: number
): Promise<AssistantResponse> {
  try {
    const response = await apiRequest({
      url: '/api/assistant/message',
      method: 'POST',
      body: {
        conversation,
        currentStep
      },
    });

    return response as AssistantResponse;
  } catch (error) {
    console.error('Error al enviar mensaje al asistente:', error);
    throw error;
  }
}

/**
 * Analiza las preferencias del usuario basadas en la conversación
 * @param messages Mensajes de la conversación
 * @returns Preferencias del usuario
 */
export async function analyzeUserPreferences(
  messages: ConversationMessage[]
): Promise<UserPreferences> {
  try {
    const response = await apiRequest({
      url: '/api/assistant/analyze',
      method: 'POST',
      body: {
        messages
      },
    });

    return response as UserPreferences;
  } catch (error) {
    console.error('Error al analizar preferencias del usuario:', error);
    throw error;
  }
}

/**
 * Convierte texto a voz
 * @param text Texto a convertir
 * @param language Idioma (es-ES por defecto)
 * @returns URL del archivo de audio
 */
export async function textToSpeech(
  text: string,
  language: string = 'es-ES'
): Promise<string> {
  try {
    const response = await apiRequest({
      url: '/api/assistant/speak',
      method: 'POST',
      body: {
        text,
        language
      },
    });

    const typedResponse = response as { audioUrl: string };
    return typedResponse.audioUrl;
  } catch (error) {
    console.error('Error al convertir texto a voz:', error);
    throw error;
  }
}