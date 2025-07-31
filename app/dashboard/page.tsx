import { FileText, BookOpen, Zap, TrendingUp, Clock, Plus } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-lg text-gray-600 font-medium">Welcome back to your Noto productivity workspace</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText size={24} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500 font-medium">Total</div>
            </div>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">Recent PDFs</h3>
          <p className="text-gray-600 text-sm font-medium">No PDFs uploaded yet</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
              Upload your first PDF →
            </button>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500 font-medium">Created</div>
            </div>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">Notes Created</h3>
          <p className="text-gray-600 text-sm font-medium">Start taking notes on your PDFs</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-green-600 text-sm font-semibold hover:text-green-700 transition-colors">
              Create your first note →
            </button>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap size={24} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500 font-medium">Actions</div>
            </div>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">Quick Actions</h3>
          <p className="text-gray-600 text-sm font-medium">Streamline your workflow</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors">
              Explore features →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Quick Actions</h2>
          <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
            View all →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/60">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Upload PDF</h3>
                <p className="text-blue-700 text-sm font-medium">Start your productivity journey</p>
              </div>
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-500/25">
              Upload Your First PDF
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 rounded-2xl border border-gray-200/60">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Recent Activity</h3>
                <p className="text-gray-600 text-sm font-medium">Track your progress</p>
              </div>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium">No recent activity</p>
              <p className="text-gray-400 text-sm mt-1">Your activity will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}