"use client";

export function DemoSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-heading font-elegant-semibold mb-4 text-foreground dark:text-slate-200 tracking-elegant">
            See Noto in Action
          </h3>
          <p className="text-body-lg font-body text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto">
            Experience the power of intelligent PDF annotation and note-taking
          </p>
        </div>
        
        {/* Demo Video Container - 1400x1000 with only 20% (200px) visible */}
        <div className="flex justify-center">
          <div 
            className="relative bg-card dark:bg-slate-900/50 border border-border dark:border-slate-800 rounded-t-2xl overflow-hidden shadow-2xl"
            style={{ 
              width: '1400px', 
              maxWidth: '100%',
              height: '200px' // 20% of 1000px
            }}
          >
            {/* Demo Header */}
            <div className="bg-muted/50 dark:bg-slate-800/50 px-6 py-4 border-b border-border dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-4 text-sm font-body text-muted-foreground dark:text-slate-400">
                  Noto - PDF Annotation Tool
                </div>
              </div>
            </div>
            
            {/* Video Content Area - Simulating a video player */}
            <div 
              className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden"
              style={{ height: 'calc(100% - 60px)' }} // Subtract header height
            >
              {/* Simulated PDF Document with Annotations */}
              <div className="absolute inset-4 bg-white dark:bg-slate-100 rounded-lg shadow-inner overflow-hidden">
                {/* PDF Page Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-heading font-elegant-semibold text-slate-800">
                      Research Paper: AI in Education
                    </h4>
                    <div className="text-xs text-slate-500">Page 1 of 12</div>
                  </div>

                  {/* Simulated text lines with annotations */}
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-3 bg-blue-200 rounded w-4/5 relative">
                      {/* Annotation highlight */}
                      <div className="absolute -right-1 -top-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-violet-200 rounded w-3/4 relative">
                      {/* Another annotation */}
                      <div className="absolute -right-1 -top-0.5 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar with notes (partially visible) */}
              <div className="absolute right-4 top-4 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
                <h5 className="font-heading font-elegant-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm">
                  My Notes
                </h5>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      Annotation 1
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      Key insight about AI implementation...
                    </div>
                  </div>
                  <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded border-l-2 border-violet-500">
                    <div className="text-xs text-violet-600 dark:text-violet-400 mb-1">
                      Annotation 2
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      Important methodology note...
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating toolbar */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 flex items-center space-x-1">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                </button>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <div className="w-3 h-3 bg-violet-500 rounded"></div>
                </button>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs font-body font-elegant-medium">
                  Bold
                </button>
                <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs font-body font-elegant-medium">
                  Note
                </button>
              </div>
              
              {/* Gradient fade to indicate more content below */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-100 dark:from-slate-800 to-transparent"></div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 text-muted-foreground dark:text-slate-400">
            <span className="text-sm font-body">Scroll to see full demo</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}