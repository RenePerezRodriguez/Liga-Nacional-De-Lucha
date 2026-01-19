export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            {/* 
        This is a simplified wrapper. 
        The Dashboard Layout with Sidebar will be implemented inside /admin/page.tsx or a sub-layout
        to separate the Login page from the rest of the Admin flow if needed.
        
        However, since Next.js Layouts nest, we might want this layout to be for the *authenticated* part.
        If /admin/login is inside /admin, it will inherit this layout.
        We should probably group the authenticated routes in a route group (e.g. (dashboard)) later.
        
        For now, we render children directly to support both login and dashboard.
      */}
            {children}
        </div>
    );
}
