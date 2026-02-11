"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockFlashcards } from "../mockData";
import { ArrowLeft, ArrowRight, Rotate3D, Check, X } from "lucide-react";

export default function FlashcardStudyPreview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const currentCard = mockFlashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < mockFlashcards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      rotateY: direction > 0 ? 10 : -10,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      rotateY: direction < 0 ? 10 : -10,
      scale: 0.9,
    }),
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "50rem",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        padding: "2rem",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Header Area */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Flashcards
          </h2>
          <span
            style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}
          >
            Deck: Biology Terms
          </span>
        </div>
        <div style={{ fontSize: " 1rem", fontWeight: 700, color: "#94a3b8" }}>
          {currentIndex + 1} <span style={{ color: "#cbd5e1" }}>/</span>{" "}
          {mockFlashcards.length}
        </div>
      </div>

      {/* Card Stage */}
      <div
        style={{ position: "relative", height: "400px", perspective: "2000px" }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              cursor: "pointer",
              transformStyle: "preserve-3d",
            }}
            onClick={handleFlip}
          >
            {/* Front of Card */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                borderRadius: "1.5rem",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05)",
                backgroundColor: "white",
                border: "1px solid #f1f5f9",
                // Paper texture effect
                backgroundImage:
                  "linear-gradient(#f8fafc 2px, transparent 2px), linear-gradient(90deg, #f8fafc 2px, transparent 2px)",
                backgroundSize: "40px 40px",
                backgroundPosition: "-2px -2px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  left: "1.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Term
              </div>
              <p
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  textAlign: "center",
                  maxWidth: "80%",
                }}
              >
                {currentCard.front}
              </p>
              <div
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  color: "#cbd5e1",
                }}
              >
                <Rotate3D size={24} />
              </div>
            </div>

            {/* Back of Card */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                borderRadius: "1.5rem",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05)",
                backgroundColor: "#1e293b", // Dark mode back
                color: "white",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  left: "1.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Definition
              </div>
              <p
                style={{
                  fontSize: "1.5rem",
                  lineHeight: "1.6",
                  fontWeight: 500,
                  textAlign: "center",
                  maxWidth: "85%",
                }}
              >
                {currentCard.back}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Container */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.5rem",
          padding: "1rem",
          backgroundColor: "#f8fafc",
          borderRadius: "2rem",
          alignSelf: "center",
        }}
      >
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "white",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Self Rating Buttons (Visual Only) */}
        <button
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            border: "1px solid #fca5a5",
            backgroundColor: "#fef2f2",
            color: "#ef4444",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <X size={16} /> Hard
        </button>
        <button
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            border: "1px solid #86efac",
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Check size={16} /> Easy
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === mockFlashcards.length - 1}
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "white",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            cursor:
              currentIndex === mockFlashcards.length - 1
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            opacity: currentIndex === mockFlashcards.length - 1 ? 0.5 : 1,
          }}
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
