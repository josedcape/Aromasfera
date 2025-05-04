import { useState } from "react";
import { RemixIcon } from "@/components/ui/remixicon";
import { apiRequest } from "@/lib/queryClient";

interface EmailCaptureModalProps {
  onClose: () => void;
}

export default function EmailCaptureModal({ onClose }: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!consent) {
      setError("You must agree to the terms");
      return;
    }
    
    setError("");
    setSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/email-subscription", { 
        email,
        consented: consent
      });
      onClose();
    } catch (err) {
      setError("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-5/6 max-w-md p-5 relative">
        <button 
          className="absolute top-3 right-3"
          onClick={onClose}
        >
          <RemixIcon name="close-line" size="xl" className="text-neutral-medium" />
        </button>
        
        <h3 className="font-heading text-xl font-semibold mb-4 text-center">Stay Updated</h3>
        <p className="text-neutral-medium text-sm mb-5 text-center">
          Get your recommendations by email and receive exclusive offers!
        </p>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full p-3 border border-neutral-200 rounded-lg focus:border-primary focus:outline-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="flex items-start mb-4">
            <input 
              id="consent" 
              type="checkbox" 
              className="mt-1"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <label htmlFor="consent" className="ml-2 text-xs text-neutral-medium">
              I agree to receive personalized fragrance recommendations and promotional emails from AromaSfera.
            </label>
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-3 rounded-lg font-medium"
            disabled={submitting}
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        
        <div className="text-center">
          <button 
            className="text-sm text-neutral-medium"
            onClick={onClose}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
