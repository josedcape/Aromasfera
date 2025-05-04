import { RemixIcon } from "@/components/ui/remixicon";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10 max-w-md mx-auto">
      <div className="flex justify-around items-center py-2">
        <button className="flex flex-col items-center p-2">
          <RemixIcon name="home-5-line" className="text-xl text-primary" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button className="flex flex-col items-center p-2">
          <RemixIcon name="search-line" className="text-xl text-neutral-medium" />
          <span className="text-xs mt-1">Explore</span>
        </button>
        
        <button className="flex flex-col items-center p-2">
          <RemixIcon name="user-line" className="text-xl text-neutral-medium" />
          <span className="text-xs mt-1">Profile</span>
        </button>
        
        <button className="flex flex-col items-center p-2">
          <RemixIcon name="shopping-bag-line" className="text-xl text-neutral-medium" />
          <span className="text-xs mt-1">Cart</span>
        </button>
      </div>
    </div>
  );
}
