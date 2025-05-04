import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { UserPreferences } from '../../shared/schema';

// Inicializar clientes de API solo si las claves están disponibles
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.warn('Error al inicializar OpenAI:', error);
  }
}

if (process.env.ANTHROPIC_API_KEY) {
  try {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  } catch (error) {
    console.warn('Error al inicializar Anthropic:', error);
  }
}

// Tipo para el servicio AI que vamos a usar
export type AIModel = 'openai' | 'anthropic' | 'gemini';

// Interfaz para las respuestas del asistente
export interface AssistantResponse {
  text: string;
  suggestedResponses?: string[];
}

// Función para analizar las preferencias del usuario
export async function analyzeUserPreferences(userMessages: string[], model: AIModel = 'anthropic'): Promise<UserPreferences> {
  try {
    const systemPrompt = `
    Eres un asistente virtual especializado en perfumes. Tu tarea es analizar las respuestas del usuario
    y determinar sus preferencias para recomendarle perfumes. Extrae información sobre:
    - Género (hombre/mujer)
    - Rango de edad (18-24, 25-34, 35-44, 45+)
    - Tipos de fragancias preferidas (fresca, floral, amaderada, oriental)
    - Ocasiones de uso (diario, trabajo, citas, eventos especiales)
    - Intensidad preferida (1-4, donde 1 es ligera y 4 es muy intensa)
    - Presupuesto (rangos de precio)

    Responde con un JSON válido con estos campos.
    `;

    const userInput = userMessages.join('\n');

    let jsonResponse = '';

    if (model === 'anthropic' && anthropic !== null) {
      try {
        // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        const response = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userInput }],
        });

        if (response.content && response.content.length > 0 && 
            typeof response.content[0] === 'object' && 
            'text' in response.content[0] && 
            typeof response.content[0].text === 'string') {
          jsonResponse = response.content[0].text;
        }
      } catch (error) {
        console.warn('Error al llamar a Anthropic API:', error);
      }
    } else if (model === 'openai' && openai !== null) {
      try {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput }
          ],
          response_format: { type: 'json_object' }
        });

        jsonResponse = response.choices[0].message.content || '';
      } catch (error) {
        console.warn('Error al llamar a OpenAI API:', error);
      }
    }
    
    // Si no hay cliente disponible o no se obtuvo respuesta, usamos valores simulados
    if (!jsonResponse) {
      jsonResponse = JSON.stringify({
        gender: userMessages.join(' ').toLowerCase().includes('hombre') ? 'men' : 'women',
        ageRange: "25-34",
        fragranceTypes: ["woody", "fresh"],
        occasions: ["everyday", "work"],
        intensity: 2,
        budget: "$100-$200"
      });
    }

    // Parsear la respuesta JSON
    try {
      const preferences = JSON.parse(jsonResponse);
      return preferences as UserPreferences;
    } catch (error) {
      console.error('Error al parsear la respuesta JSON:', error);
      throw new Error('No se pudo analizar correctamente las preferencias del usuario');
    }
  } catch (error) {
    console.error('Error al analizar las preferencias del usuario:', error);
    throw error;
  }
}

