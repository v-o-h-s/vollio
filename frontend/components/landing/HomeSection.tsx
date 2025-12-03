"use client";

export function HomeSection() {
  return (
    <section id="home" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-elegant-lg font-heading mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-elegant">
            Transform Your PDF Experience
          </h2>
          <p className="text-body-lg font-body text-muted-foreground dark:text-slate-400 leading-relaxed">
            Seamlessly annotate, organize, and collaborate on PDF documents with our intuitive interface and powerful features.
          </p>
        </div>
      </div>
    </section>
  );
}