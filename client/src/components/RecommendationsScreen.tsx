import { useState } from "react";
import { RemixIcon } from "@/components/ui/remixicon";
import PerfumeCard from "./PerfumeCard";
import { Perfume } from "@/lib/utils";
import EmailCaptureModal from "./EmailCaptureModal";
import SocialShareModal from "./SocialShareModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecommendationsScreenProps {
  onBack: () => void;
  recommendations: Perfume[];
}

export default function RecommendationsScreen({ 
  onBack,
  recommendations 
}: RecommendationsScreenProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | undefined>();
  const [activeView, setActiveView] = useState<'all' | 'favorites'>('all');
  
  // Ordenar las recomendaciones por porcentaje de match
  const sortedRecommendations = [...recommendations].sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  // Manejar el clic en "Compartir" de una tarjeta específica
  const handleShareClick = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
    setShowShareModal(true);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-5 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <RemixIcon name="arrow-left-line" size="xl" />
          </button>
          <h1 className="font-heading text-xl">Tus Recomendaciones</h1>
        </div>
        <button className="flex items-center justify-center">
          <RemixIcon name="filter-3-line" size="xl" />
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-3 bg-white">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'all' | 'favorites')}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="favorites">Favoritas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Recommendations List */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-light">
        <p className="text-sm text-neutral-medium mb-4">
          Basado en tus preferencias, estas son tus recomendaciones personalizadas de fragancias:
        </p>
        
        {sortedRecommendations.map((perfume) => (
          <div key={perfume.id} className="mb-4">
            <PerfumeCard perfume={perfume} />
            
            {/* Acciones para cada perfume */}
            <div className="flex justify-between mt-2 px-2">
              <button 
                className="flex items-center justify-center text-xs text-neutral-medium"
                onClick={() => {/* Implementar favoritos */}}
              >
                <RemixIcon name="heart-line" className="mr-1" />
                <span>Favorito</span>
              </button>
              
              <button 
                className="flex items-center justify-center text-xs text-neutral-medium"
                onClick={() => handleShareClick(perfume)}
              >
                <RemixIcon name="share-line" className="mr-1" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-neutral-200 p-4">
        <div className="flex justify-between mb-3">
          <button className="flex items-center justify-center text-sm font-medium text-neutral-medium">
            <RemixIcon name="restart-line" className="mr-1" />
            <span>Reiniciar</span>
          </button>
          <button 
            className="flex items-center justify-center text-sm font-medium text-neutral-medium"
            onClick={() => {
              setSelectedPerfume(undefined); // Compartir todas las recomendaciones
              setShowShareModal(true);
            }}
          >
            <RemixIcon name="share-line" className="mr-1" />
            <span>Compartir Resultados</span>
          </button>
        </div>
        <button 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow"
          onClick={() => setShowEmailModal(true)}
        >
          Recibir Muestras en Casa
        </button>
      </div>

      {/* Modals */}
      {showEmailModal && (
        <EmailCaptureModal onClose={() => setShowEmailModal(false)} />
      )}
      
      {showShareModal && (
        <SocialShareModal 
          onClose={() => setShowShareModal(false)} 
          perfumeToShare={selectedPerfume}
        />
      )}
    </div>
  );
}
