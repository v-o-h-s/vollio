"use client";

export function VideoDemo() {
  return (
    <section className="relative py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Video Demo Container - 1400x800 */}
        <div className="flex justify-center">
          <div
            className="relative bg-card dark:bg-slate-900/50 border border-border dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl video-demo-container"
            style={{
              width: "1400px",
              maxWidth: "100%",
              height: "800px",
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

            {/* Video Content Area */}
            <div
              className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden"
              style={{ height: "calc(100% - 60px)" }}
            >
              {/* Placeholder for actual video - you can replace this with an actual video element */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-body">
                    Click to play demo video
                  </p>
                </div>
              </div>

              {/* Simulated PDF Document with Annotations (as fallback/preview) */}
              <div className="absolute inset-4 bg-white dark:bg-slate-100 rounded-lg shadow-inner overflow-hidden opacity-30">
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
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                    <div className="h-3 bg-green-200 rounded w-3/5 relative">
                      {/* Third annotation */}
                      <div className="absolute -right-1 -top-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        3
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar with notes (partially visible) */}
              <div className="absolute right-4 top-4 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg p-3 opacity-30">
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
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">
                      Annotation 3
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      Research methodology insight...
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating toolbar */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 flex items-center space-x-1 opacity-30">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
