"use client"

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SignupOptionCardProps {
  id: string;
  title: string;
  description?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export default function SignupOptionCard({
  id,
  title,
  description,
  selected = false,
  onSelect,
  className,
}: SignupOptionCardProps) {
  return (
    <Card
      className={cn(
        "flex items-center gap-4 cursor-pointer border-border hover:border-border/70",
        selected ? "border-primary bg-muted/5" : "",
        className
      )}
      onClick={() => onSelect?.(id)}
    >
      <CardContent className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted/10">
          {/* placeholder icon box */}
          <div className="h-6 w-6 rounded-sm bg-primary/30" />
        </div>

        <div className="flex-1">
          <div className="text-sm font-semibold">{title}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          )}
        </div>

        <div className="flex items-center">
          <div
            className={cn(
              "h-4 w-4 rounded-full border border-input flex items-center justify-center",
              selected ? "bg-primary" : "bg-transparent"
            )}
            aria-hidden
          />
        </div>
      </CardContent>
    </Card>
  );
}
