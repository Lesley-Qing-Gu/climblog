import { useState } from "react";
import { Camera, RotateCcw, Image, Zap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CameraPage() {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    // Simulate camera capture
    setTimeout(() => {
      setIsCapturing(false);
      // Here would be the hold detection logic
      console.log("Photo captured! Detecting holds...");
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="text-center space-y-2 px-4 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Route Capture 📸</h1>
        <p className="text-muted-foreground">Capture routes & detect holds automatically!</p>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 px-4">
        <div className="relative w-full h-full max-h-96 bg-gradient-to-br from-wall-medium/30 to-wall-dark/40 rounded-xl overflow-hidden shadow-card border border-border">
          {/* Camera Preview Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isCapturing ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-primary font-medium">Analyzing holds... ✨</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Point camera at climbing wall</p>
              </div>
            )}
          </div>

          {/* Viewfinder Grid */}
          <div className="absolute inset-0">
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>

          {/* Corner Guides */}
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/60 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/60 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/60 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/60 rounded-br-lg" />
        </div>
      </div>

      {/* Camera Controls */}
      <div className="px-4 py-8 space-y-6">
        {/* Main Capture Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCapture}
            disabled={isCapturing}
            className="w-20 h-20 rounded-xl bg-primary hover:bg-primary/90 shadow-float hover:shadow-card hover:scale-105 transition-all duration-300"
          >
            {isCapturing ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex justify-center gap-6">
          <Button variant="outline" size="lg" className="rounded-xl w-14 h-14 border-border hover:bg-wall-medium/30">
            <Image className="w-5 h-5" />
          </Button>
          
          <Button variant="outline" size="lg" className="rounded-xl w-14 h-14 border-border hover:bg-wall-medium/30">
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <Button variant="outline" size="lg" className="rounded-xl w-14 h-14 border-border hover:bg-wall-medium/30">
            <Zap className="w-5 h-5" />
          </Button>
        </div>

        {/* Upload Option */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground px-2">or</span>
            <div className="h-px bg-border flex-1" />
          </div>
          
          <Button
            variant="outline"
            className="w-full py-4 rounded-xl border-dashed border-2 hover:bg-primary/5"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Photo from Gallery
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-wall-medium/30 rounded-xl p-4 space-y-2 border border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-info">💡</span>
            Photography Tips
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Keep the wall centered in frame</li>
            <li>• Ensure good lighting on holds</li>
            <li>• Stand 6-8 feet away for best results</li>
            <li>• Hold steady while capturing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}