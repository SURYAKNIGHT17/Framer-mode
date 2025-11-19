import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText } from "lucide-react";
import type { Analysis } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AnalysisHistoryProps {
  analyses: Analysis[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function AnalysisHistory({ analyses, selectedId, onSelect }: AnalysisHistoryProps) {
  if (analyses.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center p-8" data-testid="empty-history">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground" data-testid="text-empty-history-title">
              No analyses yet
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-empty-history-description">
              Start by analyzing some text to see your history here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="analysis-history">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground" data-testid="text-history-title">
          Analysis History
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-3">
          {analyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              data-testid={`history-item-${analysis.id}`}
            >
              <Card
                className={`cursor-pointer hover-elevate active-elevate-2 transition-all ${
                  selectedId === analysis.id ? "border-primary" : ""
                }`}
                onClick={() => onSelect(analysis.id)}
                data-testid={`button-history-${analysis.id}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`text-2xl font-bold ${
                        analysis.trustScore >= 75
                          ? "text-success"
                          : analysis.trustScore >= 50
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                      data-testid={`text-history-score-${analysis.id}`}
                    >
                      {analysis.trustScore}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-history-time-${analysis.id}`}>
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`text-history-input-${analysis.id}`}>
                    {analysis.inputText}
                  </p>
                  <div className="text-xs text-muted-foreground" data-testid={`text-history-claims-${analysis.id}`}>
                    {analysis.claims.length} claim{analysis.claims.length !== 1 ? "s" : ""} analyzed
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
