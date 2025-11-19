import { motion } from "framer-motion";
import { TrustScoreGauge } from "./trust-score-gauge";
import { ClaimCard } from "./claim-card";
import type { Analysis } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface AnalysisResultsProps {
  analysis: Analysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const claims = analysis.claims || [];
  const supportedCount = claims.filter(c => c.status === "Supported").length;
  const unclearCount = claims.filter(c => c.status === "Unclear").length;
  const contradictedCount = claims.filter(c => c.status === "Contradicted").length;

  return (
    <div className="space-y-8">
      <TrustScoreGauge score={analysis.trustScore} statusText={analysis.statusText} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-muted/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-foreground">Explanation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-explanation">
                  {analysis.explanation}
                </p>
                <div className="flex gap-4 text-sm pt-2">
                  <span className="text-success font-medium">
                    {supportedCount} Supported
                  </span>
                  <span className="text-warning font-medium">
                    {unclearCount} Unclear
                  </span>
                  <span className="text-destructive font-medium">
                    {contradictedCount} Contradicted
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {claims.length > 0 && (
        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-semibold text-foreground"
          >
            Claims Analysis
          </motion.h2>
          <div className="space-y-4">
            {claims.map((claim, index) => (
              <ClaimCard key={claim.id} claim={claim} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
