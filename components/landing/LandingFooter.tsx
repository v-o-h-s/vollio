"use client";

export function LandingFooter() {
  return (
    <footer className="relative mt-32 border-t border-border/20 dark:border-slate-800 bg-muted/30 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-body-md font-body text-muted-foreground dark:text-slate-400">
            © 2024 Noto. Built with ❤️ for better document workflows.
          </p>
        </div>
      </div>
    </footer>
  );
}