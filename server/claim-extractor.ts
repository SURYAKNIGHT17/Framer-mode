import { randomUUID } from "crypto";
import type { Claim, EvidenceSnippet } from "@shared/schema";

/**
 * Extract claims from input text using sentence splitting
 */
export function extractClaims(text: string): string[] {
  // Split on sentence boundaries
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Filter out very short fragments

  // Filter out non-claims (metadata, greetings, etc.)
  const claims = sentences.filter(sentence => {
    // Skip if too short or too long
    if (sentence.length < 15 || sentence.length > 500) return false;
    
    // Skip greetings and common metadata
    const lowerSentence = sentence.toLowerCase();
    if (
      lowerSentence.startsWith("hello") ||
      lowerSentence.startsWith("hi ") ||
      lowerSentence.startsWith("thanks") ||
      lowerSentence.startsWith("note:")
    ) {
      return false;
    }
    
    return true;
  });

  // Limit to top 8 claims
  return claims.slice(0, 8);
}

/**
 * Mock search function - simulates fetching evidence for a claim
 * In production, this would call a real search API (SerpAPI, Bing, etc.)
 */
function mockSearchForClaim(claim: string): EvidenceSnippet[] {
  // Generate 2-3 mock evidence snippets
  const numSnippets = Math.floor(Math.random() * 2) + 2;
  const snippets: EvidenceSnippet[] = [];

  for (let i = 0; i < numSnippets; i++) {
    const relevance = Math.floor(Math.random() * 40) + 40; // 40-80%
    snippets.push({
      title: `Search Result ${i + 1} for: ${claim.slice(0, 50)}...`,
      snippet: `This is supporting evidence found online. ${claim.slice(0, 100)}... The information appears to be ${relevance > 60 ? "well" : "partially"} documented in available sources.`,
      url: `https://example.com/evidence/${i + 1}`,
      relevanceScore: relevance,
    });
  }

  return snippets;
}

/**
 * Calculate keyword match score between claim and evidence
 */
function calculateKeywordScore(claim: string, evidence: EvidenceSnippet[]): number {
  if (evidence.length === 0) return 0;

  // Extract keywords from claim (simple approach: words longer than 3 chars)
  const claimWords = claim
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3);

  if (claimWords.length === 0) return 50;

  let totalMatchScore = 0;
  
  for (const snippet of evidence) {
    const snippetText = (snippet.title + " " + snippet.snippet).toLowerCase();
    let matchCount = 0;
    
    for (const word of claimWords) {
      if (snippetText.includes(word)) {
        matchCount++;
      }
    }
    
    const matchRatio = matchCount / claimWords.length;
    totalMatchScore += matchRatio * snippet.relevanceScore;
  }

  // Average across evidence snippets
  const avgScore = totalMatchScore / evidence.length;
  return Math.min(100, Math.max(0, avgScore));
}

/**
 * Verify a single claim and return scored result
 */
export function verifyClaim(claimText: string): Claim {
  const id = randomUUID();
  
  // Get mock evidence (in production, call real search API)
  const evidence = mockSearchForClaim(claimText);
  
  // Calculate keyword-based score
  const kwScore = calculateKeywordScore(claimText, evidence);
  
  // Determine status based on score
  let status: "Supported" | "Unclear" | "Contradicted";
  if (kwScore >= 70) {
    status = "Supported";
  } else if (kwScore >= 40) {
    status = "Unclear";
  } else {
    status = "Contradicted";
  }

  return {
    id,
    text: claimText,
    score: Math.round(kwScore),
    status,
    evidence,
    verificationMethod: "keyword-match",
  };
}

/**
 * Calculate overall trust score from claim scores
 */
export function calculateTrustScore(claims: Claim[]): {
  trustScore: number;
  statusText: string;
  explanation: string;
} {
  if (claims.length === 0) {
    return {
      trustScore: 0,
      statusText: "No Claims Found",
      explanation: "No verifiable claims were found in the input text.",
    };
  }

  // Calculate average score
  const avgScore = claims.reduce((sum, claim) => sum + claim.score, 0) / claims.length;

  // Count unsupported claims
  const contradictedCount = claims.filter(c => c.status === "Contradicted").length;
  const unclearCount = claims.filter(c => c.status === "Unclear").length;
  const supportedCount = claims.filter(c => c.status === "Supported").length;
  
  const unsupportedRatio = contradictedCount / claims.length;
  
  // Apply penalty for unsupported claims
  const penalty = unsupportedRatio * 25;
  let trustScore = Math.max(0, Math.min(100, avgScore - penalty));
  trustScore = Math.round(trustScore);

  // Generate status text
  let statusText: string;
  if (trustScore >= 75) {
    statusText = "Mostly Supported";
  } else if (trustScore >= 50) {
    statusText = "Mixed Results";
  } else {
    statusText = "Low Confidence";
  }

  // Generate explanation
  const explanation = `Overall score: ${trustScore}/100. ` +
    `Analysis found ${supportedCount} supported, ${unclearCount} unclear, and ${contradictedCount} contradicted claim${claims.length !== 1 ? 's' : ''}. ` +
    (trustScore >= 75
      ? "Content is mostly supported by available evidence."
      : trustScore >= 50
      ? "Content has some unclear or contradicted claims."
      : "Content has significant unsupported or contradicted claims.");

  return { trustScore, statusText, explanation };
}
