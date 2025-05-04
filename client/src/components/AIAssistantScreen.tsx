import { useState, useRef, useEffect } from "react";
import { RemixIcon } from "@/components/ui/remixicon";
import { 
  UserPreferences, 
  AgeRange, 
  FragranceType, 
  Occasion 
} from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/speechRecognition";
import { 
  sendMessageToAssistant, 
  textToSpeech, 
  analyzeUserPreferences, 
  ConversationMessage 
} from "@/lib/apiService";

type Message = {
  sender: "user" | "assistant";
  text: string;
  options?: string[];
  type?: "ageRange" | "fragrance" | "occasion" | "intensity" | "budget";
};

interface AIAssistantScreenProps {
  onBack: () => void;
  onComplete: (preferences: UserPreferences) => void;
  initialPreferences: UserPreferences;
}

export default function AIAssistantScreen({ 
  onBack, 
  onComplete,
  initialPreferences
}: AIAssistantScreenProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  
  // Inicializar el reconocimiento de voz
  const { 
    transcript, 
    isListening: isSpeechListening, 
    startListening, 
    stopListening,
    setTranscript 
  } = useSpeechRecognition("es-ES");

  const steps = [
    {
      question: "Hello! I'm ScentBot, your personal fragrance assistant. I'll help you find your perfect scent. Ready to begin?",
      type: null
    },
    {
      question: "First, could you tell me your age range? This helps me recommend appropriate fragrances.",
      type: "ageRange",
      options: ["18-24", "25-34", "35-44", "45+"]
    },
    {
      question: "Great! What type of fragrances do you typically enjoy?",
      type: "fragrance",
      options: ["Fresh", "Floral", "Woody", "Oriental"]
    },
    {
      question: "For what occasions are you looking to wear this fragrance?",
      type: "occasion",
      options: ["Everyday", "Work", "Date", "Special Event"]
    },
    {
      question: "What intensity of fragrance do you prefer?",
      type: "intensity",
      options: ["Light", "Medium", "Strong", "Very Strong"]
    },
    {
      question: "What's your budget range for a perfume?",
      type: "budget",
      options: ["Under $50", "$50-$100", "$100-$200", "Over $200"]
    },
    {
      question: "Thank you for sharing your preferences! I'm now analyzing the perfect fragrances for you...",
      type: null
    }
  ];

  // Inicializar audio element
  useEffect(() => {
    const audio = new Audio();
    setAudioElement(audio);
    
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);
  
  // Inicializar chat con el primer mensaje
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage: Message = {
        sender: "assistant",
        text: steps[0].question,
        type: steps[0].type as any
      };
      
      setMessages([initialMessage]);
      setConversation([{ role: 'assistant', content: steps[0].question }]);
      
      // Convertir texto a voz
      playAssistantResponse(steps[0].question);
      
      // Agregar la siguiente pregunta después de un retraso
      setTimeout(async () => {
        try {
          // En lugar de usar steps predefinidos, intentamos obtener la pregunta del asistente
          const nextQuestion = await getNextQuestion();
          
          if (nextQuestion) {
            setMessages(prev => [
              ...prev,
              {
                sender: "assistant",
                text: nextQuestion.text,
                options: nextQuestion.suggestedResponses,
                type: steps[1].type as any
              }
            ]);
            
            setConversation(prev => [...prev, { role: 'assistant', content: nextQuestion.text }]);
            playAssistantResponse(nextQuestion.text);
          } else {
            // Si no se pudo obtener una respuesta del asistente, usar los steps predefinidos
            setMessages(prev => [
              ...prev,
              {
                sender: "assistant",
                text: steps[1].question,
                options: steps[1].options,
                type: steps[1].type as any
              }
            ]);
            
            setConversation(prev => [...prev, { role: 'assistant', content: steps[1].question }]);
            playAssistantResponse(steps[1].question);
          }
          
          setCurrentStep(1);
        } catch (error) {
          console.error("Error al obtener la siguiente pregunta:", error);
          
          // Si hay un error, usar los steps predefinidos
          setMessages(prev => [
            ...prev,
            {
              sender: "assistant",
              text: steps[1].question,
              options: steps[1].options,
              type: steps[1].type as any
            }
          ]);
          
          setConversation(prev => [...prev, { role: 'assistant', content: steps[1].question }]);
          setCurrentStep(1);
        }
      }, 2000);
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Función para reproducir la respuesta del asistente (text-to-speech)
  const playAssistantResponse = async (text: string) => {
    try {
      if (!audioElement) return;
      
      const result = await textToSpeech(text);
      
      if (result && result.audioUrl) {
        audioElement.src = result.audioUrl;
        audioElement.play().catch(err => {
          console.error("Error al reproducir audio:", err);
        });
      }
    } catch (error) {
      console.error("Error al convertir texto a voz:", error);
    }
  };
  
  // Función para obtener la siguiente pregunta del asistente
  const getNextQuestion = async () => {
    try {
      setIsProcessing(true);
      const response = await sendMessageToAssistant(conversation, currentStep);
      setIsProcessing(false);
      return response;
    } catch (error) {
      console.error("Error al obtener la respuesta del asistente:", error);
      setIsProcessing(false);
      return null;
    }
  };
  
  // Efecto para monitorear los cambios en el reconocimiento de voz
  useEffect(() => {
    if (transcript.trim()) {
      setCurrentInput(transcript);
    }
  }, [transcript]);

  // Efecto para monitorear cuando cambia el estado de escucha
  useEffect(() => {
    setIsListening(isSpeechListening);
    
    // Cuando termina de escuchar, enviar la respuesta si hay texto
    if (!isSpeechListening && currentInput.trim()) {
      handleUserResponse(currentInput);
      setCurrentInput("");
      setTranscript("");
    }
  }, [isSpeechListening]);
  
  // Activar/desactivar reconocimiento de voz
  const handleVoiceInput = () => {
    if (isListening) {
      // Detener el reconocimiento de voz
      stopListening();
    } else {
      // Iniciar el reconocimiento de voz
      startListening();
    }
  };

  const handleUserResponse = async (response: string) => {
    if (isProcessing) return;
    
    // Añadir mensaje del usuario
    setMessages(prev => [
      ...prev,
      { sender: "user", text: response }
    ]);
    
    // Actualizar la conversación
    setConversation(prev => [...prev, { role: 'user', content: response }]);
    
    // Actualizar preferencias según el tipo de paso actual
    updatePreferences(response, steps[currentStep].type);
    
    // Avanzar al siguiente paso si no estamos al final
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Mostrar indicador de procesamiento
      setIsProcessing(true);
      
      try {
        // Intentar obtener la siguiente pregunta del asistente
        const nextQuestion = await getNextQuestion();
        
        // Si tenemos una respuesta del API
        if (nextQuestion) {
          setMessages(prev => [
            ...prev,
            {
              sender: "assistant",
              text: nextQuestion.text,
              options: nextQuestion.suggestedResponses,
              type: steps[nextStep].type as any
            }
          ]);
          
          setConversation(prev => [...prev, { role: 'assistant', content: nextQuestion.text }]);
          
          // Reproducir audio de la respuesta
          playAssistantResponse(nextQuestion.text);
        } else {
          // Si no hay respuesta, usar los steps predefinidos
          setMessages(prev => [
            ...prev,
            {
              sender: "assistant",
              text: steps[nextStep].question,
              options: steps[nextStep].options,
              type: steps[nextStep].type as any
            }
          ]);
          
          setConversation(prev => [...prev, { role: 'assistant', content: steps[nextStep].question }]);
          playAssistantResponse(steps[nextStep].question);
        }
      } catch (error) {
        console.error("Error al obtener la respuesta del asistente:", error);
        
        // En caso de error, usar los steps predefinidos
        setMessages(prev => [
          ...prev,
          {
            sender: "assistant",
            text: steps[nextStep].question,
            options: steps[nextStep].options,
            type: steps[nextStep].type as any
          }
        ]);
        
        setConversation(prev => [...prev, { role: 'assistant', content: steps[nextStep].question }]);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Al finalizar, obtener preferencias analizadas
      try {
        // Extraer solo los mensajes del usuario para el análisis
        const userMessages = conversation
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content);
          
        const analyzedPreferences = await analyzeUserPreferences(userMessages);
        
        // Combinar preferencias detectadas con las que el usuario ya seleccionó
        const finalPreferences = {
          ...preferences,
          ...analyzedPreferences
        };
        
        setTimeout(() => {
          onComplete(finalPreferences);
        }, 2000);
      } catch (error) {
        console.error("Error al analizar preferencias:", error);
        setTimeout(() => {
          onComplete(preferences);
        }, 2000);
      }
    }
  };

  const updatePreferences = (response: string, type: string | null) => {
    if (!type) return;
    
    switch (type) {
      case "ageRange":
        setPreferences(prev => ({ ...prev, ageRange: response as AgeRange }));
        break;
      case "fragrance":
        setPreferences(prev => ({ 
          ...prev, 
          fragranceTypes: [...(prev.fragranceTypes || []), response.toLowerCase() as FragranceType] 
        }));
        break;
      case "occasion":
        setPreferences(prev => ({ 
          ...prev, 
          occasions: [...(prev.occasions || []), response.toLowerCase() as Occasion] 
        }));
        break;
      case "intensity":
        const intensityMap: Record<string, number> = {
          "Light": 1,
          "Medium": 2,
          "Strong": 3,
          "Very Strong": 4
        };
        setPreferences(prev => ({ 
          ...prev, 
          intensity: intensityMap[response] || 2
        }));
        break;
      case "budget":
        setPreferences(prev => ({ ...prev, budget: response }));
        break;
    }
  };

  const handleOptionClick = (option: string) => {
    handleUserResponse(option);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      handleUserResponse(currentInput);
      setCurrentInput("");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-shimmer opacity-30 pointer-events-none"></div>
      
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-gray-700/50 py-4 px-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 hover:bg-white/10 p-2 rounded-full transition-all hover:scale-105"
          >
            <RemixIcon name="arrow-left-line" size="xl" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-heading text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AromaSfera AI
            </h1>
            <span className="text-xs text-gray-400">Tu asistente de fragancias personal</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors border border-gray-600 hover:border-blue-500/50 hover:scale-105">
            <RemixIcon name="question-line" />
          </button>
          <div className="w-9 h-9 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center border border-purple-400/30 shadow-lg shadow-purple-500/20 animate-float">
            <RemixIcon name="user-line" size="lg" />
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 bg-transparent">
        {messages.map((message, index) => (
          <div key={index} className="mb-5">
            {message.sender === "assistant" ? (
              <div className="flex items-start animate-fadeIn">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
                  <RemixIcon name="robot-line" className="text-white" />
                </div>
                <div className="ml-3 bg-black/30 backdrop-blur-md p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-xl border border-gray-700/50 group hover:border-blue-500/50 transition-all">
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">AromaSfera AI • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-end items-start animate-fadeInRight">
                <div className="mr-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-md p-4 rounded-2xl rounded-tr-none max-w-[75%] border border-purple-500/30 shadow-lg group hover:border-purple-400/50 transition-all">
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <span className="text-xs text-gray-500 text-right block opacity-0 group-hover:opacity-100 transition-opacity">Tú • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 overflow-hidden shadow-lg shadow-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                  <RemixIcon name="user-line" size="lg" className="text-white" />
                </div>
              </div>
            )}

            {/* Options for the last assistant message if it has options */}
            {message.sender === "assistant" && 
             message.options && 
             index === messages.length - 1 && (
              <div className="ml-14 mb-4 mt-3 animate-fadeIn">
                <div className={`grid ${message.type === "fragrance" || message.type === "occasion" ? "grid-cols-2" : "grid-cols-2"} gap-3`}>
                  {message.options.map((option, optIndex) => {
                    // Determinar gradientes de color según el tipo
                    let gradientFrom, gradientTo, iconColor;
                    
                    if (message.type === "fragrance") {
                      if (option === "Fresh") {
                        gradientFrom = "from-green-500"; gradientTo = "to-teal-400"; iconColor = "text-green-300";
                      } else if (option === "Floral") {
                        gradientFrom = "from-pink-500"; gradientTo = "to-purple-400"; iconColor = "text-pink-300";
                      } else if (option === "Woody") {
                        gradientFrom = "from-amber-500"; gradientTo = "to-yellow-400"; iconColor = "text-amber-300";
                      } else {
                        gradientFrom = "from-red-500"; gradientTo = "to-orange-400"; iconColor = "text-red-300";
                      }
                    } else if (message.type === "occasion") {
                      if (option === "Everyday") {
                        gradientFrom = "from-blue-500"; gradientTo = "to-cyan-400"; iconColor = "text-blue-300";
                      } else if (option === "Work") {
                        gradientFrom = "from-indigo-500"; gradientTo = "to-blue-400"; iconColor = "text-indigo-300";
                      } else if (option === "Date") {
                        gradientFrom = "from-pink-500"; gradientTo = "to-red-400"; iconColor = "text-pink-300";
                      } else {
                        gradientFrom = "from-purple-500"; gradientTo = "to-violet-400"; iconColor = "text-purple-300";
                      }
                    } else {
                      // Opciones genéricas
                      const colors = [
                        { from: "from-blue-500", to: "to-cyan-400", icon: "text-blue-300" },
                        { from: "from-purple-500", to: "to-violet-400", icon: "text-purple-300" },
                        { from: "from-pink-500", to: "to-rose-400", icon: "text-pink-300" },
                        { from: "from-indigo-500", to: "to-blue-400", icon: "text-indigo-300" }
                      ];
                      const colorSet = colors[optIndex % colors.length];
                      gradientFrom = colorSet.from;
                      gradientTo = colorSet.to;
                      iconColor = colorSet.icon;
                    }

                    return (
                      <button 
                        key={optIndex}
                        className={`bg-black/30 backdrop-blur-md p-3 rounded-xl text-sm border border-gray-700 hover:border-blue-500/50 transition-all 
                        hover:shadow-lg hover:shadow-${gradientFrom.replace("from-", "")}/20 hover:scale-105 
                        ${message.type === "fragrance" || message.type === "occasion" ? "flex flex-col items-center" : ""}`}
                        onClick={() => handleOptionClick(option)}
                      >
                        {(message.type === "fragrance" || message.type === "occasion") && (
                          <div className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-md shadow-${gradientFrom.replace("from-", "")}/20`}>
                            <RemixIcon 
                              name={
                                // Fragance icons
                                message.type === "fragrance" && option === "Fresh" ? "leaf-line" : 
                                message.type === "fragrance" && option === "Floral" ? "flower-line" : 
                                message.type === "fragrance" && option === "Woody" ? "home-8-line" : 
                                message.type === "fragrance" && option === "Oriental" ? "sun-line" :
                                // Occasion icons
                                message.type === "occasion" && option === "Everyday" ? "sun-line" : 
                                message.type === "occasion" && option === "Work" ? "briefcase-line" : 
                                message.type === "occasion" && option === "Date" ? "heart-line" : 
                                message.type === "occasion" && option === "Special Event" ? "gift-line" :
                                // Default
                                "check-line"
                              } 
                              size="lg" 
                              className="text-white" 
                            />
                          </div>
                        )}
                        <span className={`text-white font-medium bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Voice Input Indicator */}
        {isListening && (
          <div className="flex mb-4 items-center animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-pink-500/30 border border-pink-400/30">
              <RemixIcon name="mic-line" className="text-white text-lg animate-pulse" />
            </div>
            <div className="ml-3 bg-black/40 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-pink-500/30 flex items-center shadow-lg">
              <p className="text-sm mr-4 text-white font-medium">Escuchando<span className="dot-typing"></span></p>
              <div className="flex items-end space-x-1 h-6">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div 
                    key={i} 
                    className="audio-wave bg-gradient-to-t from-pink-500 to-purple-500 w-1.5 rounded-full"
                    style={{ 
                      height: `${Math.max(4, Math.floor(Math.random() * 24))}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-gray-900/70 backdrop-blur-md border-t border-gray-700/50 p-4 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center relative">
            <button 
              type="button" 
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-full hover:bg-gray-800/50"
            >
              <RemixIcon name="emotion-line" size="xl" />
            </button>
            
            {/* Input field with glowing effect */}
            <div className="flex-1 bg-black/30 rounded-2xl border border-gray-700 px-4 py-3 mx-2 flex items-center focus-within:border-blue-500/50 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"></div>
              
              {/* Glowing border effect when focused */}
              <div className="absolute inset-0 rounded-2xl border border-blue-500/70 opacity-0 group-focus-within:opacity-100 transition-opacity border-glow"></div>
              
              <RemixIcon name="message-3-line" className="text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Escribe tu mensaje o usa el micrófono..." 
                className="bg-transparent w-full focus:outline-none text-sm text-white z-10"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
              />
            </div>
            
            {/* Send button with animations */}
            {currentInput.trim() ? (
              <button 
                type="submit" 
                className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30 hover:shadow-blue-500/50 hover:scale-105 transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 sheen-effect opacity-0 group-hover:opacity-100"></div>
                <RemixIcon name="send-plane-fill" size="lg" className="z-10 relative" />
              </button>
            ) : (
              <button 
                type="button" 
                className={`p-3 rounded-full relative overflow-hidden ${isListening 
                  ? 'bg-gradient-to-br from-pink-500 to-red-500 shadow-lg shadow-pink-500/30 border border-pink-400/30 text-white animate-pulse' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 border border-blue-400/30 text-white hover:shadow-blue-500/50 hover:scale-105 group'
                } transition-all`}
                onClick={handleVoiceInput}
              >
                {!isListening && <div className="absolute inset-0 sheen-effect opacity-0 group-hover:opacity-100"></div>}
                <RemixIcon name="mic-line" size="lg" className="z-10 relative" />
              </button>
            )}
          </form>
          
          {/* Small hint text */}
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">
              Habla o escribe con AromaSfera para descubrir tu perfume ideal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
