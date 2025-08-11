'use client'

/**
 * Recent Activity Display Component
 * 
 * A component to show user's recent PDF activity prominently on the dashboard.
 * Displays the last opened PDF with quick access functionality and real-time updates.
 * 
 * Key Features:
 * - Shows user's last opened PDF prominently
 * - Displays last accessed time with human-readable formatting
 * - Provides quick access link to continue where user left off
 * - Handles cases where no recent activity exists
 * - Integrates with RTK Query for real-time activity updates
 * - Modern card-based design with hover effects
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import { useRouter } from 'next/navigation'
import { Clock, FileText, Eye, ArrowRight } from 'lucide-react'
import { useGetPDFsQuery } from '@/lib/store/apiSlice'
import { UserActivity } from '@/lib/types'

interface RecentActivityDisplayProps {
    /** Optional CSS class name for styling */
    className?: string
    /** Whether to show the component title */
    showTitle?: boolean
    /** Compact mode for smaller displays */
    compact?: boolean
}

/**
 * Formats activity time in human-readable format
 */
const formatActivityTime = (date: string): string => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`

    return activityDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: activityDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
}

/**
 * Gets activity type display text
 */
const getActivityTypeText = (activityType: string): string => {
    switch (activityType) {
        case 'view':
            return 'Viewed'
        case 'upload':
            return 'Uploaded'
        case 'delete':
            return 'Deleted'
        default:
            return 'Accessed'
    }
}

export default function RecentActivityDisplay({
    className = '',
    showTitle = true,
    compact = false
}: RecentActivityDisplayProps) {
    const router = useRouter()

    // Fetch user's PDFs and recent activity using RTK Query
    const {
        data: pdfData,
        isLoading,
        error
    } = useGetPDFsQuery({})

    const recentActivity = pdfData?.recentActivity

    /**
     * Handles click to open the recent PDF
     */
    const handleActivityClick = () => {
        if (recentActivity) {
            router.push(`/dashboard/pdf-notes?pdf=${recentActivity.pdfId}`)
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div className={`${className}`}>
                {showTitle && !compact && (
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                )}
                <div className={`bg-white rounded-2xl border border-gray-200 p-6 animate-pulse ${compact ? 'p-4' : 'p-6'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className={`${className}`}>
                {showTitle && !compact && (
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                )}
                <div className={`bg-red-50 border border-red-200 rounded-2xl p-6 text-center ${compact ? 'p-4' : 'p-6'}`}>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock size={24} className="text-red-600" />
                    </div>
                    <p className="text-red-800 font-medium text-sm">Failed to load recent activity</p>
                </div>
            </div>
        )
    }

    // No recent activity state
    if (!recentActivity) {
        return (
            <div className={`${className}`}>
                {showTitle && !compact && (
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                )}
                <div className={`bg-gray-50 rounded-2xl p-6 text-center ${compact ? 'p-4' : 'p-6'}`}>
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock size={24} className="text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">No recent activity</h4>
                    <p className="text-gray-600 text-sm">
                        Your recent PDF activity will appear here
                    </p>
                </div>
            </div>
        )
    }

    // Recent activity display
    return (
        <div className={`${className}`}>
            {showTitle && !compact && (
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            )}

            <div
                onClick={handleActivityClick}
                className={`
          group bg-white rounded-2xl border border-gray-200 hover:border-blue-200 
          hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer
          ${compact ? 'p-4' : 'p-6'}
        `}
            >
                <div className="flex items-center gap-4">
                    {/* PDF Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FileText size={24} className="text-white" />
                    </div>

                    {/* Activity Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {recentActivity.filename}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                <Eye size={12} />
                                <span>{getActivityTypeText(recentActivity.activityType)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>{formatActivityTime(recentActivity.accessedAt)}</span>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700 transition-colors">
                        {!compact && (
                            <span className="text-sm font-semibold">Continue</span>
                        )}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Progress indicator (if we had reading progress) */}
                {!compact && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Last viewed</span>
                            <span className="font-medium">Click to continue reading</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}