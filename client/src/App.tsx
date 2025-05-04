import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import BackgroundMusic from "@/components/BackgroundMusic";
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
  
  // Verificar si el archivo de audio existe
  useEffect(() => {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <Router />
        <Toaster />
        {audioReady && (
          <BackgroundMusic 
            audioUrl="/audio/nature.mp3"
            autoPlay={true}
            loop={true}
            volume={0.3}
          />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
