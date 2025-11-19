import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnalysisInput } from "@/components/analysis-input";
import { AnalysisResults } from "@/components/analysis-results";
import { AnalysisHistory } from "@/components/analysis-history";
import { EmptyState } from "@/components/empty-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Analysis, AnalyzeResponse } from "@shared/schema";
import { normalizeAnalyses } from "@/lib/api-utils";
import { motion } from "framer-motion";

export default function Home() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | undefined>();
  const { toast } = useToast();

  const { data: historyData } = useQuery<Analysis[]>({
    queryKey: ["/api/history"],
    select: (data) => normalizeAnalyses(data),
  });

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest<AnalyzeResponse>("POST", "/api/analyze", { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      // Clear selected analysis so we show the new mutation result
      setSelectedAnalysisId(undefined);
      toast({
        title: "Analysis Complete",
        description: "Your text has been analyzed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your text. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedAnalysis = historyData?.find(a => a.id === selectedAnalysisId);
  const hasResults = selectedAnalysis || analyzeMutation.data;
  
  // Convert AnalyzeResponse to Analysis if we have mutation data
  const currentAnalysis: Analysis | undefined = selectedAnalysis || (analyzeMutation.data ? {
    id: analyzeMutation.data.id,
    inputText: analyzeMutation.data.inputText,
    trustScore: analyzeMutation.data.trustScore,
    statusText: analyzeMutation.data.statusText,
    explanation: analyzeMutation.data.explanation,
    claims: analyzeMutation.data.claims,
    createdAt: new Date(analyzeMutation.data.createdAt),
  } : undefined);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Shield className="h-7 w-7 text-primary" data-testid="icon-logo" />
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
              Trust Score
            </h1>
          </motion.div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnalysisInput
              onAnalyze={(text) => analyzeMutation.mutate(text)}
              isLoading={analyzeMutation.isPending}
            />
            
            {hasResults && currentAnalysis ? (
              <AnalysisResults analysis={currentAnalysis} />
            ) : (
              <EmptyState />
            )}
          </div>

          <div className="lg:col-span-1">
            <AnalysisHistory
              analyses={historyData || []}
              selectedId={selectedAnalysisId}
              onSelect={setSelectedAnalysisId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
