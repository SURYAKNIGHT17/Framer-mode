import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzeRequestSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface AnalysisInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const formSchema = analyzeRequestSchema.extend({
  text: z.string().min(10, "Text must be at least 10 characters"),
});

export function AnalysisInput({ onAnalyze, isLoading }: AnalysisInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  const text = form.watch("text");
  const charCount = text.length;

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAnalyze(values.text);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter text to analyze</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste AI-generated content or any text you want to verify for factual accuracy..."
                      className="min-h-48 resize-none text-base font-mono"
                      disabled={isLoading}
                      data-testid="input-analysis-text"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {charCount} character{charCount !== 1 ? "s" : ""}
                      {charCount > 0 && charCount < 10 && (
                        <span className="text-destructive ml-2">
                          (minimum 10 characters)
                        </span>
                      )}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full"
              data-testid="button-analyze"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Text"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </motion.div>
  );
}
