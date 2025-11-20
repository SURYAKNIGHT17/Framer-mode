import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnalysisInput } from "@/components/analysis-input";
import { AnalysisResults } from "@/components/analysis-results";
import { AnalysisTable } from "@/components/analysis-table";
import { EmptyState } from "@/components/empty-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import type { Analysis, AnalyzeResponse, AuthMeResponse } from "@shared/schema";
import { normalizeAnalyses } from "@/lib/api-utils";
import { motion } from "framer-motion";
import { LoaderOverlay } from "@/components/loader";
import { Notification } from "@/components/notification";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

/**
 * Home
 * Main analysis screen. Also displays auth status in header using /api/auth/me.
 * Shows Login when unauthenticated; shows user email and Logout when authenticated.
 */
export default function Home() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | undefined>();
  const [notif, setNotif] = useState<{ title: string; description?: string; variant?: "success"|"error"|"info"; visible: boolean }>({ title: "", visible: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: historyData, isFetching: isHistoryFetching } = useQuery<Analysis[]>({
    queryKey: ["/api/history"],
    select: (data) => normalizeAnalyses(data),
  });

  const { data: me } = useQuery<AuthMeResponse | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<AuthMeResponse | null>({ on401: "returnNull" }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Logged out", description: "You have been signed out." });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest<AnalyzeResponse>("POST", "/api/analyze", { text });
    },
    onMutate: () => {
      // Show loader immediately on click, before network starts
      setIsSubmitting(true);
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
    onError: (err: any) => {
      setNotif({ title: "Analyze failed", description: String(err?.message || ""), variant: "error", visible: true });
    },
    onSettled: () => {
      // Hide loader once we have the final result
      setIsSubmitting(false);
    },
  });

  const isAnalyzing = isSubmitting || analyzeMutation.isPending;
  const hasResults = historyData && historyData.length > 0;
  const currentAnalysis = hasResults ? historyData[0] : undefined;

  return (
    <div className="min-h-screen">
      <LoaderOverlay visible={isAnalyzing} />
      <Notification
        visible={notif.visible}
        title={notif.title}
        description={notif.description}
        variant={notif.variant}
        onClose={() => setNotif(v => ({ ...v, visible: false }))}
      />
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {me ? (
              <>
                <span className="text-sm text-muted-foreground">{me.email}</span>
                <Button variant="outline" onClick={() => logoutMutation.mutate()}>Logout</Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnalysisInput
              onAnalyze={(text) => analyzeMutation.mutate(text)}
              isLoading={isAnalyzing}
            />
            {/* Avoid any intermediate UI between loader and final results */}
            {!isAnalyzing && hasResults && currentAnalysis ? (
              <AnalysisResults analysis={currentAnalysis} />
            ) : !isAnalyzing && !hasResults ? (
              <EmptyState />
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <AnalysisTable
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
