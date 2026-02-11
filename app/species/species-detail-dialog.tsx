"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import EditSpeciesDialog from "./edit-species-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesDetailDialogProps {
  species: Species;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export default function SpeciesDetailDialog({ species, open, onOpenChange, userId }: SpeciesDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">{species.scientific_name}</DialogTitle>
          <DialogDescription className="text-lg italic">{species.common_name || "No common name"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {species.image && (
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
            </div>
          )}
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Kingdom</h3>
              <p className="text-lg">{species.kingdom}</p>
            </div>
            {species.total_population !== null && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Total Population</h3>
                <p className="text-lg">{species.total_population.toLocaleString()}</p>
              </div>
            )}
          </div>
          {species.description && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Description</h3>
                <p className="text-base leading-relaxed">{species.description}</p>
              </div>
            </>
          )}
          <Separator />
          <div className="flex justify-end gap-2">
            {userId && species.author === userId && <EditSpeciesDialog species={species} userId={userId} />}
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
