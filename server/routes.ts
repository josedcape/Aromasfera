import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { 
  perfumes, 
  emailSubscriptions, 
  insertEmailSubscriptionSchema
} from "@shared/schema";
import { eq, and, or, inArray, desc } from "drizzle-orm";
import { z } from "zod";

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
        query = query.where(inArray(gender, perfumes.gender));
      }
      
      if (fragranceTypes) {
        const types = fragranceTypes.split(',');
        const conditions = types.map(type => inArray(type, perfumes.fragrance_type));
        
        if (conditions.length > 0) {
          query = query.where(or(...conditions));
        }
      }
      
      if (occasions) {
        const occasionList = occasions.split(',');
        const conditions = occasionList.map(occasion => inArray(occasion, perfumes.occasions));
        
        if (conditions.length > 0) {
          query = query.where(or(...conditions));
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

  return httpServer;
}
