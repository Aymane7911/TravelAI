"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plane, MapPin, Calendar, DollarSign, Clock, Sparkles, ArrowRight, RotateCcw, ChevronLeft, Trophy, Star, Info, Compass, Share2, Download, Camera, Heart, Shield, Languages, Wallet, Package, TrendingUp, Award, ThermometerSun, Utensils, Hotel, Lightbulb, Globe, Coffee, BookOpen } from "lucide-react";

interface Question {
  id: number;
  question: string;
  type: string;
  options: string[];
}

interface Answer {
  question: string;
  answer: string;
}

interface Recommendation {
  destination: string;
  reason: string;
  activities: string[];
  bestTime: string;
  budget: string;
  duration: string;
  highlights: string[];
  travelTips: string[] ;
  personality?: string;
  alternativeDestinations?: Array<{ name: string; score: number; reason: string }>;
  weather?: { temp: string; condition: string };
  flightEstimate?: string;
  localCurrency?: string;
  safetyRating?: string;
  packingList?: string[];
  localPhrases?: Array<{ english: string; local: string }>;
  itinerary?: Array<{ day: number; activities: string[] }>;
}

const welcomeMessages = [
  {
    title: "👋 Welcome, Traveler!",
    message: "I'm your AI Travel Advisor, here to help you discover your perfect destination!"
  },
  {
    title: "How It Works",
    message: "I'll ask you a few simple questions about your travel preferences and mood."
  },
  {
    title: "Personalized Results",
    message: "Based on your answers, I'll recommend the perfect destination tailored just for you!"
  },
  {
    title: "Ready?",
    message: "Let's embark on this journey together and find your dream vacation spot!"
  }
];

const travelPersonalities = [
  { type: "Adventure Seeker", icon: "", description: "You crave excitement and adrenaline!" },
  { type: "Culture Explorer", icon: "", description: "You love history and local traditions!" },
  { type: "Beach Lover", icon: "", description: "You seek sun, sand, and relaxation!" },
  { type: "Foodie Traveler", icon: "", description: "You travel for culinary experiences!" },
  { type: "Nature Enthusiast", icon: "", description: "You connect with the natural world!" }
];

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [startQuiz, setStartQuiz] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/questions");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError("Failed to load questions");
    }
  };

  const nextWelcomeMessage = () => {
    if (welcomeStep < welcomeMessages.length - 1) {
      setFadeOut(true);
      setTimeout(() => {
        setWelcomeStep(welcomeStep + 1);
        setFadeOut(false);
      }, 300);
    }
  };

  const handleGetStarted = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowWelcome(false);
      setStartQuiz(true);
      setFadeOut(false);
    }, 300);
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentStep];
    const newAnswers = [
      ...answers,
      { question: currentQuestion.question, answer },
    ];
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setFadeOut(false);
      }, 300);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setAnswers(answers.slice(0, -1));
        setFadeOut(false);
      }, 300);
    }
  };

  const submitAnswers = async (finalAnswers: Answer[]) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (!res.ok) {
        throw new Error("Failed to get recommendation");
      }

      const data = await res.json();
