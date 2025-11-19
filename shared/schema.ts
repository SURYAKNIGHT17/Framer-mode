import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Evidence snippet from search results
export const evidenceSnippetSchema = z.object({
  title: z.string(),
  snippet: z.string(),
  url: z.string(),
  relevanceScore: z.number().min(0).max(100),
});

export type EvidenceSnippet = z.infer<typeof evidenceSnippetSchema>;

// Individual claim with verification results
export const claimSchema = z.object({
  id: z.string(),
  text: z.string(),
  score: z.number().min(0).max(100),
  status: z.enum(["Supported", "Unclear", "Contradicted"]),
  evidence: z.array(evidenceSnippetSchema),
  verificationMethod: z.string().default("keyword-match"),
});

export type Claim = z.infer<typeof claimSchema>;

// Analysis result
export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inputText: text("input_text").notNull(),
  trustScore: integer("trust_score").notNull(),
  statusText: text("status_text").notNull(),
  explanation: text("explanation").notNull(),
  claims: jsonb("claims").notNull().$type<Claim[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// API request/response schemas
export const analyzeRequestSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters"),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const analyzeResponseSchema = z.object({
  id: z.string(),
  inputText: z.string(),
  trustScore: z.number(),
  statusText: z.string(),
  explanation: z.string(),
  claims: z.array(claimSchema),
  createdAt: z.string(),
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
