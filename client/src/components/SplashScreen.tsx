import { useEffect, useState, useRef } from "react";
import { RemixIcon } from "./ui/remixicon";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [animationStage, setAnimationStage] = useState<number>(0);
  const [visible, setVisible] = useState(true);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Secuencia de animación
    const stageTimers = [
      setTimeout(() => setAnimationStage(1), 300),  // Logo aparece
      setTimeout(() => setAnimationStage(2), 800),  // Elementos del logo se animan
      setTimeout(() => setAnimationStage(3), 1400), // Texto aparece
      setTimeout(() => setAnimationStage(4), 2000), // Partículas aparecen
      setTimeout(() => {
        setAnimationStage(5);
        // Pequeña pausa antes de desaparecer
        setTimeout(() => {
          setVisible(false);
          onComplete();
        }, 1000);
      }, 3000)
    ];

    return () => stageTimers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  // Efecto para las partículas
  useEffect(() => {
    if (animationStage >= 4 && particlesRef.current) {
      const container = particlesRef.current;
      
      // Crear partículas dinámicamente
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        
        // Tamaño aleatorio
        const size = Math.random() * 6 + 3;
        
        // Posición inicial aleatoria
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Velocidad y dirección aleatorias
        const speedX = Math.random() * 2 - 1;
        const speedY = Math.random() * 2 - 1;
        const rotation = Math.random() * 360;
        
        // Colores aleatorios dentro de la paleta
        const colors = ['#8A2BE2', '#9370DB', '#BA55D3', '#6A5ACD', '#7B68EE'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Retraso aleatorio
        const delay = Math.random() * 0.5;
        
        // Aplicar estilos
        particle.className = 'absolute rounded-full opacity-0';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.backgroundColor = color;
        particle.style.transform = `rotate(${rotation}deg)`;
        particle.style.animation = `
          floatParticle 10s ease-in-out infinite ${delay}s,
          fadeInOut 8s ease-in-out infinite ${delay}s
        `;
        
        container.appendChild(particle);
      }
      
      return () => {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      };
    }
  }, [animationStage]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Fondo elegante con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 bg-shimmer"></div>
      
      {/* Partículas decorativas */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none"></div>
      
      {/* Círculos decorativos con animación de pulsación */}
      <div className={`absolute w-96 h-96 rounded-full bg-purple-600/10 animate-pulse transition-opacity duration-1000 ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{animationDelay: '0.3s'}}></div>
      <div className={`absolute w-72 h-72 rounded-full bg-indigo-500/20 animate-pulse transition-opacity duration-1000 ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{animationDelay: '0.6s'}}></div>
      <div className={`absolute w-48 h-48 rounded-full bg-purple-500/30 animate-pulse transition-opacity duration-1000 ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{animationDelay: '0.9s'}}></div>
      
      {/* Contenedor principal con difuminado */}
      <div className={`relative z-10 flex flex-col items-center transition-transform duration-1000 ${animationStage >= 1 ? 'scale-100' : 'scale-50'} ${animationStage === 5 ? 'scale-110' : ''}`}>
        {/* Logo con animaciones */}
        <div className={`w-40 h-40 mb-8 rounded-full overflow-hidden border-4 border-white/80 shadow-2xl shadow-purple-500/30 transition-all duration-1000 ${animationStage >= 2 ? 'animate-float' : ''}`}>
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
            {/* Elementos del logo animados */}
            <div className={`absolute w-full h-full flex items-center justify-center transition-opacity duration-500 ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              {/* Elementos del frasco de perfume estilizado */}
              <div className="relative w-16 h-24">
                {/* Cuerpo del frasco */}
                <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-purple-300/80 to-purple-100/40 backdrop-blur-sm rounded-lg border border-white/30"></div>
                
                {/* Cuello del frasco */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-gray-300 to-white/70 rounded-t-sm"></div>
                
                {/* Atomizador */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-2 bg-gradient-to-t from-gray-400 to-gray-200 rounded-full"></div>
                
                {/* Spray animado */}
                {animationStage >= 3 && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                    <div className="relative">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute w-1 h-1 rounded-full bg-white/80"
                          style={{
                            left: `${Math.cos(i/5 * Math.PI) * 15}px`,
                            top: `${Math.sin(i/5 * Math.PI) * 15 - 10}px`,
                            animation: `fadeInOut 2s infinite ${i * 0.2}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Letras superpuestas al logo */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 delay-200 ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-5xl font-bold text-white/90 font-heading">A</span>
            </div>
          </div>
        </div>
        
        {/* Título con animación de aparición */}
        <h1 className={`font-heading text-4xl text-white font-bold tracking-wider mb-3 transition-all duration-500 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            AromaSfera
          </span>
        </h1>
        
        {/* Subtítulo con animación retrasada */}
        <p className={`font-accent text-indigo-200 text-base mb-8 transition-all duration-500 delay-300 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Tu viaje personalizado de fragancias
        </p>
        
        {/* Iconos decorativos */}
        <div className={`flex space-x-6 transition-all duration-500 delay-500 ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30 animate-float" style={{animationDelay: '0.1s'}}>
            <RemixIcon name="flask-line" className="text-indigo-200" />
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center border border-purple-400/30 animate-float" style={{animationDelay: '0.3s'}}>
            <RemixIcon name="leaf-line" className="text-purple-200" />
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-400/30 animate-float" style={{animationDelay: '0.5s'}}>
            <RemixIcon name="emotion-happy-line" className="text-blue-200" />
          </div>
        </div>
      </div>
      
      {/* Indicador de carga en la parte inferior */}
      <div className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-1 w-40 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${animationStage * 20}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
