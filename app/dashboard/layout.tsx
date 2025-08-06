import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (

        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto">

                <div className="p-6 lg:p-8 lg:pl-12">

                    {children}
                </div>
            </main>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        style: {
                            background: '#10b981',
                        },
                    },
                    error: {
                        style: {
                            background: '#ef4444',
                        },
                    },
                }}
            />
        </div>
    )
}