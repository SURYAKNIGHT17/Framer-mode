import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeRequestSchema } from "@shared/schema";
import { extractClaims, verifyClaim, calculateTrustScore } from "./claim-extractor";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/analyze - Analyze text and return trust score with claims
  app.post("/api/analyze", async (req, res) => {
    try {
      const result = analyzeRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: result.error.issues 
        });
      }

      const { text } = result.data;

      // Extract claims from text
      const claimTexts = extractClaims(text);

      // Verify each claim
      const claims = claimTexts.map(claimText => verifyClaim(claimText));

      // Calculate overall trust score
      const { trustScore, statusText, explanation } = calculateTrustScore(claims);

      // Store analysis
      const analysis = await storage.createAnalysis({
        inputText: text,
        trustScore,
        statusText,
        explanation,
        claims,
      });

      return res.json({
        id: analysis.id,
        inputText: analysis.inputText,
        trustScore: analysis.trustScore,
        statusText: analysis.statusText,
        explanation: analysis.explanation,
        claims: analysis.claims,
        createdAt: analysis.createdAt.toISOString(),
      });
    } catch (error) {
      console.error("Error analyzing text:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/history - Get all past analyses
  app.get("/api/history", async (req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      return res.json(analyses);
    } catch (error) {
      console.error("Error fetching history:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/analysis/:id - Get specific analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getAnalysis(id);

      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      return res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
