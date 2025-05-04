import { RemixIcon } from "@/components/ui/remixicon";
import { GenderType } from "@/lib/utils";
import ReactPlayer from "react-player/lazy";
import { useState, useEffect, useRef } from "react";

interface IntroScreenProps {
  onGenderSelect: (gender: GenderType) => void;
  onSkip: () => void;
}

export default function IntroScreen({ onGenderSelect, onSkip }: IntroScreenProps) {
  const [playing, setPlaying] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const videoRef = useRef<HTMLDivElement>(null);

  // Secuencia de animaciones al cargar
  useEffect(() => {
    // Muestra los elementos secuencialmente
    const timer1 = setTimeout(() => setActiveSection(1), 300);
    const timer2 = setTimeout(() => setActiveSection(2), 800);
    const timer3 = setTimeout(() => setActiveSection(3), 1300);
    const timer4 = setTimeout(() => setAnimationComplete(true), 1800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Efecto para el ripple al hacer clic en el botón de género
  const handleGenderSelect = (gender: GenderType) => {
    const ripple = document.createElement('div');
    ripple.className = 'absolute inset-0 bg-white opacity-20 ripple rounded-xl pointer-events-none';
    
    // Añadir efecto visual antes de la transición a la siguiente pantalla
    if (gender === "men") {
      const btn = document.getElementById('men-btn');
      if (btn) {
        btn.appendChild(ripple);
        setTimeout(() => {
          onGenderSelect(gender);
        }, 300);
      } else {
        onGenderSelect(gender);
      }
    } else {
      const btn = document.getElementById('women-btn');
      if (btn) {
        btn.appendChild(ripple);
        setTimeout(() => {
          onGenderSelect(gender);
        }, 300);
      } else {
        onGenderSelect(gender);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Banner superior con video y degradado */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/50 to-black/80 z-10"></div>
        
        {/* Adornos flotantes */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {/* Círculos decorativos */}
          <div className={`absolute top-[20%] left-[10%] w-32 h-32 rounded-full border border-indigo-300/30 animate-float opacity-0 ${activeSection >= 1 ? 'opacity-60' : ''}`} style={{transitionDelay: '0.3s', transitionDuration: '0.8s'}}></div>
          <div className={`absolute top-[60%] right-[10%] w-24 h-24 rounded-full border border-purple-300/30 animate-float opacity-0 ${activeSection >= 1 ? 'opacity-60' : ''}`} style={{transitionDelay: '0.5s', transitionDuration: '0.8s', animationDelay: '0.2s'}}></div>
          
          {/* Puntos brillantes */}
          {Array.from({length: 20}).map((_, i) => (
            <div 
              key={i}
              className={`absolute w-1 h-1 rounded-full bg-white opacity-0 ${activeSection >= 2 ? 'opacity-60' : ''}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transitionDelay: `${0.5 + Math.random() * 0.8}s`,
                transitionDuration: '1s',
                animation: `pulse 3s infinite ${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Área del video */}
        <div ref={videoRef} className="absolute inset-0 flex items-center justify-center">
          <ReactPlayer
            url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Replace with actual intro video URL
            width="100%"
            height="100%"
            playing={playing}
            controls={false}
            muted={true}
            config={{
              youtube: {
                playerVars: { 
                  showinfo: 0, 
                  controls: 0, 
                  modestbranding: 1,
                  rel: 0,
                  iv_load_policy: 3 
                }
              }
            }}
            className="object-cover"
          />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <button 
                className="group w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all hover:scale-105 shadow-xl animate-pulse"
                onClick={() => setPlaying(true)}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
                  <RemixIcon name="play-fill" className="text-white text-3xl ml-1 group-hover:scale-110 transition-transform" />
                </div>
              </button>
            </div>
          )}
        </div>
        
        {/* Contenido superpuesto */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h1 className={`font-heading text-4xl font-bold mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent transition-all duration-700 ${activeSection >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            Descubre Tu Aroma Perfecto
          </h1>
          <p className={`font-body text-white/90 max-w-lg transition-all duration-700 delay-100 ${activeSection >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            Nuestra inteligencia artificial te guiará hacia la fragancia perfecta que resuene con tu personalidad y estilo único. Una experiencia sensorial revolucionaria.
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-8 max-w-3xl mx-auto">
        {/* Titular elegante */}
        <div className={`mb-10 text-center transition-all duration-700 delay-200 ${activeSection >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="inline-block">
            <h2 className="font-heading text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Elige Tu Experiencia
            </h2>
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2 animate-pulse"></div>
          </div>
          <p className="text-gray-600 mt-3 max-w-md mx-auto">
            Personaliza tu búsqueda de fragancias según tus preferencias y descubre aromas que capturan tu esencia.
          </p>
        </div>
        
        {/* Opciones de género con diseño elegante */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 transition-all duration-700 delay-300 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          {/* Opción masculina */}
          <button 
            id="men-btn"
            className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg group transition hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-200 h-56 bg-white"
            onClick={() => handleGenderSelect("men")}
          >
            {/* Gradiente de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            
            {/* Efecto de brillo */}
            <div className="shine-effect opacity-0 group-hover:opacity-100 z-10"></div>
            
            <div className="absolute inset-0 flex flex-col justify-between p-6 z-20">
              {/* Icono estilizado */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center">
                  <RemixIcon name="user-line" className="text-white text-5xl" />
                </div>
              </div>
              
              {/* Texto y detalles */}
              <div className="text-center bg-white/80 backdrop-blur-sm py-3 px-5 rounded-xl border border-indigo-100/50 shadow-sm">
                <h3 className="font-heading font-medium text-xl text-indigo-900">Fragancias Masculinas</h3>
                <p className="text-sm text-indigo-700/80 mt-1">Aromas intensos y distintivos</p>
              </div>
            </div>
          </button>
          
          {/* Opción femenina */}
          <button 
            id="women-btn"
            className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-lg group transition hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-200 h-56 bg-white"
            onClick={() => handleGenderSelect("women")}
          >
            {/* Gradiente de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            
            {/* Efecto de brillo */}
            <div className="shine-effect opacity-0 group-hover:opacity-100 z-10"></div>
            
            <div className="absolute inset-0 flex flex-col justify-between p-6 z-20">
              {/* Icono estilizado */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl shadow-purple-500/30 flex items-center justify-center">
                  <RemixIcon name="women-line" className="text-white text-5xl" />
                </div>
              </div>
              
              {/* Texto y detalles */}
              <div className="text-center bg-white/80 backdrop-blur-sm py-3 px-5 rounded-xl border border-purple-100/50 shadow-sm">
                <h3 className="font-heading font-medium text-xl text-purple-900">Fragancias Femeninas</h3>
                <p className="text-sm text-purple-700/80 mt-1">Aromas sofisticados y elegantes</p>
              </div>
            </div>
          </button>
        </div>

        {/* Texto informativo y botón de saltar */}
        <div className={`text-center transition-all duration-700 delay-400 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Nuestro asistente de IA te ayudará a encontrar el aroma perfecto que se adapte a tus preferencias únicas y estilo personal.
          </p>

          <button 
            className="flex items-center mx-auto py-2 px-6 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all group"
            onClick={onSkip}
          >
            <span>Saltar Introducción</span>
            <div className="ml-2 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
              <RemixIcon name="arrow-right-line" className="text-white text-sm" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
