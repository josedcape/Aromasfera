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
  
  // Clases que aplican efectos translúcidos para el contenido
  const contentClasses = `
    max-w-md mx-auto 
    min-h-screen relative 
    ${currentScreen !== "splash" ? "backdrop-blur-sm bg-white/30 border-x border-[#16deca]/20 shadow-xl" : ""}
    transition-all duration-500
  `;
  
  return (
    <div id="app" className={contentClasses}>
      {/* Elementos decorativos de fondo - sólo visibles cuando no está en splash */}
      {currentScreen !== "splash" && (
        <>
          {/* Resplandor superior */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#FF66C4]/20 to-transparent pointer-events-none z-10"></div>
          
          {/* Resplandor inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#16deca]/20 to-transparent pointer-events-none z-10"></div>
        </>
      )}
      
      {/* Pantallas de la aplicación */}
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
      
      {/* Navegación inferior - sólo visible en algunas pantallas */}
      {currentScreen !== "splash" && currentScreen !== "ai-assistant" && (
        <BottomNav />
      )}
    </div>
  );
}
