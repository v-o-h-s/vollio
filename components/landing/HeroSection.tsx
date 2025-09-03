"use client";

export function HeroSection() {
  return (
    <section className="relative">
      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Two-line Heading */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-heading font-elegant-bold mb-2 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 dark:from-blue-400 dark:via-violet-400 dark:to-blue-400 bg-clip-text text-transparent animate-gradient bg-300% leading-tight tracking-elegant">
              Welcome to Noto
            </h1>
            <h2 className="text-3xl md:text-5xl font-heading font-elegant-bold bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent leading-tight tracking-elegant">
              Annotate Smarter, Not Harder
            </h2>
          </div>
          
          {/* Product Description - Max 2 lines */}
          <p className="text-lg md:text-xl font-body text-muted-foreground dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            Transform your PDF workflow with intelligent annotations and seamless note-taking. 
            Boost productivity with tools designed for modern document collaboration.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 dark:from-blue-500 dark:to-violet-500 dark:hover:from-blue-600 dark:hover:to-violet-600 text-white font-body font-elegant-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25 transition-all duration-300 transform hover:scale-105 tracking-luxury">
              Get Started Free
            </button>
            <button className="px-8 py-4 border border-border dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-foreground dark:text-slate-300 font-body font-elegant-medium rounded-xl backdrop-blur-sm hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}