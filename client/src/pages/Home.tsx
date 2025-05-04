import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import IntroScreen from "@/components/IntroScreen";
import AIAssistantScreen from "@/components/AIAssistantScreen";
import RecommendationsScreen from "@/components/RecommendationsScreen";
import BottomNav from "@/components/BottomNav";
import { GenderType, UserPreferences } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type AppScreen = "splash" | "intro" | "ai-assistant" | "recommendations";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  
  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/recommendations', userPreferences],
    enabled: currentScreen === "recommendations" && Object.keys(userPreferences).length > 0,
  });

  const handleSplashComplete = () => {
    setCurrentScreen("intro");
  };

  const handleGenderSelect = (gender: GenderType) => {
    setUserPreferences(prev => ({ ...prev, gender }));
    setCurrentScreen("ai-assistant");
  };

  const handleSkipIntro = () => {
    setCurrentScreen("ai-assistant");
  };

  const handleBackToIntro = () => {
    setCurrentScreen("intro");
  };

  const handleAIComplete = (preferences: UserPreferences) => {
    setUserPreferences(prev => ({ ...prev, ...preferences }));
    setCurrentScreen("recommendations");
  };

  const handleBackToAI = () => {
    setCurrentScreen("ai-assistant");
  };
  
  return (
    <div id="app" className="max-w-md mx-auto bg-white min-h-screen relative shadow-lg">
      {currentScreen === "splash" && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {currentScreen === "intro" && (
        <IntroScreen 
          onGenderSelect={handleGenderSelect}
          onSkip={handleSkipIntro}
        />
      )}
      
      {currentScreen === "ai-assistant" && (
        <AIAssistantScreen 
          onBack={handleBackToIntro}
          onComplete={handleAIComplete}
          initialPreferences={userPreferences}
        />
      )}
      
      {currentScreen === "recommendations" && (
        <RecommendationsScreen 
          onBack={handleBackToAI}
          recommendations={recommendations}
        />
      )}
      
      {currentScreen !== "splash" && currentScreen !== "ai-assistant" && (
        <BottomNav />
      )}
    </div>
  );
}
