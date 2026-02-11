"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import DeleteSpeciesButton from "./delete-species-button";
import EditSpeciesDialog from "./edit-species-dialog";
import { type SpeciesWithAuthor } from "./types";

interface SpeciesDetailDialogProps {
  species: SpeciesWithAuthor;
  trigger: React.ReactNode;
  userId: string;
}

export default function SpeciesDetailDialog({ species, trigger, userId }: SpeciesDetailDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">{species.scientific_name}</DialogTitle>
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
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Scientific Name</h3>
              <p className="text-lg">{species.scientific_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Common Name</h3>
              <p className="text-lg">{species.common_name || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Kingdom</h3>
              <p className="text-lg">{species.kingdom}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Total Population</h3>
              <p className="text-lg">{species.total_population?.toLocaleString() ?? "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Endangered</h3>
              <p className="text-lg">{species.endangered ? "Yes" : "No"}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Author</h3>
              <p className="text-lg">{species.profiles?.display_name ?? "Unknown user"}</p>
              <p className="text-sm text-muted-foreground">{species.profiles?.email ?? "No email available"}</p>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Description</h3>
            <p className="text-base leading-relaxed">{species.description || "N/A"}</p>
          </div>
          {species.author === userId && (
            <>
              <Separator />
              <div className="flex justify-end gap-2">
                <EditSpeciesDialog species={species} userId={userId} />
                <DeleteSpeciesButton
                  speciesId={species.id}
                  speciesName={species.scientific_name}
                  userId={userId}
                  authorId={species.author}
                  onDeleted={() => setOpen(false)}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
