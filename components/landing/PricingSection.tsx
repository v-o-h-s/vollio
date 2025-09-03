"use client";

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-elegant-lg font-heading mb-6 bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent tracking-elegant">
            Simple Pricing
          </h2>
          <p className="text-body-lg font-body text-muted-foreground dark:text-slate-400 leading-relaxed">
            Choose the plan that works best for you. Start free and upgrade as you grow. 
            No hidden fees, cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}