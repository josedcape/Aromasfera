import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { UserPreferences } from '../../shared/schema';
import { readFile } from 'fs/promises';
import path from 'path';

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
  memoryUpdate?: any;
}

// Memoria persistente para el usuario
let userMemory: {
  conversationHistory: Array<{role: string, content: string, timestamp: string}>;
  preferences: UserPreferences | null;
  previousInteractions: Array<{date: string, purchases: string[], queries: string[]}>;
  stage: 'initial' | 'expert' | 'recommendation';
} = {
  conversationHistory: [],
  preferences: null,
  previousInteractions: [],
  stage: 'initial'
};

// Función para cargar documentos de conocimiento
async function loadKnowledgeBase(documentName: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'knowledge', `${documentName}.md`);
    const content = await readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.warn(`Error al cargar documento ${documentName}:`, error);
    return '';
  }
}

// Función para analizar las preferencias del usuario
export async function analyzeUserPreferences(userMessages: string[], model: AIModel = 'anthropic'): Promise<UserPreferences> {
  try {
    const systemPrompt = `
    Eres Sfera un asistente virtual especializado en la recomendacion de perfumes. Tu tarea es analizar las respuestas del usuario y encontrar patrones para
    determinar sus preferencias para recomendarle perfumes. Extrae información sobre:
    - Género (hombre/mujer/unisex)
    - Rango de edad aproximado
    - Tipos de fragancias preferidas (fresca, floral, amaderada, oriental, etc.)
    - Ocasiones de uso (diario, trabajo, eventos especiales, etc.)
    - Intensidad preferida (ligera, media, fuerte)
    - Presupuesto (si se menciona)
    - Marcas favoritas (si se mencionan)
    - Notas olfativas preferidas (si se mencionan)
    - Estaciones del año preferidas para usar perfumes

    Responde con un JSON válido con estos campos, dejando vacíos los que no puedas determinar.
    `;

    const userInput = userMessages.join('\n');

    let jsonResponse = '';

    if (model === 'anthropic' && anthropic !== null) {
      try {
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
        intensity: "medium",
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
    // Actualizar historial de conversación si es necesario
    for (const msg of conversation) {
      if (!userMemory.conversationHistory.some(m => m.content === msg.content)) {
        userMemory.conversationHistory.push({
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Decidir qué asistente usar basado en la etapa actual
    if (userMemory.stage === 'initial' && currentStep < 4) {
      return initialAssistant(conversation[conversation.length - 1]?.content || "", currentStep, model);
    } else {
      userMemory.stage = 'expert';
      return expertAssistant(conversation[conversation.length - 1]?.content || "", model);
    }
  } catch (error) {
    console.error('Error al generar la siguiente pregunta:', error);

    // Respuesta de fallback en caso de error
    const fallback: AssistantResponse = {
      text: "Lo siento, estoy teniendo problemas para procesar tu solicitud. ¿Podrías intentar de nuevo o reformular tu pregunta?",
      suggestedResponses: ["Intentar de nuevo", "Hablar con un asesor humano", "Ver catálogo de perfumes", "Empezar de nuevo"]
    };

    return fallback;
  }
}

// Función para el asistente inicial (flujo guiado)
async function initialAssistant(
  userMessage: string,
  currentStep: number,
  model: AIModel = 'anthropic'
): Promise<AssistantResponse> {
  try {
    // Actualizar historial de conversación si no está ya incluido
    if (userMessage && !userMemory.conversationHistory.some(msg => msg.content === userMessage && msg.role === 'user')) {
      const timestamp = new Date().toISOString();
      userMemory.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp
      });
    }

    const systemPrompt = `
    Eres Sfera, un asistente virtual especializado en perfumería de la marca AromaSfera, "perfumería que aviva tus sentidos". 
    Estás en la fase inicial de una conversación donde necesitas recopilar información básica del cliente de forma amable y profesional.

    Tu objetivo es hacer SOLO UNA de las siguientes preguntas en orden, dependiendo del paso actual:

    Paso 1: Saludo cálido y profesional. Preséntate como Sfera de AromaSfera y pregunta cómo puedes ayudar hoy.

    Paso 2: Pregunta sobre sus preferencias de fragancia (tipos que le gustan como florales, amaderadas, cítricas, orientales).

    Paso 3: Pregunta sobre el uso principal que le dará al perfume (trabajo, eventos especiales, uso diario, etc.)

    Después del paso 3, indica que pasarás la conversación a un especialista en fragancias para una atención más personalizada.

    Mantén un tono profesional pero cercano. No hagas más de una pregunta a la vez.
    Incluye 3-4 opciones de respuesta sugeridas que sean naturales y conversacionales.
    `;

    let response = '';

    if (model === 'anthropic' && anthropic !== null) {
      try {
        const anthropicResponse = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...userMemory.conversationHistory.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: `Estamos en el paso ${currentStep}. Responde al mensaje del usuario: "${userMessage}"`
            }
          ],
        });

        if (anthropicResponse.content && anthropicResponse.content.length > 0 && 
            typeof anthropicResponse.content[0] === 'object' && 
            'text' in anthropicResponse.content[0] && 
            typeof anthropicResponse.content[0].text === 'string') {
          response = anthropicResponse.content[0].text;
        }
      } catch (error) {
        console.warn('Error al llamar a Anthropic API:', error);
      }
    } else if (model === 'openai' && openai !== null) {
      try {
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...userMemory.conversationHistory.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: `Estamos en el paso ${currentStep}. Responde al mensaje del usuario: "${userMessage}"`
            }
          ]
        });

        response = openaiResponse.choices[0].message.content || '';
      } catch (error) {
        console.warn('Error al llamar a OpenAI API:', error);
      }
    }

    // Si no hay respuesta, usar respuestas predeterminadas
    if (!response) {
      const defaultResponses = [
        {
          text: "¡Hola! Soy Sfera, tu asesor personal de AromaSfera, la perfumería que aviva tus sentidos. ¿En qué puedo ayudarte hoy?",
          suggestedResponses: ["Busco un perfume nuevo", "Quiero información sobre fragancias", "Tengo dudas sobre un producto", "¿Qué ofertas tienen?"]
        },
        {
          text: "Para ofrecerte las mejores recomendaciones, me gustaría conocer tus preferencias. ¿Qué tipo de fragancias suelen gustarte más?",
          suggestedResponses: ["Prefiero aromas florales", "Me gustan las fragancias frescas/cítricas", "Busco algo amaderado", "Me atraen los aromas orientales/especiados"]
        },
        {
          text: "Excelente elección. ¿Para qué ocasión estás buscando principalmente este perfume?",
          suggestedResponses: ["Para uso diario", "Para el trabajo/oficina", "Para eventos especiales", "Para ocasiones románticas"]
        },
        {
          text: "¡Perfecto! Con esta información puedo brindarte una atención más personalizada. Permíteme conectarte con nuestro sistema experto para ofrecerte las mejores recomendaciones basadas en tus preferencias.",
          suggestedResponses: ["Continuar", "Ver recomendaciones", "Tengo otra pregunta", "Gracias"]
        }
      ];

      return defaultResponses[currentStep] || defaultResponses[0];
    }

    // Actualizar historial con la respuesta del asistente
    userMemory.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    // Extraer sugerencias de respuesta o generar algunas predeterminadas
    const suggestedResponses = extractSuggestedResponses(response) || [
      "Me interesa", 
      "Cuéntame más", 
      "Tengo otra pregunta", 
      "Gracias"
    ];

    // Si estamos en el paso 3, cambiar al modo experto para la próxima interacción
    if (currentStep >= 3) {
      userMemory.stage = 'expert';
    }

    return {
      text: cleanResponse(response),
      suggestedResponses: suggestedResponses
    };
  } catch (error) {
    console.error('Error en el asistente inicial:', error);
    throw error;
  }
}

