"use client";

export function ContactSection() {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-elegant-lg font-heading mb-6 bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent tracking-elegant">
            Get in Touch
          </h2>
          <p className="text-body-lg font-body text-muted-foreground dark:text-slate-400 leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible. 
            Your feedback helps us build better tools for everyone.
          </p>
        </div>
      </div>
    </section>
  );
}