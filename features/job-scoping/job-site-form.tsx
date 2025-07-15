'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobSiteFormProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export function JobSiteForm({ onNext, onPrevious }: JobSiteFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Site Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Job site form component - placeholder for development
        </div>
        <div className="flex gap-2">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
          {onNext && (
            <Button onClick={onNext}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}