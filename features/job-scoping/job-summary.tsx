'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobSummaryProps {
  onEdit?: () => void;
  onSubmit?: () => void;
}

export function JobSummary({ onEdit, onSubmit }: JobSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Job summary component - placeholder for development
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onSubmit && (
            <Button onClick={onSubmit}>
              Create Job
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}