import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Toaster } from 'react-hot-toast'
import { SidebarProvider } from '@/components/dashboard/SidebarProvider'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background">
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
                            className: '',
                            style: {
                                background: 'hsl(var(--card))',
                                color: 'hsl(var(--card-foreground))',
                                border: '1px solid hsl(var(--border))',
                            },
                            success: {
                                style: {
                                    background: 'hsl(var(--primary))',
                                    color: 'hsl(var(--primary-foreground))',
                                },
                            },
                            error: {
                                style: {
                                    background: 'hsl(var(--destructive))',
                                    color: 'hsl(var(--destructive-foreground))',
                                },
                            },
                        }}
                    />
                </div>
        </SidebarProvider>
    )
}