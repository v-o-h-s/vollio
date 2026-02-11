import React from "react";
import {
  Layers,
  GraduationCap,
  Calendar,
  Trash2,
  Globe,
  BookOpen,
} from "lucide-react";

export function FlashcardCard({
  set,
  onDelete,
}: {
  set: any;
  onDelete: (id: string) => void;
}) {
  const cardCount = set.flashCards?.length || 0;

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
        e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.4)"; // Pink tint on hover
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
          background: "linear-gradient(to right, #ec4899, #db2777, #be185d)",
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
            onDelete(set.id);
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
        {/* Type Badge */}
        <div style={{ marginBottom: "0.75rem" }}>
          <span
            style={{
              padding: "0.25rem 0.75rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderRadius: "9999px",
              background:
                "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.15))",
              color: "#be185d",
              border: "1px solid rgba(236, 72, 153, 0.3)",
            }}
          >
            Flashcards
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
          {set.name || "Untitled Deck"}
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
            {new Date(set.createdAt).toLocaleDateString(undefined, {
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
            <BookOpen size={14} color="#ec4899" />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={set.documentId}
            >
              {set.documentId?.split("-")[0] || "Doc"}
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
            <span>{(set.language || "en").toUpperCase()}</span>
          </div>
          {/* Card Count */}
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
            <Layers size={14} color="#8b5cf6" />
            <span>{cardCount} Cards in deck</span>
          </div>
        </div>
      </div>

      {/* Footer */}
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
        {/* Visual Indicator of stack */}
        <div style={{ display: "flex" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "1rem",
                height: "1.4rem",
                background: i === 3 ? "#ec4899" : "#fce7f3",
                border: "1px solid rgba(236, 72, 153, 0.3)",
                borderRadius: "2px",
                marginLeft: i === 1 ? 0 : "-0.5rem",
                zIndex: i,
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </div>

        <a
          href={`/knowledge-test/flashcards/${set.id}`}
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
              background: "linear-gradient(135deg, #ec4899, #db2777)",
              color: "white",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(219, 39, 119, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 8px -1px rgba(219, 39, 119, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px -1px rgba(219, 39, 119, 0.3)";
            }}
          >
            <GraduationCap size={16} style={{ marginRight: "0.5rem" }} />{" "}
            Practice
          </button>
        </a>
      </div>
    </div>
  );
}
