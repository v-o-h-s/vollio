"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Eye, Library, GraduationCap, Puzzle } from "lucide-react";

/**
 * Premium Login Animation
 * Optimized: GSAP for entrance sequences, CSS for looping animations.
 */
export default function LoginAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const brandRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<
    {
      x: number;
      y: number;
      delay: number;
      duration: number;
      scale: number;
      drift: number;
    }[]
  >([]);

  useEffect(() => {
    // Generate particles on mount to avoid hydration mismatch
    const newParticles = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
      scale: Math.random() * 3 + 1,
      drift: Math.random() * 50,
    }));
    setParticles(newParticles);

    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Feature Cards Entrance
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { scale: 0.8, opacity: 0, y: 40 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.3 + i * 0.2,
            ease: "expo.out",
            onComplete: () => {
              gsap.set(card, { clearProps: "transform" });
            },
          },
        );
      });

      // Brand Text Entrance
      if (brandRef.current) {
        const lines = brandRef.current.querySelectorAll(".animate-line");
        gsap.fromTo(
          lines,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            delay: 0.8,
            ease: "power3.out",
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Eye,
      title: "AI-Enhanced Viewer",
      description:
        "Read, analyze, and annotate with an AI viewer that lives right next to your notes.",
      color: "from-purple-500/20 to-pink-500/20",
      accent: "purple-500",
      x: "8%",
      y: "50%",
      rotation: -1.5,
    },
    {
      icon: Library,
      title: "Intelligent Library",
      description:
        "Organize your documents in a centralized library designed for speed and structure.",
      color: "from-blue-500/20 to-indigo-500/20",
      accent: "blue-500",
      x: "12%",
      y: "18%",
      rotation: 2,
    },
    {
      icon: GraduationCap,
      title: "Quizzes & Flashcards",
      description:
        "Challenge your understanding with AI-generated quizzes tailored to your material.",
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "emerald-500",
      x: "68%",
      y: "12%",
      rotation: -2,
    },
    {
      icon: Puzzle,
      title: "LMS Integrations",
      description:
        "Sync seamlessly with tools like Google Classroom and Moodle to keep your library up to date.",
      color: "from-orange-500/20 to-red-500/20",
      accent: "orange-500",
      x: "72%",
      y: "52%",
      rotation: 1.5,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-black flex items-center justify-center"
    >
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(5);
            opacity: 0;
          }
        }
        @keyframes floating {
          0%,
          100% {
            transform: translateY(0) rotate(var(--base-rot));
          }
          50% {
            transform: translateY(-20px) rotate(calc(var(--base-rot) * -1));
          }
        }
        @keyframes beam {
          0% {
            transform: translateX(-100%);
          }
          50%,
          100% {
            transform: translateX(250%);
          }
        }
        @keyframes particle-life {
          0%,
          100% {
            opacity: 0;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(var(--drift), calc(var(--drift) * -1))
              scale(var(--scale));
          }
        }
        .animate-floating {
          animation: floating var(--duration) ease-in-out infinite;
        }
        .animate-beam {
          animation: beam 3s linear infinite;
        }
        .animate-particle {
          animation: particle-life var(--duration) ease-in-out infinite;
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute inset-0 bg-size-[60px_60px] bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Feature Cards */}
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <div
            key={i}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            style={
              {
                left: f.x,
                top: f.y,
                "--base-rot": `${f.rotation}deg`,
                "--duration": `${3 + (i % 3)}s`,
              } as React.CSSProperties
            }
            className="absolute group z-10 opacity-0 animate-floating"
          >
            {/* Holographic Card Wrapper */}
            <div
              className={`relative flex flex-col gap-4 bg-zinc-950/40 backdrop-blur-2xl border border-white/10 p-6 rounded-[32px] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-72 transition-all duration-500 group-hover:border-${f.accent}/40 group-hover:shadow-${f.accent}/10 group-hover:-translate-y-2 overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${f.color} opacity-30 group-hover:opacity-100 transition-opacity duration-700`}
              />

              {/* Animated Border Beam */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className={`absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-${f.accent} to-transparent animate-beam`}
                />
              </div>

              {/* Card Content */}
              <div className="relative z-10">
                <div
                  className={`p-3 w-12 h-12 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-${f.accent}/10 transition-all duration-500`}
                >
                  <Icon
                    size={24}
                    className={`text-white transition-colors duration-500 group-hover:text-${f.accent}`}
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-2 tracking-tight">
                    {f.title}
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium transition-colors duration-500 group-hover:text-zinc-300">
                    {f.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Particles Container */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute h-px w-px bg-white rounded-full animate-particle"
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                "--duration": `${p.duration}s`,
                "--drift": `${p.drift}px`,
                "--scale": p.scale,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Central Brand Content */}
      <div ref={brandRef} className="absolute bottom-20 left-20 right-20 z-20">
        <h2 className="animate-line text-6xl font-black text-white mb-6 tracking-tighter leading-[0.9] flex flex-col">
          <span>Master your</span>
          <span className="text-indigo-400 drop-shadow-2xl">knowledge.</span>
        </h2>
        <p className="animate-line text-zinc-500 text-xl leading-relaxed font-medium max-w-xl border-l-2 border-white/5 pl-8 italic">
          "The ultimate workspace where your thoughts transcend boundaries and
          AI catalyzes your growth."
        </p>
      </div>
    </div>
  );
}
