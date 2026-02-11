/* eslint-disable */
import { createServerSupabaseClient } from "@/lib/server-utils";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];

export async function generateResponse(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase().trim();

  // Check if the message is about species
  if (!lowerMessage.includes("species") && !lowerMessage.includes("animal") && !lowerMessage.includes("plant") && 
      !lowerMessage.includes("fungi") && !lowerMessage.includes("kingdom") && !lowerMessage.includes("population") &&
      !lowerMessage.includes("what") && !lowerMessage.includes("tell") && !lowerMessage.includes("about") &&
      !lowerMessage.includes("how") && !lowerMessage.includes("which") && !lowerMessage.includes("list")) {
    return "I'm a specialized chatbot for answering questions about species in the Biodiversity Hub database. Please ask me about animals, plants, fungi, or other species-related topics!";
  }

  const supabase = createServerSupabaseClient();
  const { data: species, error } = await supabase.from("species").select("*");

  if (error || !species || species.length === 0) {
    return "I'm sorry, I couldn't retrieve species data from the database. Please try again later.";
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