// Función para el asistente experto (conversación libre con memoria y contexto)
async function expertAssistant(
  userMessage: string,
  model: AIModel = 'anthropic'
): Promise<AssistantResponse> {
  try {
    // Actualizar historial de conversación
    if (userMessage && !userMemory.conversationHistory.some(msg => msg.content === userMessage && msg.role === 'user')) {
      const timestamp = new Date().toISOString();
      userMemory.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp
      });
    }

    // Determinar si necesitamos cargar documentos de contexto basados en el mensaje del usuario
    let contextDocuments = '';

    if (userMessage.toLowerCase().includes('ingrediente') || userMessage.toLowerCase().includes('composición')) {
      const ingredientsDoc = await loadKnowledgeBase('ingredients');
      contextDocuments += ingredientsDoc + '\n\n';
    }

    if (userMessage.toLowerCase().includes('precio') || userMessage.toLowerCase().includes('costo') || 
        userMessage.toLowerCase().includes('descuento') || userMessage.toLowerCase().includes('oferta')) {
      const pricingDoc = await loadKnowledgeBase('pricing');
      contextDocuments += pricingDoc + '\n\n';
    }

    if (userMessage.toLowerCase().includes('marca') || userMessage.toLowerCase().includes('aromasfera')) {
      const brandDoc = await loadKnowledgeBase('brand_history');
      contextDocuments += brandDoc + '\n\n';
    }

    // Analizar las preferencias del usuario basadas en la conversación si aún no lo hemos hecho
    if (!userMemory.preferences) {
      userMemory.preferences = await analyzeUserPreferences(
        userMemory.conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content),
        model
      );
    }

    const systemPrompt = `
    Eres Sfera, un asesor profesional especializado en perfumería de AromaSfera, "perfumería que aviva tus sentidos". 
    Tienes amplio conocimiento sobre fragancias, notas olfativas, temporadas, ocasiones y tendencias en perfumería.

    MEMORIA DEL USUARIO:
    ${JSON.stringify(userMemory.preferences, null, 2)}

    HISTORIAL DE INTERACCIONES PREVIAS:
    ${JSON.stringify(userMemory.previousInteractions, null, 2)}

    DOCUMENTOS DE CONTEXTO:
    ${contextDocuments}

    INSTRUCCIONES:
    1. Mantén un tono profesional, cálido y personalizado en todo momento.
    2. Utiliza la información de la memoria para personalizar tus respuestas.
    3. Recuerda detalles previos de la conversación y referencias anteriores del cliente.
    4. Si el cliente menciona una preferencia, agrégala a tu entendimiento de sus gustos.
    5. Ofrece recomendaciones específicas basadas en las preferencias del usuario.
    6. Cuando sea apropiado, sugiere productos complementarios o colecciones especiales.
    7. Si no conoces la respuesta a una pregunta técnica, sé honesto y ofrece buscar la información.
    8. Evita respuestas genéricas; siempre personaliza basándote en el contexto de la conversación.

    Responde de manera natural y conversacional, como lo haría un asesor experto en una tienda de perfumes de lujo.
    `;

    let response = '';

    if (model === 'anthropic' && anthropic !== null) {
      try {
        const anthropicResponse = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [
            ...userMemory.conversationHistory.slice(-10).map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            }))
          ],
        });

        if (anthropicResponse.content && anthropicResponse.content.length > 0 && 
            typeof anthropicResponse.content[0] === 'object' && 
            'text' in anthropicResponse.content[0] && 
            typeof anthropicResponse.content[0].text === 'string') {
          response = anthropicResponse.content[0].text;
        }
      } catch (error) {
        console.warn('Error al llamar a Anthropic API:', error);
      }
    } else if (model === 'openai' && openai !== null) {
      try {
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...userMemory.conversationHistory.slice(-10).map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            }))
          ]
        });

        response = openaiResponse.choices[0].message.content || '';
      } catch (error) {
        console.warn('Error al llamar a OpenAI API:', error);
      }
    }

    // Si no hay respuesta, usar una respuesta predeterminada
    if (!response) {
      response = "Gracias por compartir esa información. En AromaSfera, nos especializamos en encontrar la fragancia perfecta para cada persona. ¿Hay algo más específico que te gustaría saber sobre nuestras colecciones o alguna recomendación particular que necesites?";
    }

    // Actualizar historial con la respuesta del asistente
    userMemory.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    // Extraer sugerencias de respuesta que sean naturales para la conversación
    const suggestedResponses = generateContextualSuggestions(response, userMessage) || [
      "Me gustaría ver recomendaciones", 
      "¿Tienen alguna oferta especial?", 
      "¿Cuáles son los perfumes más vendidos?", 
      "Gracias por la información"
    ];

    // Actualizar las preferencias del usuario basadas en esta interacción
    updateUserPreferences(userMessage, response);

    return {
      text: response,
      suggestedResponses: suggestedResponses,
      memoryUpdate: {
        preferences: userMemory.preferences,
        conversationLength: userMemory.conversationHistory.length
      }
    };
  } catch (error) {
    console.error('Error en el asistente experto:', error);
    throw error;
  }
}

