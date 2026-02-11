"use client";

import type { Database } from "@/lib/schema";
import { useState, useMemo } from "react";
import SpeciesCard from "./species-card";
import SpeciesFilter from "./species-filter";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesListClientProps {
  species: Species[];
  userId: string;
}

export default function SpeciesListClient({ species, userId }: SpeciesListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [kingdomFilter, setKingdomFilter] = useState("All");

  const filteredSpecies = useMemo(() => {
    return species.filter((s) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        s.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.common_name && s.common_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by kingdom
      const matchesKingdom = kingdomFilter === "All" || s.kingdom === kingdomFilter;

      return matchesSearch && matchesKingdom;
    });
  }, [species, searchQuery, kingdomFilter]);

  return (
    <>
      <SpeciesFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        kingdomFilter={kingdomFilter}
        onKingdomFilterChange={setKingdomFilter}
      />
      {filteredSpecies.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>No species found matching your criteria.</p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center">
          {filteredSpecies.map((species) => (
            <SpeciesCard key={species.id} species={species} userId={userId} />
          ))}
        </div>
      )}
      {filteredSpecies.length > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {filteredSpecies.length} of {species.length} species
        </div>
      )}
    </>
  );
}
