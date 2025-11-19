import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle2, XCircle, HelpCircle, ExternalLink } from "lucide-react";
import type { Claim } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ClaimCardProps {
  claim: Claim;
  index: number;
}

export function ClaimCard({ claim, index }: ClaimCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig = {
    Supported: {
      icon: CheckCircle2,
      color: "bg-success text-success-foreground",
      textColor: "text-success",
    },
    Unclear: {
      icon: HelpCircle,
      color: "bg-warning text-warning-foreground",
      textColor: "text-warning",
    },
    Contradicted: {
      icon: XCircle,
      color: "bg-destructive text-destructive-foreground",
      textColor: "text-destructive",
    },
  };

  const config = statusConfig[claim.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-testid={`card-claim-${claim.id}`}
    >
      <Card className="hover-elevate">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
          <Badge className={`${config.color} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {claim.status}
          </Badge>
          <div className={`text-2xl font-bold ${config.textColor}`} data-testid={`text-score-${claim.id}`}>
            {claim.score}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base font-medium leading-relaxed" data-testid={`text-claim-${claim.id}`}>
            {claim.text}
          </p>
          
          {claim.evidence.length > 0 && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between"
                  data-testid={`button-toggle-evidence-${claim.id}`}
                >
                  <span className="text-sm font-medium">
                    View Evidence ({claim.evidence.length})
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0 }}
                  className="space-y-3 pt-3"
                >
                  {claim.evidence.map((snippet, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg bg-muted/50 space-y-2"
                      data-testid={`evidence-snippet-${claim.id}-${idx}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-sm font-semibold text-foreground">
                          {snippet.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {snippet.relevanceScore}% match
                        </span>
                      </div>
                      <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                        {snippet.snippet}
                      </p>
                      <a
                        href={snippet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        data-testid={`link-evidence-${claim.id}-${idx}`}
                      >
                        Read more
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </motion.div>
                  ))}
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-2">
          Verified using {claim.verificationMethod}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
