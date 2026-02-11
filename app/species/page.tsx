import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesListClient from "./species-list-client";
import { type SpeciesWithAuthor } from "./types";

export default async function SpeciesList() {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  // Obtain the ID of the currently signed-in user
  const sessionId = user.id;

  const { data: species } = await supabase
    .from("species")
    .select("*, profiles:author(display_name, email)")
    .order("id", { ascending: false });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>
        <AddSpeciesDialog userId={sessionId} />
      </div>
      <Separator className="my-4" />
      <SpeciesListClient species={(species || []) as SpeciesWithAuthor[]} userId={sessionId} />
    </>
  );
}
