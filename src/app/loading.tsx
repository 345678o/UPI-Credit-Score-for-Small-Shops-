import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <LoadingAnimation />
    </div>
  );
}
