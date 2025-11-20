import { type Analysis, type InsertAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

/**
 * Persistent storage interface for analyses
 */
export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
}

/**
 * In-memory storage (development/testing). Not persisted across restarts.
 */
export class MemStorage implements IStorage {
  private analyses: Map<string, Analysis>;

  constructor() {
    this.analyses = new Map();
  }

  /**
   * Create and store a new analysis in memory
   */
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

  /**
   * Retrieve an analysis by ID from memory
   */
  async getAnalysis(id: string): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  /**
   * List all analyses from memory, newest first
   */
  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

/**
 * Simple file-backed persistent storage for production usage.
 * - Stores analyses in JSON: data/analyses.json
 * - Safe for Windows; no extra native deps.
 */
export class FileStorage implements IStorage {
  private filePath: string;
  private items: Analysis[] = [];

  constructor() {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, "analyses.json");
    this.loadFromDisk();
  }

  /**
   * Load analyses from disk and normalize date types
   */
  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf8");
        const parsed: any[] = JSON.parse(raw);
        this.items = parsed.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
      } else {
        this.items = [];
        fs.writeFileSync(this.filePath, "[]", "utf8");
      }
    } catch (err) {
      console.error("Failed to load analyses from disk:", err);
      this.items = [];
    }
  }

  /**
   * Persist current items to disk atomically
   */
  private saveToDisk(): void {
    const tmpPath = this.filePath + ".tmp";
    const data = JSON.stringify(
      this.items.map(a => ({ ...a, createdAt: a.createdAt.toISOString() })),
      null,
      2
    );
    fs.writeFileSync(tmpPath, data, "utf8");
    fs.renameSync(tmpPath, this.filePath);
  }

  /**
   * Create and persist a new analysis
   */
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = randomUUID();
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.items.push(analysis);
    // Keep newest first
    this.items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    this.saveToDisk();
    return analysis;
  }

  /**
   * Retrieve a single analysis by ID
   */
  async getAnalysis(id: string): Promise<Analysis | undefined> {
    return this.items.find(a => a.id === id);
  }

  /**
   * List all analyses, newest first
   */
  async getAllAnalyses(): Promise<Analysis[]> {
    // Items already kept sorted
    return this.items.slice();
  }
}

// Default to file storage for production-ready persistence.
// Set USE_MEM_STORAGE=true to force in-memory behavior.
export const storage: IStorage =
  process.env.USE_MEM_STORAGE === "true" ? new MemStorage() : new FileStorage();