console.log("Backend response:", data);
console.log("Alternative destinations:", data.alternativeDestinations);
      const enhancedRecommendation = {
     ...data,
     personality: travelPersonalities[Math.floor(Math.random() * travelPersonalities.length)].type,
   };
      
      setRecommendation(enhancedRecommendation);
      setLoading(false);
      setShowWinner(true);
    } catch (err) {
      setError("Failed to get recommendation. Please try again.");
      setLoading(false);
    }
  };

  const handleSeeDetails = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowWinner(false);
      setShowDetails(true);
      setFadeOut(false);
    }, 300);
  };

  const handleBackToWinner = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowDetails(false);
      setShowWinner(true);
      setFadeOut(false);
    }, 300);
  };

  const handleShare = () => {
    if (navigator.share && recommendation) {
      navigator.share({
        title: `My Perfect Destination: ${recommendation.destination}`,
        text: `I found my perfect travel destination: ${recommendation.destination}! ${recommendation.reason}`,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownloadPDF = () => {
    alert("PDF download feature would generate a detailed travel guide. This requires a PDF library integration.");
  };

  const resetQuiz = () => {
    setFadeOut(true);
    setTimeout(() => {
      setCurrentStep(0);
      setAnswers([]);
      setRecommendation(null);
      setShowWelcome(true);
      setWelcomeStep(0);
      setStartQuiz(false);
      setShowDetails(false);
      setShowWinner(false);
      setError("");
      setFadeOut(false);
    }, 300);
  };

  const getTravelPersonality = () => {
    if (!recommendation?.personality) return travelPersonalities[0];
    return travelPersonalities.find(p => p.type === recommendation.personality) || travelPersonalities[0];
  };

  if (showWelcome && questions.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden p-4 animate-in fade-in duration-700">
        <div className="absolute top-8 right-8 z-50 animate-in fade-in slide-in-from-top duration-500 delay-300">
          <ThemeToggle />
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-2xl w-full relative z-10">
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top duration-700 delay-200">
            <div className="relative">
              <Plane className="h-24 w-24 text-blue-600 dark:text-blue-400 animate-bounce" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            TravelAI
          </h1>

          <div className={`transition-all duration-300 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-2 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl text-center">
                  {welcomeMessages[welcomeStep].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-lg text-muted-foreground leading-relaxed">
                  {welcomeMessages[welcomeStep].message}
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                {welcomeStep < welcomeMessages.length - 1 ? (
                  <Button 
                    onClick={nextWelcomeMessage}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Next
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Get Started
                    
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {welcomeMessages.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === welcomeStep 
                    ? 'w-8 bg-blue-600 dark:bg-blue-400' 
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-in fade-in duration-500">
        <div className="absolute top-8 right-8 z-50 animate-in fade-in slide-in-from-top duration-500">
          <ThemeToggle />
        </div>
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-2 shadow-2xl animate-in fade-in zoom-in duration-700">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Plane className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-bounce" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analyzing Your Preferences
              </h2>
              <p className="text-muted-foreground animate-pulse">
                Finding your perfect destination...
              </p>
              <div className="space-y-1 pt-4">
                <p className="text-sm text-muted-foreground">✨ Matching your travel style</p>
                <p className="text-sm text-muted-foreground">🌍 Exploring destinations</p>
                <p className="text-sm text-muted-foreground">🎯 Personalizing recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWinner && recommendation) {
    const personality = getTravelPersonality();
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20 relative overflow-hidden p-4 animate-in fade-in duration-700">
        <div className="absolute top-8 right-8 z-50 animate-in fade-in slide-in-from-top duration-500 delay-300">
          <ThemeToggle />
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                backgroundColor: ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className={`text-center space-y-8 max-w-2xl w-full relative z-10 transition-all duration-300 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="flex justify-center animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative">
              <Trophy className="h-32 w-32 text-yellow-500 animate-bounce" />
              <Star className="absolute -top-4 -right-4 h-12 w-12 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
              <Star className="absolute -bottom-2 -left-2 h-8 w-8 text-orange-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-pulse">
              🎉 WINNER! 🎉
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-medium">
              Your Perfect Destination Is...
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-4 border-yellow-400 shadow-2xl transform hover:scale-105 transition-transform animate-in fade-in slide-in-from-bottom duration-700 delay-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-lg px-4 py-1">
                  Perfect Match
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-lg px-4 py-1">
                  {personality.icon} {personality.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {recommendation.destination}
              </h2>
              <p className="text-lg text-muted-foreground px-4">
                {recommendation.reason}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <ThermometerSun className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-muted-foreground">Weather</p>
                  <p className="text-sm font-bold">{recommendation.weather?.condition}</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-muted-foreground">Safety</p>
                  <p className="text-sm font-bold">{recommendation.safetyRating}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <Plane className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-muted-foreground">Flights</p>
                  <p className="text-sm font-bold">{recommendation.flightEstimate}</p>
                </div>
                <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <Wallet className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <p className="text-sm font-bold">{recommendation.localCurrency}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-3 pt-2">
              <Button 
                onClick={handleSeeDetails}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8"
              >
                <Info className="mr-2 h-5 w-5" />
                See Full Details
              </Button>
            </CardFooter>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-2 animate-in fade-in slide-in-from-bottom duration-700 delay-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Your Travel Personality</p>
                  <p className="text-xl font-bold">{personality.icon} {personality.type}</p>
                  <p className="text-sm text-muted-foreground">{personality.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showDetails && recommendation) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-in fade-in duration-700">
        <div className="absolute top-8 right-8 z-50 animate-in fade-in slide-in-from-top duration-500 delay-300">
          <ThemeToggle />
        </div>
        
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <Button 
              onClick={handleBackToWinner}
              variant="outline"
              className="hover:scale-105 transition-transform"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Winner
            </Button>
          </div>

          <Card className="overflow-hidden border-2 shadow-2xl animate-in fade-in slide-in-from-top duration-700 delay-200">
  <CardHeader className="bg-white dark:bg-gray-900 border-b-2 relative">
    <div className="absolute top-4 right-4 flex gap-2">
      <Button 
        onClick={handleShare}
        size="sm"
        variant="outline"
        className="hover:scale-105 transition-transform"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button 
        onClick={handleDownloadPDF}
        size="sm"
        variant="outline"
        className="hover:scale-105 transition-transform"
      >
        <Download className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
    <div className="space-y-3 pr-32">
      <Badge className="bg-blue-600 hover:bg-blue-700">
        <Trophy className="h-4 w-4 mr-1" />
        Your Perfect Match
      </Badge>
      <CardTitle className="text-5xl font-bold">{recommendation.destination}</CardTitle>
      <p className="text-xl text-muted-foreground max-w-3xl">{recommendation.reason}</p>
    </div>
  </CardHeader>
</Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto animate-in fade-in slide-in-from-bottom duration-500 delay-300">
              <TabsTrigger value="overview" className="gap-2">
                <Globe className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="gap-2">
                <Calendar className="h-4 w-4" />
                Itinerary
              </TabsTrigger>
              <TabsTrigger value="practical" className="gap-2">
                <Package className="h-4 w-4" />
                Practical
              </TabsTrigger>
              <TabsTrigger value="explore" className="gap-2">
                <Camera className="h-4 w-4" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="alternatives" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Alternatives
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Time to Visit</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{recommendation.bestTime}</div>
                    <p className="text-xs text-muted-foreground mt-1">{recommendation.weather?.temp}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recommended Duration</CardTitle>
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{recommendation.duration}</div>
                    <p className="text-xs text-muted-foreground mt-1">Perfect for this destination</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estimated Budget</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{recommendation.budget}</div>
                    <p className="text-xs text-muted-foreground mt-1">Per person estimate</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Compass className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-xl">Recommended Activities</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendation.activities.map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-sm pt-1">{activity}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-600" />
                      <CardTitle className="text-xl">Top Highlights</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendation.highlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors"
                        >
                          <Sparkles className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                    <CardTitle className="text-xl">Essential Travel Tips</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendation.travelTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-6 mt-6">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                    <CardTitle className="text-xl">Suggested {recommendation.duration} Itinerary</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    A carefully curated day-by-day plan to make the most of your trip
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendation.itinerary?.map((day, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-indigo-600 pl-4 py-3 bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/30 rounded-r-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-indigo-600">Day {day.day}</Badge>
                          <h3 className="font-semibold text-lg">
                            {day.day === 1 ? "Arrival & First Impressions" : 
                             day.day === (recommendation.itinerary?.length || 0) ? "Departure Day" : 
                             `Exploration Day ${day.day}`}
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {day.activities.map((activity, actIdx) => (
                            <li key={actIdx} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practical" className="space-y-6 mt-6">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-xl">Flight Deals to {recommendation.destination}</CardTitle>
                    </div>
                    <Badge className="bg-blue-600">Limited Time</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Find the best flight deals and save on your journey
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Best Price</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mb-1">{recommendation.flightEstimate}</p>
                      <p className="text-xs text-muted-foreground mb-3">Round trip estimate</p>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                       onClick={() => {
  const destination = recommendation.destination.split(',')[0].trim();
  window.open(`https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(destination)}`, '_blank');
}}
                      >
                        <Plane className="mr-2 h-4 w-4" />
                        Search Flights
                      </Button>
                    </div>

                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        <span className="font-semibold">Flexible Dates</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Save up to 30% by choosing flexible travel dates</p>
                      <Button 
                        variant="outline"
                        className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                        onClick={() => {
  const destination = recommendation.destination.split(',')[0].trim();
  window.open(`https://www.google.com/travel/explore?q=${encodeURIComponent(destination)}`, '_blank');
}}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Explore Dates
                      </Button>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">Price Alerts</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Get notified when prices drop for your destination</p>
                      <Button 
                        variant="outline"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                       onClick={() => {
  const destination = recommendation.destination.split(',')[0].trim();
  window.open(`https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(destination)}`, '_blank');
  // Note: Users will need to search for specific dates and then click "Track prices" button
}}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Set Alert
                      </Button>
                    </div>
                  </div>

                  <Alert className="mt-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900 dark:text-blue-100">
                      <strong>Pro Tip:</strong> Book flights 2-3 months in advance for the best deals. Tuesday and Wednesday flights are often cheaper!
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Package className="h-6 w-6 text-green-600" />
                      <CardTitle className="text-xl">Packing Checklist</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {recommendation.packingList?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                        >
                          <div className="w-4 h-4 border-2 border-green-600 rounded flex-shrink-0"></div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Languages className="h-6 w-6 text-pink-600" />
                      <CardTitle className="text-xl">Essential Phrases</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendation.localPhrases?.map((phrase, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-950/50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{phrase.english}</span>
                            <span className="text-sm text-muted-foreground">→</span>
                          </div>
                          <div className="text-lg font-bold text-pink-600 mt-1">{phrase.local}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-amber-600" />
                      <CardTitle className="text-sm font-medium">Currency & Costs</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Local Currency:</span>
                      <span className="font-bold">{recommendation.localCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Daily Budget:</span>
                      <span className="font-bold">{recommendation.budget}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-sm font-medium">Flight Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                      <span className="font-bold">{recommendation.flightEstimate}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Round trip estimate</div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-sm font-medium">Safety Rating</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < 4 ? "fill-green-600 text-green-600" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600">{recommendation.safetyRating}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="explore" className="space-y-6 mt-6">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Camera className="h-6 w-6 text-purple-600" />
                    <CardTitle className="text-xl">Destination Highlights</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Immerse yourself in the beauty and culture of {recommendation.destination}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: Hotel, title: "Accommodations", desc: "From luxury resorts to cozy boutique hotels", color: "blue" },
                      { icon: Utensils, title: "Local Cuisine", desc: "Savor authentic flavors and culinary delights", color: "orange" },
                      { icon: Coffee, title: "Cafes & Nightlife", desc: "Experience the vibrant local scene", color: "amber" },
                      { icon: BookOpen, title: "Cultural Sites", desc: "Discover rich history and traditions", color: "purple" }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-6 bg-${item.color}-50 dark:bg-${item.color}-950/30 rounded-lg hover:shadow-md transition-all hover:scale-105`}
                      >
                        <item.icon className={`h-8 w-8 text-${item.color}-600 mb-3`} />
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <CardContent className="pt-6 text-center space-y-2">
                    <ThermometerSun className="h-12 w-12 mx-auto text-orange-600" />
                    <h3 className="font-bold text-lg">Perfect Weather</h3>
                    <p className="text-2xl font-bold text-orange-600">{recommendation.weather?.temp}</p>
                    <p className="text-sm text-muted-foreground">{recommendation.weather?.condition}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                  <CardContent className="pt-6 text-center space-y-2">
                    <MapPin className="h-12 w-12 mx-auto text-green-600" />
                    <h3 className="font-bold text-lg">Easy to Navigate</h3>
                    <p className="text-sm text-muted-foreground">Well-connected public transport and tourist-friendly infrastructure</p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <CardContent className="pt-6 text-center space-y-2">
                    <Heart className="h-12 w-12 mx-auto text-pink-600" />
                    <h3 className="font-bold text-lg">Unforgettable</h3>
                    <p className="text-sm text-muted-foreground">Create memories that will last a lifetime</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <CardContent>
  {!recommendation.alternativeDestinations || recommendation.alternativeDestinations.length === 0 ? (
    <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        No alternative destinations available at the moment. The AI is focusing on your perfect match: <strong>{recommendation.destination}</strong>!
      </AlertDescription>
    </Alert>
  ) : (
    <div className="space-y-4">
      {recommendation.alternativeDestinations.map((alt, idx) => (
        <div
          key={idx}
          className="p-6 border-2 rounded-lg hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  #{idx + 2} Match
                </Badge>
                <h3 className="text-xl font-bold">{alt.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{alt.reason}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Match Score:</span>
                <Progress value={alt.score} className="h-2 flex-1 max-w-xs" />
                <span className="text-sm font-bold text-indigo-600">{alt.score}%</span>
              </div>
            </div>
            <MapPin className="h-8 w-8 text-indigo-600 flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  )}
</CardContent>
          </Tabs>

          <div className="flex justify-center gap-4 pb-8">
            <Button
              onClick={resetQuiz}
              size="lg"
              variant="outline"
              className="hover:scale-105 transition-transform"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Start New Quiz
            </Button>
            <Button
              onClick={handleShare}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-transform"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900/20">
        <Card className="max-w-md w-full border-2 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={resetQuiz} className="w-full mt-4">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!startQuiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Plane className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-pulse" />
            <p className="text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden p-4 animate-in fade-in duration-700">
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-3xl w-full space-y-6 relative z-10">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Question {currentStep + 1} of {questions.length}
          </h2>
          <Progress value={progress} className="h-2" />
        </div>

        <div className={`transition-all duration-300 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-2 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    variant="outline"
                    className="h-auto py-4 px-6 text-left justify-start hover:scale-105 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:border-blue-400"
                  >
                    <span className="flex-1">{option}</span>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              {currentStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="hover:scale-105 transition-transform"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        
      </div>
    </div>
  );
}