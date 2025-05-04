import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import BackgroundMusic from "@/components/BackgroundMusic";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import FloatingActionButtons from "@/components/FloatingActionButtons";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [audioReady, setAudioReady] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [appReady, setAppReady] = useState(false);
  
  // Verificar si los archivos existen
  useEffect(() => {
    // Verificar audio
    fetch('/audio/nature.mp3')
      .then(response => {
        if (response.ok) {
          setAudioReady(true);
        } else {
          console.error('Audio file not found');
          setAudioReady(false);
        }
      })
      .catch(error => {
        console.error('Error checking audio file:', error);
        setAudioReady(false);
      });
      
    // Verificar logo
    fetch('/images/aromasfera-logo.png')
      .then(response => {
        if (response.ok) {
          setLogoReady(true);
        } else {
          console.error('Logo file not found');
          setLogoReady(false);
        }
      })
      .catch(error => {
        console.error('Error checking logo file:', error);
        setLogoReady(false);
      });
      
    // Simular tiempo de carga de la aplicación
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`app-container relative min-h-screen ${appReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        {/* Logo superior - solo visible en algunas rutas */}
        {logoReady && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-40">
            <Logo size="md" />
          </div>
        )}
        
        {/* Contenido principal */}
        <Router />
        
        {/* Elementos de UI */}
        <Toaster />
        
        {/* Botones flotantes - acciones rápidas */}
        <FloatingActionButtons />
        
        {/* Reproductor de música */}
        {audioReady && (
          <BackgroundMusic 
            audioUrl="/audio/nature.mp3"
            autoPlay={true}
            loop={true}
            volume={0.3}
          />
        )}
        
        {/* Footer */}
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

export default App;
