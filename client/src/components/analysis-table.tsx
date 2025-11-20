import React from "react";
import type { Analysis } from "@shared/schema";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

/**
 * AnalysisTable
 * Displays past analyses in a visually harmonious table matching the app's background scheme.
 * Rows are clickable to select an analysis for viewing.
 */
export function AnalysisTable({ analyses, selectedId, onSelect }: {
  analyses: Analysis[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-card/70 backdrop-blur-sm">
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground/80">History</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Score</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Claims</TableHead>
            <TableHead>Excerpt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analyses.map((a) => {
            const isSelected = a.id === selectedId;
            return (
              <TableRow
                key={a.id}
                onClick={() => onSelect(a.id)}
                className={[
                  "cursor-pointer transition-colors",
                  isSelected ? "bg-primary/10" : "hover:bg-muted/40",
                ].join(" ")}
              >
                <TableCell>
                  <span className="inline-flex h-6 min-w-[44px] items-center justify-center rounded-md bg-primary/15 text-primary text-sm font-medium">
                    {Math.round(a.trustScore)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {a.claims.length}
                </TableCell>
                <TableCell className="text-sm text-foreground/80 truncate max-w-[240px]">
                  {a.inputText}
                </TableCell>
              </TableRow>
            );
          })}
          {analyses.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                No analyses yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}