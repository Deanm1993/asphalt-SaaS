'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobMaterialsFormProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export function JobMaterialsForm({ onNext, onPrevious }: JobMaterialsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials & Equipment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Materials form component - placeholder for development
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