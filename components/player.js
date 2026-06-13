"use client";

import React, { useRef, useState, useEffect } from "react";

const Player = ({ src, skipTimes = [], autoSkip = false }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && autoSkip) {
      const currentTime = video.currentTime;
      const skipInterval = skipTimes.find(
        ({ interval }) =>
          currentTime >= interval.startTime && currentTime < interval.endTime
      );
      if (skipInterval) {
        video.currentTime = skipInterval.interval.endTime;
      }
    }
    setCurrentTime(videoRef.current.currentTime);
  };

  const handlePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-black">
      <video
        ref={videoRef}
        controls
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-auto max-w-full"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button
        onClick={handlePlayPause}
        className="p-2 text-base border-none mr-2 rounded cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Play/Pause
      </button>
    </div>
  );
};

export default Player;
