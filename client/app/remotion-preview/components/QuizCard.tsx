import React from "react";
import { BookOpen, Clock, Globe, Trash2, Play, Calendar } from "lucide-react";

export function QuizCard({
  q,
  onDelete,
}: {
  q: any;
  onDelete?: (id: string) => void;
}) {
  const difficulty = q.settings?.difficultyLevel || "Medium";
  const questionCount =
    q.settings?.numberOfQuestions || q.questions?.length || 0;
  const timeEstimate = questionCount * 1.5;

  const getDifficultyStyles = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return {
          background:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.15))",
          color: "#047857",
          border: "1px solid rgba(16, 185, 129, 0.3)",
        };
      case "medium":
        return {
          background:
            "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.15))",
          color: "#b45309",
          border: "1px solid rgba(245, 158, 11, 0.3)",
        };
      case "hard":
        return {
          background:
            "linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(225, 29, 72, 0.15))",
          color: "#be123c",
          border: "1px solid rgba(244, 63, 94, 0.3)",
        };
      default:
        return {
          background: "#f1f5f9",
          color: "#334155",
          border: "1px solid #cbd5e1",
        };
    }
  };

  const difficultyStyle = getDifficultyStyles(difficulty);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: "1rem",
        overflow: "hidden",
        backgroundColor: "white",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        border: "1px solid rgba(226, 232, 240, 0.8)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
        e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)"; // Indigo tint on hover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.8)";
      }}
    >
      {/* Decorative top shape/gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          background: "linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)",
        }}
      />

      {/* Hover Delete Button */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 10,
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.(q.id);
          }}
          style={{
            height: "2rem",
            width: "2rem",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(226, 232, 240, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#94a3b8",
            transition: "all 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.backgroundColor = "#fee2e2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content Container */}
      <div
        style={{
          padding: "1.5rem",
          paddingBottom: "0",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {/* Difficulty Badge */}
        <div style={{ marginBottom: "0.75rem" }}>
          <span
            style={{
              padding: "0.25rem 0.75rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderRadius: "9999px",
              ...difficultyStyle,
            }}
          >
            {difficulty}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            lineHeight: "1.4",
            color: "#1e293b",
            marginBottom: "0.5rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {q.title || "Untitled Quiz"}
        </h3>

        {/* Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.75rem",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          <Calendar size={12} />
          <span>
            {new Date(q.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginTop: "1.5rem",
          }}
        >
          {/* Document Source */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              color: "#475569",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            <BookOpen size={14} color="#6366f1" />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={q.documentId}
            >
              {q.documentId?.split("-")[0] || "Doc"}
            </span>
          </div>

          {/* Language */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              color: "#475569",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            <Globe size={14} color="#0ea5e9" />
            <span>{(q.language || "en").toUpperCase()}</span>
          </div>

          {/* Time Estimate */}
          <div
            style={{
              gridColumn: "span 2",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              color: "#475569",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            <Clock size={14} color="#f59e0b" />
            <span>Estimated time: ~{Math.round(timeEstimate)} min</span>
          </div>
        </div>
      </div>

      {/* Footer / Questions count and action */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          marginTop: "1rem",
          background: "linear-gradient(to bottom, transparent, #fafafa)",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b" }}
          >
            {questionCount}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#64748b",
              marginLeft: "0.25rem",
            }}
          >
            Questions
          </span>
        </div>

        <a
          href={`/knowledge-test/quizzes/${q.id}`}
          style={{ textDecoration: "none" }}
        >
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              color: "white",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 8px -1px rgba(79, 70, 229, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px -1px rgba(79, 70, 229, 0.3)";
            }}
          >
            <Play
              size={14}
              style={{ marginRight: "0.5rem", fill: "currentColor" }}
            />{" "}
            Start
          </button>
        </a>
      </div>
    </div>
  );
}
