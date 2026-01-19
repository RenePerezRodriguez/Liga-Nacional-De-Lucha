import { redirect } from "next/navigation";

// Redirect /admin to /admin/lucha-libre by default
export default function AdminDashboard() {
    redirect("/admin/lucha-libre");
}
