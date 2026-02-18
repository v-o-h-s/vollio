"use client";

import Script from "next/script";
import React, { createContext, useContext, useEffect, useState } from "react";

interface PaddleContextType {
  paddle: any;
  isLoaded: boolean;
}

const PaddleContext = createContext<PaddleContextType>({
  paddle: null,
  isLoaded: false,
});

export const usePaddle = () => useContext(PaddleContext);

export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const [paddle, setPaddle] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Paddle && !paddle) {
      const paddleInstance = (window as any).Paddle;
      paddleInstance.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      });

      setPaddle(paddleInstance);
      setIsLoaded(true);
    }
  }, [paddle]);

  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={() => {
          const paddleInstance = (window as any).Paddle;
          paddleInstance.Initialize({
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          });

          setPaddle(paddleInstance);
          setIsLoaded(true);
        }}
      />
      <PaddleContext.Provider value={{ paddle, isLoaded }}>
        {children}
      </PaddleContext.Provider>
    </>
  );
}
