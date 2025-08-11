'use client'

/**
 * PDFs Page Component
 * 
 * A dedicated page for viewing and managing all user's uploaded PDFs.
 * Uses the PDFListDisplay component to provide a modern, grid-based interface.
 * 
 * Features:
 * - Modern grid layout of all user PDFs
 * - Upload functionality with drag-and-drop
 * - Search and filtering capabilities
 * - Pagination for large collections
 * - Click to open PDFs in annotation viewer
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import { useState } from 'react'
import { Search, Filter, Grid, List } from 'lucide-react'
import { PDFListDisplay } from '@/components/pdf'

export default function PDFsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Your PDFs</h1>
                <p className="text-lg text-gray-600 font-medium">
                    Manage and organize your PDF documents
                </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search PDFs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Filter size={18} />
                        Filter
                    </button>

                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* PDF List Display */}
            <PDFListDisplay
                className="mt-8"
                showUpload={true}
            />
        </div>
    )
}