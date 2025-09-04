import { AutoSaveStatusProvider } from '@/components/dashboard/AutoSaveStatusProvider'

export default function NotesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AutoSaveStatusProvider>
            {children}
        </AutoSaveStatusProvider>
    )
}
