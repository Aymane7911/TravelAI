package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type QuestionAnswer struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type TravelRequest struct {
	Answers []QuestionAnswer `json:"answers"`
}

type AlternativeDestination struct {
	Name   string `json:"name"`
	Score  int    `json:"score"`
	Reason string `json:"reason"`
}

type Weather struct {
	Temp      string `json:"temp"`
	Condition string `json:"condition"`
}

type LocalPhrase struct {
	English string `json:"english"`
	Local   string `json:"local"`
}

type DayItinerary struct {
	Day        int      `json:"day"`
	Activities []string `json:"activities"`
}

type TravelRecommendation struct {
	Destination             string                   `json:"destination"`
	Reason                  string                   `json:"reason"`
	Activities              []string                 `json:"activities"`
	BestTime                string                   `json:"bestTime"`
	Budget                  string                   `json:"budget"`
	Duration                string                   `json:"duration"`
	Highlights              []string                 `json:"highlights"`
	TravelTips              []string                 `json:"travelTips"`
	AlternativeDestinations []AlternativeDestination `json:"alternativeDestinations"`
	Weather                 Weather                  `json:"weather"`
	FlightEstimate          string                   `json:"flightEstimate"`
	LocalCurrency           string                   `json:"localCurrency"`
	SafetyRating            string                   `json:"safetyRating"`
	PackingList             []string                 `json:"packingList"`
	LocalPhrases            []LocalPhrase            `json:"localPhrases"`
	Itinerary               []DayItinerary           `json:"itinerary"`
}

// Groq API structures
type GroqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GroqRequest struct {
	Model       string        `json:"model"`
	Messages    []GroqMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
}

type GroqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}

func getQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	questions := []map[string]interface{}{
		{
			"id":       1,
			"question": "What's your current mood or how do you want to feel during this trip?",
			"type":     "text",
			"options":  []string{"Adventurous", "Relaxed", "Romantic", "Cultural", "Energetic"},
		},
		{
			"id":       2,
			"question": "What type of activities do you enjoy most?",
			"type":     "multiple",
			"options":  []string{"Outdoor adventures", "Beach & water sports", "Historical sites", "Food & culinary", "Shopping", "Nightlife", "Wildlife & nature", "Art & museums"},
		},
		{
			"id":       3,
			"question": "What's your preferred climate?",
			"type":     "text",
			"options":  []string{"Tropical/Hot", "Mild/Temperate", "Cold/Snowy", "Desert/Dry"},
		},
		{
			"id":       4,
			"question": "What's your budget range for this trip?",
			"type":     "text",
			"options":  []string{"Budget ($-$$)", "Mid-range ($$$)", "Luxury ($$$$)", "Ultra-luxury ($$$$$)"},
		},
		{
			"id":       5,
			"question": "How long do you plan to travel?",
			"type":     "text",
			"options":  []string{"Weekend (2-3 days)", "Short trip (4-7 days)", "Week+ (8-14 days)", "Extended (15+ days)"},
		},
		{
			"id":       6,
			"question": "Do you prefer urban cities or natural landscapes?",
			"type":     "text",
			"options":  []string{"Big cities", "Small towns", "Nature/countryside", "Mix of both"},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}

func getRecommendationHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var travelReq TravelRequest
	if err := json.NewDecoder(r.Body).Decode(&travelReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Build prompt for Groq
	prompt := buildPrompt(travelReq.Answers)

	// Call Groq API
	recommendation, err := callGroqAPI(prompt)
	if err != nil {
		log.Printf("Error calling Groq API: %v", err)
		http.Error(w, "Error generating recommendation", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recommendation)
}

func buildPrompt(answers []QuestionAnswer) string {
	prompt := "You are an expert travel advisor. Based on the following user preferences, recommend the perfect travel destination. Provide a detailed recommendation in JSON format.\n\nUser Preferences:\n"

	for _, qa := range answers {
		prompt += fmt.Sprintf("- %s: %s\n", qa.Question, qa.Answer)
	}

	prompt += `

Please analyze these preferences and provide a travel recommendation in the following JSON format (respond ONLY with valid JSON, no markdown or additional text):

{
  "destination": "City/Country name",
  "reason": "A compelling 2-3 sentence explanation of why this destination perfectly matches their preferences",
  "activities": ["activity1", "activity2", "activity3", "activity4"],
  "bestTime": "Best time to visit (e.g., 'April to October' or 'Year-round')",
  "budget": "Budget category and daily estimate (e.g., 'Mid-range: $100-200 per day' or 'Luxury: $300+ per day')",
  "duration": "Recommended trip duration (e.g., '5-7 days' or '10-14 days')",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "travelTips": ["tip1", "tip2", "tip3"],
  "alternativeDestinations": [
    {
      "name": "Alternative City/Country 1",
      "score": 85,
      "reason": "Why this is also a good match"
    },
    {
      "name": "Alternative City/Country 2",
      "score": 80,
      "reason": "Why this is also a good match"
    }
  ],
  "weather": {
    "temp": "Temperature range (e.g., '75-85°F' or '20-28°C')",
    "condition": "General weather (e.g., 'Sunny', 'Mild', 'Tropical')"
  },
  "flightEstimate": "Flight cost estimate from major hubs (e.g., '$600-$1,200' or '$300-$600')",
  "localCurrency": "Local currency code (e.g., 'EUR', 'USD', 'JPY')",
  "safetyRating": "Safety level (e.g., 'Very Safe', 'Safe', 'Exercise Caution')",
  "packingList": ["Essential item 1", "Essential item 2", "Essential item 3", "Essential item 4", "Essential item 5"],
  "localPhrases": [
    {"english": "Hello", "local": "Translation"},
    {"english": "Thank you", "local": "Translation"},
    {"english": "Where is...?", "local": "Translation"},
    {"english": "How much?", "local": "Translation"}
  ],
  "itinerary": [
    {"day": 1, "activities": ["Activity 1", "Activity 2", "Activity 3"]},
    {"day": 2, "activities": ["Activity 1", "Activity 2", "Activity 3"]},
    {"day": 3, "activities": ["Activity 1", "Activity 2", "Activity 3"]},
    {"day": 4, "activities": ["Activity 1", "Activity 2", "Activity 3"]},
    {"day": 5, "activities": ["Activity 1", "Activity 2", "Activity 3"]}
  ]
}

Important: 
- The alternativeDestinations should be 2-3 other destinations that also match their preferences well
- Scores should be between 70-90 (since the main destination is the best match at ~95-100)
- Make sure alternatives are diverse and genuinely different from the main recommendation
- Consider different continents or travel styles for the alternatives
- Provide realistic flight estimates based on typical costs from major international hubs
- Itinerary should match the recommended duration (adjust number of days as needed)
- Local phrases should be accurate translations in the destination's primary language
- Packing list should be specific to the destination's climate and activities`

	return prompt
}

func callGroqAPI(prompt string) (*TravelRecommendation, error) {
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GROQ_API_KEY environment variable not set")
	}

	reqBody := GroqRequest{
		Model:       "llama-3.3-70b-versatile",
		Temperature: 0.7,
		MaxTokens:   2048,
		Messages: []GroqMessage{
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var groqResp GroqResponse
	if err := json.Unmarshal(body, &groqResp); err != nil {
		return nil, err
	}

	if len(groqResp.Choices) == 0 {
		return nil, fmt.Errorf("empty response from Groq API")
	}

	content := groqResp.Choices[0].Message.Content

	content = cleanJSONResponse(content)

	var recommendation TravelRecommendation
	if err := json.Unmarshal([]byte(content), &recommendation); err != nil {
		return nil, fmt.Errorf("error parsing recommendation: %v. Content: %s", err, content)
	}

	return &recommendation, nil
}

func cleanJSONResponse(content string) string {
	if len(content) > 7 && content[:7] == "```json" {
		content = content[7:]
	}
	if len(content) > 3 && content[:3] == "```" {
		content = content[3:]
	}
	if len(content) > 3 && content[len(content)-3:] == "```" {
		content = content[:len(content)-3]
	}
	return content
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get PORT from environment variable (Render provides this)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback for local dev
	}

	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	http.HandleFunc("/api/questions", getQuestionsHandler)
	http.HandleFunc("/api/recommend", getRecommendationHandler)

	// Use the port variable in ListenAndServe
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}