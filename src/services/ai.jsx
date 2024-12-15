import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1, // Controls randomness; valid values are usually 0.1 to 1.0
  topP: 0.95, // Cumulative probability threshold
  topK: 40, // Updated to the maximum supported value within range (1–40)
  maxOutputTokens: 8192, // Maximum number of tokens in the response
  responseMimeType: "application/json", // Response format
};

export const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: `
Please create a detailed travel plan with the following specifications:

Location: Las Vegas
Duration: 3 days
Travelers: A Couple
Budget Level: Cheap
Preferred Activities: City Sightseeing, Entertainment

Please provide:
1. Hotel Options (3-4 choices):
   - Name, Address, Price per night
   - Rating and Brief description
   - Location coordinates
   - Representative image URL

2. Daily Itinerary:
   - Day-by-day breakdown
   - For each attraction/activity:
     * Name and description
     * Location coordinates
     * Entrance fees/costs
     * Recommended duration
     * Best time to visit

3. Estimated Costs (in USD):
   - Transportation options and rates
   - Dining costs by category
   - Activity/entrance fees

Please format the response as a JSON object.`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "I'll help you plan your Las Vegas trip with detailed information formatted in JSON.",
        },
      ],
    },
  ],
});
