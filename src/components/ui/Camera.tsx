
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Image, Check, Trash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { triggerHapticFeedback } from '@/lib/animations';

interface CameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function CameraComponent({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Request camera permission and start stream
  useEffect(() => {
    async function setupCamera() {
      try {
        setIsLoading(true);
        const constraints = {
          video: {
            facingMode: isFrontCamera ? 'user' : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        
        // Stop any existing stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Get new stream
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setStream(mediaStream);
        setHasPermission(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasPermission(false);
        setIsLoading(false);
        toast({
          title: "Camera Access Denied",
          description: "Please allow camera access in your browser settings.",
          variant: "destructive"
        });
      }
    }
    
    setupCamera();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isFrontCamera, stream]);

  // Handle taking picture
  const takePicture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      triggerHapticFeedback('success');
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
      }
    }
  };

  // Switch between front and back camera
  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    triggerHapticFeedback('info');
  };

  // Accept captured image
  const acceptImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      triggerHapticFeedback('success');
    }
  };

  // Retake picture
  const retakePicture = () => {
    setCapturedImage(null);
    triggerHapticFeedback('warning');
  };

  // Handle permission denied
  if (hasPermission === false) {
    return (
      <motion.div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="bg-card border border-border rounded-lg shadow-xl p-6 max-w-md w-full text-center">
          <Camera className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Camera Access Required</h2>
          <p className="text-muted-foreground mb-4">
            Please allow camera access in your browser settings to use this feature.
          </p>
          <Button onClick={onClose}>Close Camera</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-white">Starting camera...</span>
          </div>
        </div>
      )}
      
      {/* Camera view */}
      <div className="relative flex-1 overflow-hidden">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute h-full w-full object-cover"
            />
            
            {/* Camera frame guide */}
            <div className="absolute inset-0 border-[40px] sm:border-[80px] border-black/70 rounded-lg pointer-events-none">
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg"></div>
              
              {/* Corner guides */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white/70 rounded-tl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/70 rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/70 rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white/70 rounded-br"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/70 text-xs sm:text-sm bg-black/30 px-2 py-1 rounded">Position receipt in frame</p>
              </div>
            </div>
          </>
        ) : (
          // Preview captured image
          <img 
            src={capturedImage} 
            alt="Captured receipt" 
            className="absolute h-full w-full object-contain bg-black"
          />
        )}
      </div>
      
      {/* Hidden canvas for capturing images */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Camera controls */}
      <div className="bg-black p-4 flex items-center justify-between">
        {!capturedImage ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Button 
              size="icon" 
              onClick={takePicture}
              className="h-16 w-16 rounded-full bg-white hover:bg-white/90 text-black"
            >
              <Camera className="h-8 w-8" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={switchCamera}
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="h-6 w-6" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={retakePicture}
              className="text-white hover:bg-white/10"
            >
              <Trash className="h-6 w-6" />
            </Button>
            
            <Button 
              onClick={acceptImage}
              className="bg-primary hover:bg-primary/90 text-white px-6"
            >
              <Check className="h-5 w-5 mr-2" />
              Use Photo
            </Button>
            
            <div className="w-10"></div> {/* Empty space for alignment */}
          </>
        )}
      </div>
    </motion.div>
  );
}
