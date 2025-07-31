import { DashboardSidebar } from '@/components/dashboard-sidebar'

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
            </div>
    )
}