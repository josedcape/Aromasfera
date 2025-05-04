import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(onComplete, 500); // Delay the onComplete callback for transition effect
    }, 3500); // Duration of splash screen
    
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#36219c] overflow-hidden">
      {/* Partículas flotantes decorativas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-50"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor: [
                'hsla(320, 100%, 65%, 0.3)', 
                'hsla(170, 90%, 60%, 0.3)', 
                'hsla(30, 100%, 60%, 0.3)', 
                'hsla(260, 85%, 65%, 0.3)'
              ][Math.floor(Math.random() * 4)],
              animation: `floatParticle ${Math.random() * 10 + 15}s linear infinite, fadeInOut ${Math.random() * 5 + 5}s ease-in-out infinite`
            }}
          />
        ))}
      </div>
      
      {/* Overlay de resplandor */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#36219c] opacity-80"></div>
      
      {/* Contenedor principal */}
      <div className={`relative z-10 flex flex-col items-center transition-opacity duration-500 ${animationComplete ? 'opacity-0' : 'opacity-100'}`}>
        {/* Logo principal */}
        <div className="w-64 h-64 mb-8 relative animate-zoom-bounce">
          <div className="absolute inset-0 rounded-full bg-[#36219c] opacity-70 blur-lg"></div>
          <img 
            src="/images/aromasfera-logo.png" 
            alt="AromaSfera Logo" 
            className="w-full h-full object-contain relative z-10"
          />
          <div className="absolute inset-0 shine-effect"></div>
        </div>
        
        {/* Texto del logo */}
        <div className="mt-4 relative">
          <h1 className="font-heading text-5xl font-bold text-white tracking-wide animate-slide-up" style={{ animationDelay: '0.5s' }}>
            AromaSfera
          </h1>
          <p className="text-center mt-2 text-[#f0f0f0] opacity-90 font-accent animate-slide-up" style={{ animationDelay: '0.8s' }}>
            Tu guía personal de fragancias
          </p>
        </div>
        
        {/* Loader circular */}
        <div className="mt-12 relative animate-slide-up" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 rounded-full border-4 border-[#FF66C4] border-t-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
}