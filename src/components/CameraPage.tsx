import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, RotateCcw, Image, Zap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

// Random climbing holds (stable across renders)
function getRandomDots(count: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: count }).map((_, i) => ({
    top: `${Math.random() * 85 + 5}%`,
    left: `${Math.random() * 85 + 5}%`,
    color: colors[i % colors.length],
  }));
}

// 简单设备&能力检测
function isMobileLike() {
  const ua = navigator.userAgent || "";
  const touch = (navigator as any).maxTouchPoints >= 1;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || touch;
}
async function hasVideoInput() {
  try {
    const devices = await navigator.mediaDevices?.enumerateDevices?.();
    return (devices || []).some((d) => d.kind === "videoinput");
  } catch {
    return false;
  }
}

export default function CameraPage() {
  const [isCapturing, setIsCapturing] = useState(false);      // 正在分析/处理中
  const [isPreviewOn, setIsPreviewOn] = useState(false);      // 是否打开了摄像头预览
  const [snapUrl, setSnapUrl] = useState<string | null>(null); // 截图结果
  const [mobileCapable, setMobileCapable] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const climbingDots = useMemo(() => getRandomDots(8), []);

  useEffect(() => {
    // 判断是否“手机且有摄像头”或“设备支持视频输入”
    (async () => {
      const hasCam = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && (await hasVideoInput());
      setMobileCapable(isMobileLike() && hasCam);
    })();
    // 卸载时关流
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }, // 后置摄像头优先
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsPreviewOn(true);
      return true;
    } catch (e) {
      console.warn("getUserMedia failed:", e);
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsPreviewOn(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 1280;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setSnapUrl(dataUrl);
  };

  const handleCaptureClick = async () => {
    // 手机（且有摄像头）→ 打开或拍照；电脑 → 走上传
    if (mobileCapable) {
      if (!isPreviewOn) {
        const ok = await startCamera();
        if (!ok) {
          // 如果权限拒绝或失败，退回到上传
          fileInputRef.current?.click();
        }
      } else {
        // 正在预览 → 执行拍照
        setIsCapturing(true);
        takeSnapshot();
        // 模拟分析耗时
        setTimeout(() => {
          setIsCapturing(false);
          stopCamera();
          console.log("Photo captured! Detecting holds...");
          // TODO: 在这里调用你的识别逻辑
        }, 600);
      }
    } else {
      // 桌面端直接选择文件
      fileInputRef.current?.click();
    }
  };

  const handleUploadButton = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setSnapUrl(url);
    console.log("Uploaded image selected. Ready for hold detection.");
    // TODO: 在这里调用你的识别逻辑（用 <img src={url}> 或把文件传到后端）
  };

  const handleReset = () => {
    setSnapUrl(null);
    stopCamera();
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background overflow-hidden">
      {/* 背景攀岩点 */}
      {climbingDots.map((dot, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: dot.top,
            left: dot.left,
            width: "40px",
            height: "40px",
            background: dot.color,
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            zIndex: 10,
          }}
        />
      ))}

      {/* 主体 */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center space-y-2 px-4 pt-8 pb-3">
          <h1 className="text-2xl font-bold text-foreground">Hold Detector 📸</h1>
          <p className="text-muted-foreground">
            {mobileCapable ? "Open camera to capture a route" : "Upload a photo or use camera if available"}
          </p>
        </div>

        {/* 取景/预览区域 */}
        <div className="flex-1 px-4">
          <div className="relative w-full h-full max-h-96 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl overflow-hidden shadow-card">
            {/* 内容：优先显示截图 → 否则显示摄像头 → 否则占位 */}
            <div className="absolute inset-0 flex items-center justify-center">
              {snapUrl ? (
                <img src={snapUrl} alt="snapshot" className="max-h-full max-w-full object-contain" />
              ) : isPreviewOn ? (
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              ) : isCapturing ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-primary font-medium">Analyzing holds... ✨</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    {mobileCapable ? "Tap to open camera" : "Upload an image of your wall"}
                  </p>
                </div>
              )}
            </div>

            {/* 网格和四角指示仅在未有截图时显示 */}
            {!snapUrl && (
              <>
                <div className="absolute inset-0">
                  <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                </div>
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/60 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/60 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/60 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/60 rounded-br-lg" />
              </>
            )}
          </div>
        </div>

        {/* 控制区 */}
        <div className="px-4 py-8 space-y-6">
          {/* 主按钮：手机=开关相机/拍照；桌面=打开上传 */}
          <div className="flex justify-center">
            <Button
              onClick={handleCaptureClick}
              disabled={isCapturing}
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 shadow-float hover:shadow-card hover:scale-105 transition-all duration-300"
              title={mobileCapable ? (isPreviewOn ? "Take photo" : "Open camera") : "Upload image"}
            >
              {isCapturing ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </Button>
          </div>

          {/* 次级按钮：相册、重置、闪光灯（展示用） */}
          <div className="flex justify-center gap-6">
            <Button variant="outline" size="lg" className="rounded-full w-14 h-14" onClick={handleUploadButton} title="Choose from gallery">
              <Image className="w-5 h-5" />
            </Button>

            <Button variant="outline" size="lg" className="rounded-full w-14 h-14" onClick={handleReset} title="Reset">
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button variant="outline" size="lg" className="rounded-full w-14 h-14" title="Flash (UI only)">
              <Zap className="w-5 h-5" />
            </Button>
          </div>

          {/* 上传入口（所有设备都能点开） */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground px-2">or</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <Button
              variant="outline"
              className="w-full py-4 rounded-xl border-dashed border-2 hover:bg-primary/5"
              onClick={handleUploadButton}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Photo from Gallery
            </Button>

            {/* 隐藏文件输入，手机端也可用（capture 提示后置摄像头） */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>

          {/* Tips */}
          <div className="bg-accent/10 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-accent">💡</span>
              Photography Tips
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Keep the wall centered in frame</li>
              <li>• Ensure good lighting on holds</li>
              <li>• Stand 2–3 meters away for best results</li>
              <li>• Hold steady while capturing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 离屏 canvas 用于截图 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}