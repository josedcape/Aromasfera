import React, { useState } from 'react';
import { RemixIcon } from '@/components/ui/remixicon';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';

export default function FloatingActionButtons() {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMobile();
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleAction = (action: string) => {
    switch (action) {
      case 'home':
        window.location.href = '/';
        break;
      case 'share':
        // Implementar lógica para compartir
        toast({
          title: "Compartir",
          description: "Opción para compartir en desarrollo",
        });
        break;
      case 'help':
        toast({
          title: "Ayuda y soporte",
          description: "¿Necesitas ayuda? Contacta con nosotros en ayuda@botidinamix.com",
        });
        break;
      case 'download':
        toast({
          title: "Descargar aplicación",
          description: "Función para descargar aplicación disponible pronto",
        });
        break;
      default:
        break;
    }
    
    // Cerrar el menú después de seleccionar una opción
    setIsExpanded(false);
  };
  
  // Posicionar en la esquina adecuada según el dispositivo
  const positionClass = isMobile 
    ? "fixed bottom-20 right-4 z-50" 
    : "fixed bottom-28 right-6 z-50";
  
  return (
    <div className={positionClass}>
      <div className="flex flex-col-reverse items-center space-y-reverse space-y-2">
        {/* Menú expandido */}
        {isExpanded && (
          <>
            <Button
              onClick={() => handleAction('home')}
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              <RemixIcon name="home-5-line" size="xl" />
            </Button>
            
            <Button
              onClick={() => handleAction('share')}
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <RemixIcon name="share-line" size="xl" />
            </Button>
            
            <Button
              onClick={() => handleAction('help')}
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
            >
              <RemixIcon name="question-line" size="xl" />
            </Button>
            
            <Button
              onClick={() => handleAction('download')}
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <RemixIcon name="download-cloud-line" size="xl" />
            </Button>
          </>
        )}
        
        {/* Botón principal */}
        <Button
          onClick={toggleExpand}
          variant="default"
          size="icon"
          className={`w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${
            isExpanded 
              ? 'bg-red-600 hover:bg-red-700 rotate-45' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          } text-white`}
        >
          <RemixIcon name={isExpanded ? "close-line" : "apps-line"} size="2xl" />
        </Button>
      </div>
    </div>
  );
}