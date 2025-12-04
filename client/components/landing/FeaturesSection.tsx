"use client";

const features = [
  { 
    title: "Smart Annotations", 
    desc: "Intelligent text selection and highlighting with AI-powered suggestions" 
  },
  { 
    title: "Real-time Sync", 
    desc: "Collaborate seamlessly across devices with instant synchronization" 
  },
  { 
    title: "Organized Notes", 
    desc: "Keep your thoughts structured and searchable with advanced organization" 
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-elegant-lg font-heading mb-6 bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent tracking-elegant">
            Powerful Features
          </h2>
          <p className="text-body-lg font-body text-muted-foreground dark:text-slate-400 leading-relaxed mb-12">
            Advanced annotation tools, real-time collaboration, and intelligent organization to boost your productivity.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-card dark:bg-slate-900/50 border border-border dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-blue-500/10 modern-card"
              >
                <h3 className="text-elegant-md font-heading mb-3 text-foreground dark:text-slate-200">
                  {feature.title}
                </h3>
                <p className="text-body-md font-body text-muted-foreground dark:text-slate-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}