// Funciones auxiliares

// Función para actualizar las preferencias del usuario
function updateUserPreferences(userMessage: string, assistantResponse: string): void {
  // Implementación básica para actualizar preferencias
  if (!userMemory.preferences) {
    userMemory.preferences = {
      gender: 'unknown',
      ageRange: 'unknown',
      fragranceTypes: [],
      occasions: [],
      intensity: 'medium',
      budget: 'unknown',
      favoriteNotes: [],
      favoriteSeasons: []
    };
  }

  // Actualizar preferencias basadas en palabras clave en el mensaje del usuario
  if (userMessage.toLowerCase().includes('floral')) {
    if (!userMemory.preferences.fragranceTypes.includes('floral')) {
      userMemory.preferences.fragranceTypes.push('floral');
    }
  }

  if (userMessage.toLowerCase().includes('amaderado') || userMessage.toLowerCase().includes('madera')) {
    if (!userMemory.preferences.fragranceTypes.includes('woody')) {
      userMemory.preferences.fragranceTypes.push('woody');
    }
  }

  // Más actualizaciones de preferencias podrían implementarse aquí
}

// Función para extraer sugerencias de respuesta del texto
function extractSuggestedResponses(text: string): string[] | null {
  // Implementación simple para extraer sugerencias
  const lines = text.split('\n');
  const suggestions: string[] = [];

  for (const line of lines) {
    // Buscar patrones como "1.", "•", "-" seguidos de texto
    const match = line.match(/^(?:[-•*]|\d+\.)\s+(.+)$/);
    if (match && match[1]) {
      suggestions.push(match[1].trim());
    }
  }

  return suggestions.length > 0 ? suggestions.slice(0, 4) : null;
}

