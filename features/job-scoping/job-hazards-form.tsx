'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobHazardsFormProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export function JobHazardsForm({ onNext, onPrevious }: JobHazardsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Safety & Hazards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Hazards form component - placeholder for development
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