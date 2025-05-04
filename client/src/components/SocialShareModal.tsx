import { useState, useEffect } from "react";
import { usePerfumeStore } from "@/store/perfumeStore";
import ShareModal from "./ShareModal";
import { Perfume } from "@/lib/utils";

interface SocialShareModalProps {
  onClose: () => void;
  perfumeToShare?: Perfume;
}

/**
 * Componente modal para compartir en redes sociales
 * Envuelve el nuevo ShareModal con la configuración adecuada
 */
export default function SocialShareModal({ onClose, perfumeToShare }: SocialShareModalProps) {
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | undefined>(perfumeToShare);
  const { recommendations } = usePerfumeStore();
  
  // Si no se proporcionó un perfume específico, usar el de mejor match
  useEffect(() => {
    if (!selectedPerfume && recommendations.length > 0) {
      // Ordenar por matchPercentage y tomar el primero
      const topPerfume = [...recommendations].sort((a, b) => b.matchPercentage - a.matchPercentage)[0];
      setSelectedPerfume(topPerfume);
    }
  }, [recommendations, selectedPerfume]);
  
  return (
    <ShareModal
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      perfume={selectedPerfume}
    />
  );
}
