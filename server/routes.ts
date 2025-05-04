import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  perfumes, 
  emailSubscriptions, 
  insertEmailSubscriptionSchema,
  UserPreferences
} from "@shared/schema";
import { eq, and, or, inArray, desc } from "drizzle-orm";
import { z } from "zod";
import { analyzeUserPreferences, generateNextQuestion } from "./services/aiService";
import { textToSpeechConverter } from "./services/textToSpeech";
import crypto from 'crypto';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Get perfume recommendations based on user preferences
  app.get('/api/recommendations', async (req, res) => {
    try {
      const querySchema = z.object({
        gender: z.enum(['men', 'women']).optional(),
        ageRange: z.enum(['18-24', '25-34', '35-44', '45+']).optional(),
        fragranceTypes: z.string().optional(),
        occasions: z.string().optional(),
        intensity: z.coerce.number().optional(),
        budget: z.string().optional()
      });
      
      const parsedQuery = querySchema.safeParse(req.query);
      
      if (!parsedQuery.success) {
        return res.status(400).json({ message: "Invalid request parameters", errors: parsedQuery.error.errors });
      }
      
      const { gender, fragranceTypes, occasions } = parsedQuery.data;
      
      let query = db.select().from(perfumes);
      
      // Apply filters if they exist
      if (gender) {
        query = query.where(gender === 'men' ? 
          inArray(perfumes.gender, ['men', 'unisex']) : 
          inArray(perfumes.gender, ['women', 'unisex'])
        );
      }
      
      if (fragranceTypes) {
        const types = fragranceTypes.split(',');
        if (types.length > 0) {
          // Al menos uno de los tipos de fragancia
          query = query.where(or(...types.map(type => 
            inArray(perfumes.fragrance_type, [type])
          )));
        }
      }
      
      if (occasions) {
        const occasionList = occasions.split(',');
        if (occasionList.length > 0) {
          // Al menos una de las ocasiones
          query = query.where(or(...occasionList.map(occasion => 
            inArray(perfumes.occasions, [occasion])
          )));
        }
      }
      
      // Order by rating desc
      query = query.orderBy(desc(perfumes.rating));
      
      // Execute the query
      const results = await query;
      
      // Add match percentage based on filter matches
      const recommendationsWithMatch = results.map(perfume => {
        // Calculate match percentage - in a real app this would be more sophisticated
        let matchPercentage = 90 + Math.floor(Math.random() * 9); // 90-99% match
        
        return {
          ...perfume,
          matchPercentage
        };
      });
      
      res.json(recommendationsWithMatch);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ message: 'Failed to get recommendations' });
    }
  });
  
  // Email subscription endpoint
  app.post('/api/email-subscription', async (req, res) => {
    try {
      const validatedData = insertEmailSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existingEmail = await db.select().from(emailSubscriptions).where(eq(emailSubscriptions.email, validatedData.email));
      
      if (existingEmail.length > 0) {
        // Update existing subscription
        await db
          .update(emailSubscriptions)
          .set({ consented: validatedData.consented })
          .where(eq(emailSubscriptions.email, validatedData.email));
          
        return res.status(200).json({ message: 'Subscription updated successfully' });
      }
      
      // Create new subscription
      const [newSubscription] = await db
        .insert(emailSubscriptions)
        .values(validatedData)
        .returning();
        
      res.status(201).json({ 
        message: 'Subscription created successfully',
        data: newSubscription
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data format', errors: error.errors });
      }
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: 'Failed to process subscription' });
    }
  });

  // Endpoint para enviar mensajes al asistente y obtener una respuesta
  app.post('/api/assistant/message', async (req, res) => {
    try {
      const messageSchema = z.object({
        conversation: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string()
        })),
        currentStep: z.number().int().min(0).max(7)
      });
      
      const parsed = messageSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid request format", 
          errors: parsed.error.errors 
        });
      }
      
      const { conversation, currentStep } = parsed.data;
      
      // Generar respuesta usando el servicio de AI
      const response = await generateNextQuestion(conversation, currentStep);
      
      // Si se ha configurado la síntesis de voz, convertir texto a voz
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
          const filename = `assistant_response_${crypto.randomBytes(8).toString('hex')}`;
          const audioUrl = await textToSpeechConverter(response.text, filename);
          
          // Devolver la respuesta con la URL del audio
          return res.json({
            ...response,
            audioUrl
          });
        } catch (error) {
          console.error('Error in text-to-speech conversion:', error);
          // Continuar y devolver solo la respuesta de texto si hay un error en la síntesis
          return res.json(response);
        }
      }
      
      // Devolver solo la respuesta de texto
      return res.json(response);
    } catch (error) {
      console.error('Error in assistant message endpoint:', error);
      res.status(500).json({ message: 'Failed to process assistant message' });
    }
  });
  
  // Endpoint para analizar las preferencias del usuario
  app.post('/api/assistant/analyze', async (req, res) => {
    try {
      const schema = z.object({
        messages: z.array(z.string())
      });
      
      const parsed = schema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid request format", 
          errors: parsed.error.errors 
        });
      }
      
      const { messages } = parsed.data;
      
      // Analizar preferencias usando el servicio de AI
      const preferences = await analyzeUserPreferences(messages);
      
      res.json(preferences);
    } catch (error) {
      console.error('Error analyzing user preferences:', error);
      res.status(500).json({ message: 'Failed to analyze user preferences' });
    }
  });
  
  // Endpoint para la síntesis de voz
  app.post('/api/assistant/speak', async (req, res) => {
    try {
      const schema = z.object({
        text: z.string().min(1),
        language: z.string().default('es-ES')
      });
      
      const parsed = schema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid request format", 
          errors: parsed.error.errors 
        });
      }
      
      const { text, language } = parsed.data;
      
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return res.status(503).json({ 
          message: "Text-to-speech service is not configured" 
        });
      }
      
      // Generar un nombre de archivo único
      const filename = `voice_${crypto.randomBytes(8).toString('hex')}`;
      
      // Convertir texto a voz
      const audioUrl = await textToSpeechConverter(text, filename, language);
      
      res.json({ audioUrl });
    } catch (error) {
      console.error('Error in text-to-speech endpoint:', error);
      res.status(500).json({ message: 'Failed to convert text to speech' });
    }
  });

  return httpServer;
}
