"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteSpeciesButtonProps {
  speciesId: number;
  speciesName: string;
  userId: string;
  authorId: string;
  onDeleted?: () => void;
}

export default function DeleteSpeciesButton({
  speciesId,
  speciesName,
  userId,
  authorId,
  onDeleted,
}: DeleteSpeciesButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (authorId !== userId) {
      return;
    }

    const confirmed = window.confirm(`Delete "${speciesName}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").delete().eq("id", speciesId);
    setIsDeleting(false);

    if (error) {
      return toast({
        title: "Could not delete species.",
        description: error.message,
        variant: "destructive",
      });
    }

    onDeleted?.();
    router.refresh();
    return toast({
      title: "Species deleted",
      description: `Deleted ${speciesName}.`,
    });
  };

  return (
    <Button variant="destructive" size="sm" disabled={isDeleting} onClick={() => void handleDelete()}>
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
