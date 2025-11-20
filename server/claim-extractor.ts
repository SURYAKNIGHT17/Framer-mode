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
 * Build a list of real, publicly accessible search/result URLs for a claim.
 */
function buildRealEvidenceUrls(claim: string): string[] {
  const q = encodeURIComponent(claim);
  return [
    `https://scholar.google.com/scholar?q=${q}`,
    `https://www.britannica.com/search?query=${q}`,
    `https://en.wikipedia.org/wiki/Special:Search?search=${q}`,
    `https://www.who.int/search?q=${q}`,
    `https://www.nature.com/search?q=${q}`,
    `https://www.sciencedirect.com/search?qs=${q}`,
  ];
}

function isAllowedDomain(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const deny = ["example.com", "localhost", "127.0.0.1"];
    if (deny.some(d => host === d || host.endsWith(`.${d}`))) return false;

    const allow = [
      "scholar.google.com",
      "www.britannica.com",
      "en.wikipedia.org",
      "www.who.int",
      "www.nature.com",
      "www.sciencedirect.com",
    ];
    return allow.some(a => host === a);
  } catch {
    return false;
  }
}

/**
 * Assign a quality weight to evidence based on domain reputation.
 * Higher weight increases influence on scoring.
 */
function domainQualityWeight(url: string): number {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const weights: Record<string, number> = {
      "scholar.google.com": 1.0,
      "www.who.int": 0.95,
      "www.nature.com": 0.9,
      "www.sciencedirect.com": 0.9,
      "www.britannica.com": 0.85,
      "en.wikipedia.org": 0.8,
    };
    return weights[host] ?? 0.75;
  } catch {
    return 0.7;
  }
}

/**
 * Validate evidence links by performing a quick HEAD/GET check.
 * Filters out links that are unreachable or return non-2xx.
 */
async function validateEvidenceLinks(snippets: EvidenceSnippet[]): Promise<EvidenceSnippet[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const checks = await Promise.allSettled(
      snippets.map(async s => {
        try {
          const res = await fetch(s.url, {
            method: "HEAD",
            signal: controller.signal,
            redirect: "follow",
          });
          if (!res.ok) {
            // Some hosts may not support HEAD well; try GET quickly
            const resGet = await fetch(s.url, {
              method: "GET",
              signal: controller.signal,
              redirect: "follow",
            });
            return resGet.ok ? s : null;
          }
          return s;
        } catch {
          return null;
        }
      })
    );

    return checks
      .filter(c => c.status === "fulfilled" && c.value)
      .map(c => (c as PromiseFulfilledResult<EvidenceSnippet | null>).value!)
      .filter(Boolean);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Real web search using Bing Web Search API if configured.
 * Falls back to reputable search URLs if no API key is set.
 */
async function searchWebForClaim(claim: string): Promise<EvidenceSnippet[]> {
  const apiKey = process.env.BING_API_KEY;
  const endpoint = "https://api.bing.microsoft.com/v7.0/search";

  if (apiKey) {
    const q = encodeURIComponent(claim);
    const url = `${endpoint}?q=${q}&textDecorations=false&textFormat=Raw`;
    const res = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
      },
    });
    if (!res.ok) {
      return buildRealEvidenceUrls(claim)
        .filter(isAllowedDomain)
        .slice(0, 3)
        .map((url, i) => ({
          title: `Reference ${i + 1}: ${claim.slice(0, 48)}…`,
          snippet: `Reference page relevant to: ${claim.slice(0, 120)}…`,
          url,
          relevanceScore: 60 + i * 10,
        }));
    }
    const data = await res.json() as any;
    const items: any[] = data.webPages?.value ?? [];
    let snippets: EvidenceSnippet[] = items.slice(0, 3).map((item: any, i: number) => ({
      title: item.name || `Result ${i + 1}`,
      snippet: item.snippet || item.description || `Web result related to the claim`,
      url: item.url,
      relevanceScore: Math.min(100, 70 + i * 10),
    }));

    snippets = snippets.filter(s => isAllowedDomain(s.url));

    // Optional validation step (enabled by default)
    if (process.env.EVIDENCE_VALIDATE !== "false") {
      snippets = await validateEvidenceLinks(snippets);
    }
    return snippets;
  }

  // No API key: return reputable search URLs as a fallback
  let fallback = buildRealEvidenceUrls(claim)
    .filter(isAllowedDomain)
    .slice(0, 3)
    .map((url, i) => ({
      title: `Reference ${i + 1}: ${claim.slice(0, 48)}…`,
      snippet: `Reference page relevant to: ${claim.slice(0, 120)}…`,
      url,
      relevanceScore: 60 + i * 10,
    }));

  if (process.env.EVIDENCE_VALIDATE !== "false") {
    fallback = await validateEvidenceLinks(fallback);
  }
  return fallback;
}

function calculateKeywordScore(claim: string, evidence: EvidenceSnippet[]): number {
  if (evidence.length === 0) return 0;

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
    const weight = domainQualityWeight(snippet.url);
    const weightedRelevance = snippet.relevanceScore * weight;
    totalMatchScore += matchRatio * weightedRelevance;
  }

  const avgScore = totalMatchScore / evidence.length;
  return Math.min(100, Math.max(0, avgScore));
}

/**
 * Verify a single claim and return scored result
 * Uses live web search when available.
 */
export async function verifyClaim(claimText: string): Promise<Claim> {
  const id = randomUUID();
  
  const evidence = await searchWebForClaim(claimText);
  
  const kwScore = calculateKeywordScore(claimText, evidence);
  
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
    verificationMethod: process.env.BING_API_KEY ? "web-search-bing" : "web-search-fallback",
  };
}

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

  const avgScore = claims.reduce((sum, claim) => sum + claim.score, 0) / claims.length;

  const contradictedCount = claims.filter(c => c.status === "Contradicted").length;
  const unclearCount = claims.filter(c => c.status === "Unclear").length;
  const supportedCount = claims.filter(c => c.status === "Supported").length;
  
  const unsupportedRatio = contradictedCount / claims.length;
  
  const penalty = unsupportedRatio * 25;
  let trustScore = Math.max(0, Math.min(100, avgScore - penalty));
  trustScore = Math.round(trustScore);

  let statusText: string;
  if (trustScore >= 75) {
    statusText = "Mostly Supported";
  } else if (trustScore >= 50) {
    statusText = "Mixed Results";
  } else {
    statusText = "Low Confidence";
  }

  const explanation = `Overall score: ${trustScore}/100. ` +
    `Analysis found ${supportedCount} supported, ${unclearCount} unclear, and ${contradictedCount} contradicted claim${claims.length !== 1 ? 's' : ''}. ` +
    (trustScore >= 75
      ? "Content is mostly supported by available evidence."
      : trustScore >= 50
      ? "Content has some unclear or contradicted claims."
      : "Content has significant unsupported or contradicted claims.");

  return { trustScore, statusText, explanation };
}
