import { useState } from "react";
import { RemixIcon } from "@/components/ui/remixicon";

interface SocialShareModalProps {
  onClose: () => void;
}

export default function SocialShareModal({ onClose }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.origin + "/shared/r3k9m2";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleSocialShare = (platform: string) => {
    let shareLink = "";
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out my personalized fragrance recommendations from AromaSfera!")}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent("Check out my personalized fragrance recommendations from AromaSfera! " + shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-5/6 max-w-md p-5">
        <h3 className="font-heading text-xl font-semibold mb-4 text-center">Share Your Scent Journey</h3>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button 
            className="flex flex-col items-center"
            onClick={() => handleSocialShare("facebook")}
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-1">
              <RemixIcon name="facebook-fill" className="text-white text-xl" />
            </div>
            <span className="text-xs">Facebook</span>
          </button>
          
          <button className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center mb-1">
              <RemixIcon name="instagram-fill" className="text-white text-xl" />
            </div>
            <span className="text-xs">Instagram</span>
          </button>
          
          <button 
            className="flex flex-col items-center"
            onClick={() => handleSocialShare("twitter")}
          >
            <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center mb-1">
              <RemixIcon name="twitter-x-fill" className="text-white text-xl" />
            </div>
            <span className="text-xs">Twitter</span>
          </button>
          
          <button 
            className="flex flex-col items-center"
            onClick={() => handleSocialShare("whatsapp")}
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-1">
              <RemixIcon name="whatsapp-fill" className="text-white text-xl" />
            </div>
            <span className="text-xs">WhatsApp</span>
          </button>
        </div>
        
        <div className="p-3 bg-neutral-light rounded-lg flex items-center mb-4">
          <input 
            type="text" 
            value={shareUrl} 
            className="bg-transparent flex-1 text-sm focus:outline-none" 
            readOnly
          />
          <button 
            className="ml-2 px-3 py-1.5 bg-primary text-white rounded text-xs"
            onClick={copyToClipboard}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        
        <button 
          className="w-full py-3 border border-neutral-200 rounded-lg font-medium"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