// Función para generar la siguiente pregunta basada en la conversación actual
export async function generateNextQuestion(
  conversation: { role: 'user' | 'assistant'; content: string }[],
  currentStep: number,
  model: AIModel = 'anthropic'
): Promise<AssistantResponse> {
  try {
    const systemPrompt = `
    Eres ScentBot, un asistente virtual para recomendar perfumes. Estás guiando al usuario a través de preguntas 
    para determinar sus preferencias. Debes generar la siguiente pregunta basada en la conversación actual y el paso en el que estamos.
    
    Pasos de la conversación:
    1. Saludo inicial y presentación
    2. Preguntar sobre el rango de edad
    3. Preguntar sobre los tipos de fragancias preferidas
    4. Preguntar sobre las ocasiones de uso
    5. Preguntar sobre la intensidad preferida
    6. Preguntar sobre el presupuesto
    7. Mensaje de finalización

    Para cada pregunta, proporciona 4 opciones de respuesta sugeridas apropiadas para esa pregunta.
    Responde con un JSON que contenga:
    {
      "text": "La pregunta completa",
      "suggestedResponses": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"]
    }
    `;

    let jsonResponse = '';

    if (model === 'anthropic' && anthropic !== null) {
      try {
        // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        const response = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...conversation,
            { 
              role: 'user', 
              content: `Genera la siguiente pregunta para el paso ${currentStep}. Recuerda responder en formato JSON.` 
            }
          ],
        });

        if (response.content && response.content.length > 0 && 
            typeof response.content[0] === 'object' && 
            'text' in response.content[0] && 
            typeof response.content[0].text === 'string') {
          jsonResponse = response.content[0].text;
        }
      } catch (error) {
        console.warn('Error al llamar a Anthropic API:', error);
      }
    } else if (model === 'openai' && openai !== null) {
      try {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversation.map(msg => ({ role: msg.role, content: msg.content })),
            { 
              role: 'user', 
              content: `Genera la siguiente pregunta para el paso ${currentStep}. Recuerda responder en formato JSON.` 
            }
          ],
          response_format: { type: 'json_object' }
        });

        jsonResponse = response.choices[0].message.content || '';
      } catch (error) {
        console.warn('Error al llamar a OpenAI API:', error);
      }
    }
    
    // Si no hay cliente disponible o no se obtuvo respuesta, usamos valores predeterminados
    if (!jsonResponse) {
      // Preguntas predeterminadas según el paso actual
      const defaultQuestions = [
        {
          text: "¡Hola! Soy ScentBot, tu asistente virtual para encontrar el perfume perfecto. ¿Listo para comenzar?",
          suggestedResponses: ["Sí, comencemos", "¿Cómo funciona?", "Cuéntame más", "¿Puedo elegir manualmente?"]
        },
        {
          text: "Para recomendarte fragancias adecuadas, ¿podrías indicarme tu rango de edad?",
          suggestedResponses: ["18-24", "25-34", "35-44", "45+"]
        },
        {
          text: "¡Genial! ¿Qué tipo de fragancias prefieres normalmente?",
          suggestedResponses: ["Frescas", "Florales", "Amaderadas", "Orientales"]
        },
        {
          text: "¿Para qué ocasiones estás buscando este perfume principalmente?",
          suggestedResponses: ["Uso diario", "Trabajo", "Citas", "Eventos especiales"]
        },
        {
          text: "¿Qué intensidad de fragancia prefieres?",
          suggestedResponses: ["Ligera", "Media", "Fuerte", "Muy Fuerte"]
        },
        {
          text: "¿Cuál es tu presupuesto para esta fragancia?",
          suggestedResponses: ["Menos de $50", "$50-$100", "$100-$200", "Más de $200"]
        },
        {
          text: "¡Excelente! Con base en tus preferencias, estoy analizando las mejores opciones para ti. En un momento te mostraré las recomendaciones...",
          suggestedResponses: ["Ver recomendaciones", "Empezar de nuevo", "Ajustar preferencias", "Guardar preferencias"]
        }
      ];
      
      return defaultQuestions[currentStep] || defaultQuestions[0];
    }

    // Parsear la respuesta JSON
    try {
      const assistantResponse = JSON.parse(jsonResponse);
      return assistantResponse as AssistantResponse;
    } catch (error) {
      console.error('Error al parsear la respuesta JSON:', error);
      const fallback: AssistantResponse = {
        text: "Lo siento, no pude generar la siguiente pregunta. ¿Podemos continuar?",
        suggestedResponses: ["Sí, continuemos", "Prefiero intentar otra vez", "Necesito ayuda", "Salir"]
      };
      return fallback;
    }
  } catch (error) {
    console.error('Error al generar la siguiente pregunta:', error);
    throw error;
  }
}