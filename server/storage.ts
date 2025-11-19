import { type Analysis, type InsertAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
}

export class MemStorage implements IStorage {
  private analyses: Map<string, Analysis>;

  constructor() {
    this.analyses = new Map();
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = randomUUID();
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: string): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