// Función para generar sugerencias contextuales basadas en la conversación
function generateContextualSuggestions(
  assistantResponse: string, 
  userMessage: string
): string[] | null {
  // Implementación simple para generar sugerencias contextuales
  if (assistantResponse.toLowerCase().includes('recomendación') || 
      assistantResponse.toLowerCase().includes('recomendar')) {
    return [
      "Me gustaría ver esas recomendaciones",
      "¿Cuál es el más popular?",
      "¿Tienen muestras disponibles?",
      "¿Hay alguna oferta especial?"
    ];
  }

  if (assistantResponse.toLowerCase().includes('precio') || 
      assistantResponse.toLowerCase().includes('costo')) {
    return [
      "¿Tienen opciones más económicas?",
      "¿Hay algún descuento disponible?",
      "¿Cuál ofrece mejor relación calidad-precio?",
      "Me interesa, ¿cómo puedo comprarlo?"
    ];
  }

  // Sugerencias predeterminadas si no se detecta un contexto específico
  return [
    "Me gustaría más información",
    "¿Qué me recomiendas?",
    "¿Tienen tiendas físicas?",
    "Gracias por tu ayuda"
  ];
}

// Función para limpiar la respuesta (eliminar marcadores o formato no deseado)
function cleanResponse(text: string): string {
  // Eliminar posibles marcadores de formato o instrucciones internas
  return text
    .replace(/\[.*?\]/g, '')  // Eliminar texto entre corchetes
    .replace(/\(.*?\)/g, '')  // Eliminar texto entre paréntesis al inicio de línea
    .replace(/^\s*\d+\.\s*/gm, '')  // Eliminar numeración al inicio de línea
    .replace(/^\s*[-•*]\s*/gm, '')  // Eliminar viñetas al inicio de línea
    .trim();
}
