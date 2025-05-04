import { useState } from "react";
import { RemixIcon } from "@/components/ui/remixicon";
import PerfumeCard from "./PerfumeCard";
import { Perfume } from "@/lib/utils";
import EmailCaptureModal from "./EmailCaptureModal";
import SocialShareModal from "./SocialShareModal";

interface RecommendationsScreenProps {
  onBack: () => void;
  recommendations: Perfume[];
}

export default function RecommendationsScreen({ 
  onBack,
  recommendations 
}: RecommendationsScreenProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-5 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <RemixIcon name="arrow-left-line" size="xl" />
          </button>
          <h1 className="font-heading text-xl">Your Recommendations</h1>
        </div>
        <button className="flex items-center justify-center">
          <RemixIcon name="filter-3-line" size="xl" />
        </button>
      </header>

      {/* Recommendations List */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-light">
        <p className="text-sm text-neutral-medium mb-4">
          Based on your preferences, here are your personalized fragrance recommendations:
        </p>
        
        {recommendations.map((perfume) => (
          <PerfumeCard key={perfume.id} perfume={perfume} />
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-neutral-200 p-4">
        <div className="flex justify-between mb-3">
          <button className="flex items-center justify-center text-sm font-medium text-neutral-medium">
            <RemixIcon name="restart-line" className="mr-1" />
            <span>Reset</span>
          </button>
          <button 
            className="flex items-center justify-center text-sm font-medium text-neutral-medium"
            onClick={() => setShowShareModal(true)}
          >
            <RemixIcon name="share-line" className="mr-1" />
            <span>Share Results</span>
          </button>
        </div>
        <button 
          className="w-full bg-primary text-white py-3 rounded-lg font-medium"
          onClick={() => setShowEmailModal(true)}
        >
          Get Samples Delivered
        </button>
      </div>

      {/* Modals */}
      {showEmailModal && (
        <EmailCaptureModal onClose={() => setShowEmailModal(false)} />
      )}
      
      {showShareModal && (
        <SocialShareModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
