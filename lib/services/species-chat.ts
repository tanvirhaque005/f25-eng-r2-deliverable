/* eslint-disable */
import { createServerSupabaseClient } from "@/lib/server-utils";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];

export async function generateResponse(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase().trim();

  const supabase = await createServerSupabaseClient();
  const { data: species, error } = await supabase.from("species").select("*");

  if (error || !species || species.length === 0) {
    return "I'm sorry, I couldn't retrieve species data from the database. Please try again later.";
  }

  const matchedSpecies = species.filter(
    (s) =>
      lowerMessage.includes(s.scientific_name.toLowerCase()) ||
      (s.common_name && lowerMessage.includes(s.common_name.toLowerCase()))
  );

  if (lowerMessage.includes("compare") || lowerMessage.includes(" versus ") || lowerMessage.includes(" vs ")) {
    if (matchedSpecies.length >= 2) {
      const first = matchedSpecies[0];
      const second = matchedSpecies[1];
      if (!first || !second) {
        return "I couldn't compare those species. Please try using exact species names from the database.";
      }

      return (
        `**Comparison: ${first.scientific_name} vs ${second.scientific_name}**\n\n` +
        `- **${first.scientific_name}** (${first.common_name ?? "N/A"})\n` +
        `  - Kingdom: ${first.kingdom}\n` +
        `  - Population: ${first.total_population?.toLocaleString() ?? "N/A"}\n` +
        `- **${second.scientific_name}** (${second.common_name ?? "N/A"})\n` +
        `  - Kingdom: ${second.kingdom}\n` +
        `  - Population: ${second.total_population?.toLocaleString() ?? "N/A"}\n\n` +
        "I can compare more fields if you ask for a specific metric (for example: population, kingdom, or description)."
      );
    }

    return (
      "I can compare species, but I couldn't find both species names in the current database. " +
      "Try using exact names from your species list."
    );
  }

  // Search for specific species by name
  const speciesNameMatch = species.find(
    (s) =>
      s.scientific_name.toLowerCase().includes(lowerMessage) ||
      (s.common_name && s.common_name.toLowerCase().includes(lowerMessage))
  );

  if (speciesNameMatch) {
    let response = `**${speciesNameMatch.scientific_name}**`;
    if (speciesNameMatch.common_name) {
      response += ` (${speciesNameMatch.common_name})`;
    }
    response += `\n\n`;
    response += `**Kingdom:** ${speciesNameMatch.kingdom}\n`;
    if (speciesNameMatch.total_population !== null) {
      response += `**Total Population:** ${speciesNameMatch.total_population.toLocaleString()}\n`;
    }
    if (speciesNameMatch.description) {
      response += `\n**Description:**\n${speciesNameMatch.description}`;
    }
    return response;
  }

  // Answer questions about kingdoms
  if (lowerMessage.includes("kingdom")) {
    const kingdoms = ["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"];
    const kingdomCounts: Record<string, number> = {};
    
    species.forEach((s) => {
      kingdomCounts[s.kingdom] = (kingdomCounts[s.kingdom] || 0) + 1;
    });

    let response = "Here's a breakdown of species by kingdom:\n\n";
    kingdoms.forEach((kingdom) => {
      const count = kingdomCounts[kingdom] || 0;
      response += `- **${kingdom}**: ${count} species\n`;
    });
    return response;
  }

  // Answer questions about population
  if (lowerMessage.includes("population")) {
    const speciesWithPopulation = species.filter((s) => s.total_population !== null) as Array<
      Species & { total_population: number }
    >;
    
    if (speciesWithPopulation.length === 0) {
      return "I don't have population data for any species in the database.";
    }

    const totalPopulation = speciesWithPopulation.reduce((sum, s) => sum + s.total_population, 0);
    const avgPopulation = Math.round(totalPopulation / speciesWithPopulation.length);
    const maxSpecies = speciesWithPopulation.reduce((max, s) =>
      s.total_population > max.total_population ? s : max
    );
    const minSpecies = speciesWithPopulation.reduce((min, s) =>
      s.total_population < min.total_population ? s : min
    );

    let response = `**Population Statistics:**\n\n`;
    response += `- Total species with population data: ${speciesWithPopulation.length}\n`;
    response += `- Average population: ${avgPopulation.toLocaleString()}\n`;
    response += `- Highest population: **${maxSpecies.scientific_name}** with ${maxSpecies.total_population.toLocaleString()}\n`;
    response += `- Lowest population: **${minSpecies.scientific_name}** with ${minSpecies.total_population.toLocaleString()}\n`;
    return response;
  }

  // List all species
  if (lowerMessage.includes("list") || lowerMessage.includes("all species") || lowerMessage.includes("what species")) {
    let response = `Here are all ${species.length} species in the database:\n\n`;
    species.forEach((s, index) => {
      response += `${index + 1}. **${s.scientific_name}**`;
      if (s.common_name) {
        response += ` (${s.common_name})`;
      }
      response += ` - ${s.kingdom}\n`;
    });
    return response;
  }

  // Search by kingdom
  const kingdomKeywords: Record<string, string[]> = {
    Animalia: ["animal", "animals", "mammal", "bird", "fish", "reptile", "amphibian"],
    Plantae: ["plant", "plants", "tree", "flower", "vegetable"],
    Fungi: ["fungus", "fungi", "mushroom"],
  };

  for (const [kingdom, keywords] of Object.entries(kingdomKeywords)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      const kingdomSpecies = species.filter((s) => s.kingdom === kingdom);
      if (kingdomSpecies.length === 0) {
        return `I don't have any ${kingdom} species in the database.`;
      }
      let response = `Here are the ${kingdomSpecies.length} ${kingdom} species in the database:\n\n`;
      kingdomSpecies.forEach((s, index) => {
        response += `${index + 1}. **${s.scientific_name}**`;
        if (s.common_name) {
          response += ` (${s.common_name})`;
        }
        response += `\n`;
      });
      return response;
    }
  }

  // General response
  return `I can help you learn about species in the Biodiversity Hub database! Here's what I can tell you about:\n\n` +
    `- **${species.length} total species** in the database\n` +
    `- Information about specific species (ask by scientific or common name)\n` +
    `- Species grouped by kingdom (Animalia, Plantae, Fungi, etc.)\n` +
    `- Population statistics\n` +
    `- List all species\n\n` +
    `Try asking questions like:\n` +
    `- "Tell me about [species name]"\n` +
    `- "What kingdoms are represented?"\n` +
    `- "List all animals"\n` +
    `- "Population statistics"`;
}
