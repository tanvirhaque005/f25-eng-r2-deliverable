"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SpeciesFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  kingdomFilter: string;
  onKingdomFilterChange: (kingdom: string) => void;
}

export default function SpeciesFilter({
  searchQuery,
  onSearchChange,
  kingdomFilter,
  onKingdomFilterChange,
}: SpeciesFilterProps) {
  const kingdoms = ["All", "Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"];

  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="search" className="mb-2 block">
          Search Species
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Search by scientific or common name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="min-w-[150px]">
        <Label htmlFor="kingdom" className="mb-2 block">
          Filter by Kingdom
        </Label>
        <Select value={kingdomFilter} onValueChange={onKingdomFilterChange}>
          <SelectTrigger id="kingdom" className="w-full">
            <SelectValue placeholder="All Kingdoms" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {kingdoms.map((kingdom) => (
                <SelectItem key={kingdom} value={kingdom}>
                  {kingdom}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
