import { LandingHeader } from "@/components/landing";

export default function Page() {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <LandingHeader />
      
      {/* Hero Section with Modern Dark Theme */}
      <main className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.02]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 dark:from-slate-950/80 to-transparent" />
        </div>
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 dark:from-blue-400 dark:via-violet-400 dark:to-blue-400 bg-clip-text text-transparent animate-gradient bg-300% leading-tight">
                Welcome to Noto
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground dark:text-slate-400 mb-8 leading-relaxed">
                Your powerful PDF annotation and note-taking companion
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 dark:from-blue-500 dark:to-violet-500 dark:hover:from-blue-600 dark:hover:to-violet-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25 transition-all duration-300 transform hover:scale-105">
                  Get Started Free
                </button>
                <button className="px-8 py-4 border border-border dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-foreground dark:text-slate-300 font-semibold rounded-xl backdrop-blur-sm hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-all duration-300">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            <section id="home" className="py-20">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Transform Your PDF Experience
                </h2>
                <p className="text-lg text-muted-foreground dark:text-slate-400 leading-relaxed">
                  Seamlessly annotate, organize, and collaborate on PDF documents with our intuitive interface and powerful features.
                </p>
              </div>
            </section>
            
            <section id="features" className="py-20">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Powerful Features
                </h2>
                <p className="text-lg text-muted-foreground dark:text-slate-400 leading-relaxed">
                  Advanced annotation tools, real-time collaboration, and intelligent organization to boost your productivity.
                </p>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  {[
                    { title: "Smart Annotations", desc: "Intelligent text selection and highlighting" },
                    { title: "Real-time Sync", desc: "Collaborate seamlessly across devices" },
                    { title: "Organized Notes", desc: "Keep your thoughts structured and searchable" }
                  ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-card dark:bg-slate-900/50 border border-border dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-blue-500/10">
                      <h3 className="text-xl font-semibold mb-3 text-foreground dark:text-slate-200">{feature.title}</h3>
                      <p className="text-muted-foreground dark:text-slate-400">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            
            <section id="about" className="py-20">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                  About Noto
                </h2>
                <p className="text-lg text-muted-foreground dark:text-slate-400 leading-relaxed">
                  Built for researchers, students, and professionals who demand the best tools for document analysis and note-taking.
                </p>
              </div>
            </section>
            
            <section id="pricing" className="py-20">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Simple Pricing
                </h2>
                <p className="text-lg text-muted-foreground dark:text-slate-400 leading-relaxed">
                  Choose the plan that works best for you. Start free and upgrade as you grow.
                </p>
              </div>
            </section>
            
            <section id="contact" className="py-20">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Get in Touch
                </h2>
                <p className="text-lg text-muted-foreground dark:text-slate-400 leading-relaxed">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>
            </section>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="relative mt-32 border-t border-border/20 dark:border-slate-800 bg-muted/30 dark:bg-slate-950/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <p className="text-muted-foreground dark:text-slate-400">
                © 2024 Noto. Built with ❤️ for better document workflows.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}