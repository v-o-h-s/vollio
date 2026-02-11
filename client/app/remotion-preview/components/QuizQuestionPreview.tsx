"use client";

import React, { useState } from "react";
import { mockQuestions } from "../mockData";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

export default function QuizQuestionPreview() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const question = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "56rem",
        margin: "0 auto",
        padding: "2rem",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: "#1e293b",
        backgroundColor: "#f8fafc", // Page bg
        borderRadius: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      {/* Top Bar with Segmented Progress */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#e0e7ff",
              color: "#4338ca",
            }}
          >
            <HelpCircle size={20} />
          </div>
          <div>
            <h2
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#64748b",
              }}
            >
              Knowledge Check
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                margin: 0,
                color: "#94a3b8",
                fontWeight: 600,
              }}
            >
              Biology 101
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.25rem" }}>
          {mockQuestions.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: "2.5rem",
                height: "0.25rem",
                borderRadius: "1rem",
                backgroundColor:
                  idx <= currentQuestionIndex ? "#6366f1" : "#e2e8f0",
                transition: "background-color 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2rem",
          backgroundColor: "white",
          borderRadius: "1.5rem",
          padding: "2rem",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
          border: "1px solid #f1f5f9",
        }}
      >
        {/* Question Section */}
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: "1rem",
              fontSize: "3rem",
              lineHeight: "1",
              fontWeight: 800,
              color: "#e2e8f0",
              fontFamily: "serif",
            }}
          >
            {String(currentQuestionIndex + 1).padStart(2, "0")}
          </span>
          <h1
            style={{
              marginTop: "-0.5rem",
              fontSize: "1.75rem",
              fontWeight: 700,
              lineHeight: "1.3",
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            {question.text}
          </h1>
        </div>

        {/* Options Section */}
        <div style={{ display: "grid", gap: "1rem" }}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;

            // State Logic
            let bg = "white";
            let border = "2px solid #e2e8f0";
            let text = "#475569";
            let indicatorBg = "#f1f5f9";
            let indicatorText = "#64748b";
            let indicatorBorder = "none";

            if (isSubmitted) {
              if (isCorrect) {
                bg = "#ecfdf5";
                border = "2px solid #10b981";
                text = "#065f46";
                indicatorBg = "#10b981";
                indicatorText = "white";
              } else if (isSelected && !isCorrect) {
                bg = "#fef2f2";
                border = "2px solid #ef4444";
                text = "#991b1b";
                indicatorBg = "#ef4444";
                indicatorText = "white";
              } else {
                bg = "#f8fafc"; // dimmed
                text = "#94a3b8";
              }
            } else if (isSelected) {
              bg = "#eef2ff";
              border = "2px solid #6366f1";
              text = "#312e81";
              indicatorBg = "#6366f1";
              indicatorText = "white";
            }

            return (
              <button
                key={index}
                onClick={() => !isSubmitted && setSelectedAnswer(option)}
                disabled={isSubmitted}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderRadius: "1rem",
                  backgroundColor: bg,
                  border: border,
                  color: text,
                  cursor: isSubmitted ? "default" : "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 500,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitted && !isSelected) {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitted && !isSelected) {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "0.5rem",
                    backgroundColor: indicatorBg,
                    color: indicatorText,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: "all 0.2s",
                    border: indicatorBorder,
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span style={{ flex: 1 }}>{option}</span>

                {isSubmitted && isCorrect && (
                  <CheckCircle2 size={24} color="#10b981" />
                )}
                {isSubmitted && isSelected && !isCorrect && (
                  <XCircle size={24} color="#ef4444" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation Banner */}
      {isSubmitted && (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "1rem",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            display: "flex",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <div style={{ width: "0.5rem", backgroundColor: "#3b82f6" }} />
          <div style={{ padding: "1.5rem", flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                color: "#2563eb",
              }}
            >
              <AlertCircle size={18} />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Explanation
              </span>
            </div>
            <p style={{ margin: 0, color: "#334155", lineHeight: "1.6" }}>
              {question.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.5rem",
        }}
      >
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            border: "1px solid #e2e8f0",
            backgroundColor: "white",
            color: currentQuestionIndex === 0 ? "#cbd5e1" : "#64748b",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (currentQuestionIndex !== 0) {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.color = "#0f172a";
            }
          }}
          onMouseLeave={(e) => {
            if (currentQuestionIndex !== 0) {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "#64748b";
            }
          }}
        >
          <ArrowLeft size={16} /> Prev
        </button>

        {!isSubmitted ? (
          <button
            onClick={() => setIsSubmitted(true)}
            disabled={!selectedAnswer}
            style={{
              padding: "0.875rem 3rem",
              borderRadius: "1rem",
              backgroundColor: !selectedAnswer ? "#e2e8f0" : "#1e293b",
              color: !selectedAnswer ? "#94a3b8" : "white",
              border: "none",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: !selectedAnswer ? "not-allowed" : "pointer",
              boxShadow: !selectedAnswer
                ? "none"
                : "0 10px 15px -3px rgba(30, 41, 59, 0.3)",
              transition: "all 0.2s",
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (selectedAnswer)
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              if (selectedAnswer)
                e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Submit
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === mockQuestions.length - 1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 2.5rem",
              borderRadius: "1rem",
              backgroundColor: "#1e293b", // slate-900
              color: "white",
              border: "none",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 10px 15px -3px rgba(30, 41, 59, 0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            Next <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
