import React from 'react';
import { RemixIcon } from './ui/remixicon';
import { toast } from '@/hooks/use-toast';
import { Perfume } from '@/lib/utils';

interface ShareButtonsProps {
  perfume?: Perfume;
  variant?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export default function ShareButtons({ 
  perfume, 
  variant = 'horizontal', 
  size = 'md', 
  showTitle = true 
}: ShareButtonsProps) {
  // Configuraciones según el tamaño
  const iconSize = size === 'sm' ? 'lg' : size === 'md' ? 'xl' : '2xl';
  const containerClass = variant === 'vertical' 
    ? 'flex flex-col space-y-3' 
    : variant === 'grid'
    ? 'grid grid-cols-3 gap-3'
    : 'flex space-x-3';

  // Obtener la URL actual
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Construir texto para compartir
  const buildShareText = () => {
    if (perfume) {
      return `¡Encontré mi perfume ideal con AromaSfera! ${perfume.name} de ${perfume.brand} - ${perfume.matchPercentage}% match con mi personalidad. ¡Descubre el tuyo!`;
    } else {
      return '¡Descubre tu perfume ideal con AromaSfera, el asistente AI que te recomienda fragancias a tu medida!';
    }
  };

  // URL de imagen para compartir (logo o imagen del perfume)
  const imageUrl = perfume?.imageUrl || 'https://aromasfera.example.com/logo.png'; // URL pública de tu logo
  
  // Función para compartir en Facebook
  const shareOnFacebook = () => {
    try {
      const shareText = encodeURIComponent(buildShareText());
      const shareUrl = encodeURIComponent(currentUrl);
      
      const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
      window.open(fbShareUrl, '_blank', 'width=600,height=400');
      
      toast({
        title: "¡Compartiendo en Facebook!",
        description: "Gracias por compartir AromaSfera",
      });
    } catch (error) {
      console.error("Error al compartir en Facebook:", error);
      toast({
        title: "Error al compartir",
        description: "No se pudo abrir la ventana para compartir",
        variant: "destructive",
      });
    }
  };
  
  // Función para compartir en Twitter/X
  const shareOnTwitter = () => {
    try {
      const shareText = encodeURIComponent(buildShareText());
      const shareUrl = encodeURIComponent(currentUrl);
      
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
      window.open(twitterShareUrl, '_blank', 'width=600,height=400');
      
      toast({
        title: "¡Compartiendo en Twitter!",
        description: "Gracias por compartir AromaSfera",
      });
    } catch (error) {
      console.error("Error al compartir en Twitter:", error);
      toast({
        title: "Error al compartir",
        description: "No se pudo abrir la ventana para compartir",
        variant: "destructive",
      });
    }
  };
  
  // Función para compartir en WhatsApp
  const shareOnWhatsApp = () => {
    try {
      const shareText = encodeURIComponent(`${buildShareText()} ${currentUrl}`);
      
      const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;
      window.open(whatsappShareUrl, '_blank', 'width=600,height=400');
      
      toast({
        title: "¡Compartiendo en WhatsApp!",
        description: "Gracias por compartir AromaSfera",
      });
    } catch (error) {
      console.error("Error al compartir en WhatsApp:", error);
      toast({
        title: "Error al compartir",
        description: "No se pudo abrir la ventana para compartir",
        variant: "destructive",
      });
    }
  };
  
  // Función para compartir a través de correo electrónico
  const shareViaEmail = () => {
    try {
      const subject = encodeURIComponent(perfume 
        ? `¡Descubrí ${perfume.name} en AromaSfera!` 
        : "¡Descubre tu perfume ideal con AromaSfera!");
      const body = encodeURIComponent(`${buildShareText()}\n\n${currentUrl}`);
      
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
      
      toast({
        title: "¡Compartiendo por correo!",
        description: "Se está abriendo tu cliente de correo",
      });
    } catch (error) {
      console.error("Error al compartir por correo:", error);
      toast({
        title: "Error al compartir",
        description: "No se pudo abrir el cliente de correo",
        variant: "destructive",
      });
    }
  };
  
  // Función para copiar enlace
  const copyLink = () => {
    try {
      navigator.clipboard.writeText(`${buildShareText()}\n\n${currentUrl}`);
      
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace ha sido copiado al portapapeles",
      });
    } catch (error) {
      console.error("Error al copiar enlace:", error);
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el enlace al portapapeles",
        variant: "destructive",
      });
    }
  };

  // Función para compartir en Instagram (abre la app o sitio web)
  const shareOnInstagram = () => {
    try {
      // Instagram no ofrece una API directa para compartir como otras redes
      // La mejor alternativa es generar una imagen para Stories y mostrar instrucciones
      toast({
        title: "Compartir en Instagram",
        description: "Guarda la imagen y súbela a tus Stories o feed de Instagram",
      });
      
      // Abrir Instagram si está disponible
      window.open('instagram://app', '_blank');
      
      // Como respaldo, abrir la web de Instagram
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 1000);
    } catch (error) {
      console.error("Error al compartir en Instagram:", error);
      toast({
        title: "Error al abrir Instagram",
        description: "No se pudo abrir la aplicación de Instagram",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="share-buttons">
      {showTitle && (
        <h3 className="text-lg font-medium mb-3 text-gray-800">Compartir</h3>
      )}
      
      <div className={containerClass}>
        {/* Facebook */}
        <button 
          onClick={shareOnFacebook}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
          aria-label="Compartir en Facebook"
        >
          <RemixIcon name="facebook-fill" size={iconSize} />
          {size === 'lg' && <span className="mt-1 text-sm">Facebook</span>}
        </button>
        
        {/* Twitter/X */}
        <button 
          onClick={shareOnTwitter}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
          aria-label="Compartir en Twitter/X"
        >
          <RemixIcon name="twitter-x-fill" size={iconSize} />
          {size === 'lg' && <span className="mt-1 text-sm">Twitter</span>}
        </button>
        
        {/* WhatsApp */}
        <button 
          onClick={shareOnWhatsApp}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
          aria-label="Compartir en WhatsApp"
        >
          <RemixIcon name="whatsapp-fill" size={iconSize} />
          {size === 'lg' && <span className="mt-1 text-sm">WhatsApp</span>}
        </button>
        
        {/* Instagram */}
        <button 
          onClick={shareOnInstagram}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 text-white hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 transition-colors shadow-md hover:shadow-lg"
          aria-label="Compartir en Instagram"
        >
          <RemixIcon name="instagram-fill" size={iconSize} />
          {size === 'lg' && <span className="mt-1 text-sm">Instagram</span>}
        </button>
        
        {/* Email */}
        <button 
          onClick={shareViaEmail}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-600 text-white hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
          aria-label="Compartir por email"
        >
          <RemixIcon name="mail-fill" size={iconSize} />
          {size === 'lg' && <span className="mt-1 text-sm">Email</span>}
        </button>
        
        {/* Copy Link */}
        <button 
          onClick={copyLink}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg"
          aria-label="Copiar enlace"
        >
          <RemixIcon name="link" size={iconSize} />
          {size === 'lg' && <span className="mt-1 text-sm">Copiar</span>}
        </button>
      </div>
    </div>
  );
}