"use client";

export function AboutSection() {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-elegant-lg font-heading mb-6 bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent tracking-elegant">
            About Noto
          </h2>
          <p className="text-body-lg font-body text-muted-foreground dark:text-slate-400 leading-relaxed">
            Built for researchers, students, and professionals who demand the best tools for document analysis and note-taking. 
            Our mission is to revolutionize how you interact with digital documents through intelligent annotation and seamless collaboration.
          </p>
        </div>
      </div>
    </section>
  );
}