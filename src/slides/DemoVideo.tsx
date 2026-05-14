import { useEffect, useRef } from "react";
import videoSrc from "../assets/vid/AINGO-DEMO.mp4";

export function DemoVideo() {
  const isPrintMode = new URLSearchParams(window.location.search).has('print');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPrintMode && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0.1;
    }
  }, [isPrintMode]);

  return (
    <video
      ref={videoRef}
      src={`${videoSrc}#t=0.1`}
      autoPlay={!isPrintMode}
      controls
      preload="auto"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}
