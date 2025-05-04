import { useState, useRef, useEffect } from "react";
import { RemixIcon } from "@/components/ui/remixicon";
import { 
  UserPreferences, 
  AgeRange, 
  FragranceType, 
  Occasion 
} from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/speechRecognition";
import { sendMessageToAssistant, textToSpeech, ConversationMessage } from "@/lib/apiService";

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
  const chatAreaRef = useRef<HTMLDivElement>(null);

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

  // Initialize chat with first message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: "assistant",
          text: steps[0].question,
          type: steps[0].type as any
        }
      ]);
      
      // Add the next question after a delay
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            sender: "assistant",
            text: steps[1].question,
            options: steps[1].options,
            type: steps[1].type as any
          }
        ]);
        setCurrentStep(1);
      }, 1000);
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        const simulatedResponse = getSimulatedResponse(currentStep);
        handleUserResponse(simulatedResponse);
        setIsListening(false);
      }, 3000);
    }
  };

  const getSimulatedResponse = (step: number): string => {
    // Simulate user responses based on the current step
    const responses = [
      "",
      "25-34",
      "Woody",
      "Date",
      "Medium",
      "$100-$200"
    ];
    
    return responses[step] || "";
  };

  const handleUserResponse = (response: string) => {
    // Add user message
    setMessages(prev => [
      ...prev,
      { sender: "user", text: response }
    ]);
    
    // Update preferences based on the current step
    updatePreferences(response, steps[currentStep].type);
    
    // Move to next step if not at the end
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            sender: "assistant",
            text: steps[nextStep].question,
            options: steps[nextStep].options,
            type: steps[nextStep].type as any
          }
        ]);
        setCurrentStep(nextStep);
      }, 1000);
    } else {
      // Complete the AI assistant flow
      setTimeout(() => {
        onComplete(preferences);
      }, 2000);
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-5 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <RemixIcon name="arrow-left-line" size="xl" />
          </button>
          <h1 className="font-heading text-xl">ScentBot</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
            <RemixIcon name="question-line" />
          </button>
          <button className="w-8 h-8 overflow-hidden rounded-full bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 bg-neutral-light">
        {messages.map((message, index) => (
          <div key={index} className="mb-4">
            {message.sender === "assistant" ? (
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                  <RemixIcon name="robot-line" className="text-white" />
                </div>
                <div className="ml-3 bg-white p-3 rounded-lg rounded-tl-none max-w-[75%] shadow-sm">
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="mr-3 bg-primary text-white p-3 rounded-lg rounded-tr-none max-w-[75%]">
                  <p className="text-sm">{message.text}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Options for the last assistant message if it has options */}
            {message.sender === "assistant" && 
             message.options && 
             index === messages.length - 1 && (
              <div className="pl-12 mb-4 mt-2">
                <div className={`grid ${message.type === "fragrance" || message.type === "occasion" ? "grid-cols-2" : "grid-cols-2"} gap-2`}>
                  {message.options.map((option, optIndex) => (
                    <button 
                      key={optIndex}
                      className={`bg-white p-2 rounded-md text-sm border border-neutral-200 hover:bg-primary hover:text-white transition ${
                        message.type === "fragrance" || message.type === "occasion" ? "flex flex-col items-center" : ""
                      }`}
                      onClick={() => handleOptionClick(option)}
                    >
                      {(message.type === "fragrance") && (
                        <RemixIcon 
                          name={
                            option === "Fresh" ? "leaf-line" : 
                            option === "Floral" ? "flower-line" : 
                            option === "Woody" ? "home-8-line" : 
                            "sun-line"
                          } 
                          size="lg" 
                          className="mb-1" 
                        />
                      )}
                      {(message.type === "occasion") && (
                        <RemixIcon 
                          name={
                            option === "Everyday" ? "sun-line" : 
                            option === "Work" ? "briefcase-line" : 
                            option === "Date" ? "heart-line" : 
                            "gift-line"
                          } 
                          size="lg" 
                          className="mb-1" 
                        />
                      )}
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Voice Input Indicator */}
        {isListening && (
          <div className="flex mb-4 items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center pulse">
              <RemixIcon name="mic-line" className="text-white" />
            </div>
            <div className="ml-3 bg-white p-3 rounded-lg rounded-tl-none shadow-sm flex items-center">
              <p className="text-sm mr-3">Listening...</p>
              <div className="flex items-end space-x-1 h-5">
                <div className="wave-bar bg-primary w-1 h-1 rounded-full"></div>
                <div className="wave-bar bg-primary w-1 h-1 rounded-full"></div>
                <div className="wave-bar bg-primary w-1 h-1 rounded-full"></div>
                <div className="wave-bar bg-primary w-1 h-1 rounded-full"></div>
                <div className="wave-bar bg-primary w-1 h-1 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-neutral-200 p-3">
        <form onSubmit={handleSubmit} className="flex items-center">
          <button type="button" className="p-2 text-neutral-medium">
            <RemixIcon name="emotion-line" size="xl" />
          </button>
          <div className="flex-1 bg-neutral-light rounded-full px-4 py-2 mx-2 flex items-center">
            <input 
              type="text" 
              placeholder="Type a message or tap microphone" 
              className="bg-transparent w-full focus:outline-none text-sm"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
            />
          </div>
          <button 
            type="button" 
            className="p-2 text-primary"
            onClick={handleVoiceInput}
          >
            <RemixIcon name="mic-line" size="xl" />
          </button>
        </form>
      </div>
    </div>
  );
}
