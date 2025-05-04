import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RemixIcon } from './ui/remixicon';
import { toast } from '@/hooks/use-toast';
import ShareButtons from './ShareButtons';
import { Perfume } from '@/lib/utils';

// Componente para generar una imagen compartible para Instagram y otras redes
const ShareImage = ({ 
  perfume, 
  onGenerated 
}: { 
  perfume?: Perfume, 
  onGenerated: (imageUrl: string) => void 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = async () => {
    if (!canvasRef.current) return;
    
    try {
      setGenerating(true);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Configurar canvas
      canvas.width = 1080;  // Tamaño óptimo para Instagram
      canvas.height = 1920; // Proporción de Instagram Stories
      
      // Fondo con gradiente
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e1e2e');
      gradient.addColorStop(1, '#2d1b4e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar puntos decorativos
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 4 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        ctx.fill();
      }
      
      // Agregar logo o imagen de perfume
      if (perfume) {
        try {
          // Cargar imagen del perfume si está disponible
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = perfume.imageUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Si la carga falla después de 3 segundos, continuamos sin la imagen
            setTimeout(resolve, 3000);
          });
          
          // Dibujar imagen del perfume en una forma circular
          const imgSize = 300;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 3;
          
          // Círculo de fondo
          ctx.beginPath();
          ctx.arc(centerX, centerY, imgSize/1.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();
          
          // Recortar en círculo
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, imgSize/2, 0, Math.PI * 2);
          ctx.clip();
          
          // Dibujar imagen
          ctx.drawImage(img, centerX - imgSize/2, centerY - imgSize/2, imgSize, imgSize);
          ctx.restore();
          
          // Agregar borde
          ctx.beginPath();
          ctx.arc(centerX, centerY, imgSize/2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        } catch (error) {
          console.warn("Error al cargar imagen del perfume:", error);
          // Continuamos sin la imagen
        }
      } else {
        // Dibuja el logo de AromaSfera si no hay perfume
        const radius = 120;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 3;
        
        // Círculo exterior
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(138, 43, 226, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Círculo interior
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Texto 'A' en el centro
        ctx.font = 'bold 150px "Playfair Display", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText('A', centerX, centerY);
      }
      
      // Título principal
      ctx.font = 'bold 70px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.fillText('AromaSfera', canvas.width / 2, canvas.height / 2 + 50);
      
      // Subtítulo
      ctx.font = '30px "Montserrat", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      if (perfume) {
        ctx.fillText(`${perfume.name} de ${perfume.brand}`, canvas.width / 2, canvas.height / 2 + 120);
        ctx.fillText(`Match: ${perfume.matchPercentage}%`, canvas.width / 2, canvas.height / 2 + 170);
      } else {
        ctx.fillText('Tu asistente personalizado de fragancias', canvas.width / 2, canvas.height / 2 + 120);
      }
      
      // Descripción
      ctx.font = '28px "Montserrat", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      
      const text = perfume 
        ? '¡Encontré mi perfume ideal!'
        : '¡Descubre tu aroma perfecto!';
      
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 250);
      
      // URL o Call to Action
      ctx.font = '32px "Montserrat", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('aromasfera.example.com', canvas.width / 2, canvas.height - 150);
      
      // Generar URL de imagen
      const imageUrl = canvas.toDataURL('image/png');
      onGenerated(imageUrl);
      
    } catch (error) {
      console.error("Error al generar imagen:", error);
      toast({
        title: "Error al generar imagen",
        description: "No se pudo crear la imagen compartible",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    generateImage();
  }, [perfume]);

  return (
    <div className="share-image-generator">
      <div className="flex flex-col items-center space-y-4 mt-2">
        <div className="relative w-full max-w-xs aspect-[9/16] mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-700">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {generating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-10 h-10 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={generateImage}
            disabled={generating}
          >
            <RemixIcon name="refresh-line" />
            <span>Regenerar</span>
          </Button>
          
          <Button
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            onClick={() => {
              if (!canvasRef.current) return;
              
              try {
                const link = document.createElement('a');
                link.download = 'aromasfera-share.png';
                link.href = canvasRef.current.toDataURL('image/png');
                link.click();
                
                toast({
                  title: "Imagen descargada",
                  description: "Ahora puedes compartirla en tus redes sociales",
                });
              } catch (error) {
                console.error("Error al descargar imagen:", error);
                toast({
                  title: "Error al descargar",
                  description: "No se pudo descargar la imagen",
                  variant: "destructive",
                });
              }
            }}
            disabled={generating}
          >
            <RemixIcon name="download-line" />
            <span>Descargar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfume?: Perfume;
}

export default function ShareModal({ open, onOpenChange, perfume }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState('social');
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  
  const handleContinue = () => {
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Compartir con tus amigos
          </DialogTitle>
          <DialogDescription>
            Comparte tus recomendaciones de fragancias o invita a tus amigos a descubrir AromaSfera.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Compartir</TabsTrigger>
            <TabsTrigger value="image">Generar Imagen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="py-4">
            <ShareButtons 
              perfume={perfume}
              variant="grid"
              size="lg"
              showTitle={false}
            />
          </TabsContent>
          
          <TabsContent value="image">
            <ShareImage 
              perfume={perfume}
              onGenerated={setShareImageUrl}
            />
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">
                Perfecto para compartir en Instagram Stories y otras redes sociales.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex gap-4 sm:justify-between">
          <p className="text-xs text-gray-500">
            Al compartir, ayudas a más personas a descubrir fragancias que les encantarán.
          </p>
          <Button onClick={handleContinue}>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}