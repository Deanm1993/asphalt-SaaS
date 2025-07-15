'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobEquipmentFormProps {
  onNext?: () => void;
  onPrevious?: () => void;
}

export function JobEquipmentForm({ onNext, onPrevious }: JobEquipmentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Equipment form component - placeholder for development
        </div>
        <div className="flex gap-2">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
          {onNext && (
            <Button onClick={onNext}>
              Finish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}