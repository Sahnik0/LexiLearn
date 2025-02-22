import React, { useRef, useState, useEffect } from "react";
import * as tf from '@tensorflow/tfjs';
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import toast from 'react-hot-toast';
import axios from "axios";
import { useAuthContext } from '../../contexts/AuthContext';

const ObjectDetector = () => {
  const [detection, setDetection] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const { user } = useAuthContext();

  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  const stopDetection = () => {
    setIsDetecting(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  };

  const startDetection = async () => {
    setIsDetecting(true);
    await tf.setBackend('webgl');
    const net = await cocossd.load();
    detectionIntervalRef.current = setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const obj = await net.detect(video);
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  };

  const drawRect = (detections, ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    detections.forEach(element => {
      const [x, y, width, height] = element['bbox'];
      const text = element['class'];
      setDetection(text);

      ctx.strokeStyle = '#22c55e';
      ctx.font = '18px Inter';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#22c55e';
      ctx.fillText(text, x, y > 20 ? y - 5 : y + 20);
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.stroke();
    });
  };

  const createCard = async () => {
    try {
      if(user) {
        const config = {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        };
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/card/add/`, 
          { name: detection }, 
          config
        );
        if(response?.status === 201) {
          toast.success('Card added successfully');
          setDetection('');
        }
      }
    } catch(error) {
      console.error(error);
      toast.error(error?.message || "Failed to create card");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="relative w-full max-w-2xl">
        <Webcam
          ref={webcamRef}
          muted={true}
          className="w-full rounded-lg"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      <button
        onClick={isDetecting ? stopDetection : startDetection}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {isDetecting ? 'STOP DETECTION' : 'START DETECTION'}
      </button>

      {detection && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">OBJECT DETECTED: {detection}</h2>
          {!isDetecting && (
            <button
              onClick={createCard}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              CREATE CARD
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectDetector;