import type { Analysis } from "@shared/schema";

/**
 * Normalize analysis data from API response
 * Converts string dates to Date objects
 */
export function normalizeAnalysis(data: any): Analysis {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
}

/**
 * Normalize array of analyses from API response
 */
export function normalizeAnalyses(data: any[]): Analysis[] {
  return data.map(normalizeAnalysis);
}
