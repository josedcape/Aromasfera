// Definimos la interfaz para la API de Web Speech (ya que TypeScript no la tiene por defecto)
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

declare const window: Window & typeof globalThis;

// Clase para el reconocimiento de voz
export class SpeechRecognizer {
  recognition: any;
  isListening: boolean = false;
  transcript: string = '';
  onResultCallback: ((transcript: string) => void) | null = null;
  onEndCallback: (() => void) | null = null;
  onErrorCallback: ((error: any) => void) | null = null;

  constructor(language: string = 'es-ES') {
    // Comprobamos si el navegador soporta la API de Web Speech
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('El reconocimiento de voz no está soportado en este navegador.');
      return;
    }

    // Inicializamos el reconocimiento de voz
    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    // Configuramos los eventos
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      this.transcript = event.results[last][0].transcript;
      
      if (this.onResultCallback) {
        this.onResultCallback(this.transcript);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Error en el reconocimiento de voz:', event.error);
      this.isListening = false;
      
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };
  }

  // Comenzar a escuchar
  start(): boolean {
    if (!this.recognition) {
      console.error('El reconocimiento de voz no está inicializado.');
      return false;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      this.transcript = '';
      return true;
    } catch (error) {
      console.error('Error al iniciar el reconocimiento de voz:', error);
      return false;
    }
  }

  // Detener la escucha
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Cambiar el idioma
  setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  // Configurar callback para cuando se obtiene un resultado
  onResult(callback: (transcript: string) => void): void {
    this.onResultCallback = callback;
  }

  // Configurar callback para cuando termina el reconocimiento
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  // Configurar callback para cuando hay un error
  onError(callback: (error: any) => void): void {
    this.onErrorCallback = callback;
  }

  // Obtener el texto reconocido
  getTranscript(): string {
    return this.transcript;
  }

  // Verificar si está escuchando
  getIsListening(): boolean {
    return this.isListening;
  }
}

// Hook personalizado para usar el reconocimiento de voz en componentes React
export function useSpeechRecognition(language: string = 'es-ES') {
  const recognizerRef = React.useRef<SpeechRecognizer | null>(null);
  const [transcript, setTranscript] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Inicializar el reconocedor de voz
  React.useEffect(() => {
    // Solo inicializamos en el cliente, no en el servidor
    if (typeof window !== 'undefined') {
      recognizerRef.current = new SpeechRecognizer(language);
      
      recognizerRef.current.onResult((text) => {
        setTranscript(text);
      });
      
      recognizerRef.current.onEnd(() => {
        setIsListening(false);
      });
      
      recognizerRef.current.onError((err) => {
        setError(err);
        setIsListening(false);
      });
    }
    
    return () => {
      if (recognizerRef.current && recognizerRef.current.getIsListening()) {
        recognizerRef.current.stop();
      }
    };
  }, [language]);

  // Función para comenzar a escuchar
  const startListening = React.useCallback(() => {
    setError(null);
    if (recognizerRef.current) {
      const success = recognizerRef.current.start();
      if (success) {
        setIsListening(true);
        setTranscript('');
      }
      return success;
    }
    return false;
  }, []);

  // Función para detener la escucha
  const stopListening = React.useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    setTranscript,
  };
}

// Importamos React
import React from 'react';