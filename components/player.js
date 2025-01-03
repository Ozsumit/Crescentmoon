"use client";

import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";

// Styled Components
const VideoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #000;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  max-width: 100%;
`;

const Button = styled.button`
  padding: 0.5rem;
  font-size: 1rem;
  border: none;
  margin-right: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  &:hover {
    background-color: #0056b3;
  }
`;

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
    <VideoContainer>
      <Video ref={videoRef} controls onTimeUpdate={handleTimeUpdate}>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </Video>
      <Button onClick={handlePlayPause}>Play/Pause</Button>
    </VideoContainer>
  );
};

export default Player;
