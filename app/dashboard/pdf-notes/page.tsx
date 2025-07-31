import { Upload, FileText, BookOpen, Search, Filter, Grid, List } from 'lucide-react'

export default function PDFNotesPage() {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">PDF & Notes</h1>
                    <p className="text-lg text-gray-600 font-medium">Upload PDFs and create anchored notes for enhanced productivity</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                        <Filter size={18} />
                        <span className="font-medium">Filter</span>
                    </button>
                    <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button className="p-2 bg-white rounded-lg shadow-sm">
                            <Grid size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl border-2 border-dashed border-blue-200/60 p-12 text-center hover:border-blue-300/60 transition-colors">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                    <Upload size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Upload your first PDF</h3>
                <p className="text-blue-700 font-medium mb-6 max-w-md mx-auto">
                    Drag and drop a PDF file here, or click to browse your files and start taking notes
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2">
                        <Upload size={20} />
                        Choose File
                    </button>
                    <p className="text-blue-600 text-sm font-medium">
                        Supports PDF files up to 50MB
                    </p>
                </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <FileText size={24} className="text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">PDF Annotation</h3>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">
                        Highlight text, add comments, and create anchored notes directly on your PDF documents
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <BookOpen size={24} className="text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Smart Notes</h3>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">
                        Create intelligent notes that are linked to specific sections of your documents
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <Search size={24} className="text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Quick Search</h3>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">
                        Find any note or annotation instantly with our powerful search functionality
                    </p>
                </div>
            </div>

            {/* Empty State */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-12 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No PDFs uploaded yet</h3>
                    <p className="text-gray-600 font-medium mb-6">
                        Upload your first PDF to start creating notes and annotations
                    </p>
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    )
}