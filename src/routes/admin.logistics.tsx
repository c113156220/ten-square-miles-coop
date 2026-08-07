import { createFileRoute } from "@tanstack/react-router";
import { AdminLogisticsManager } from "@/components/AdminLogisticsManager";

export const Route = createFileRoute("/admin/logistics")({
  component: AdminLogisticsPage,
});

function AdminLogisticsPage() {
  return (
    <div className="space-y-6">
      <AdminLogisticsManager />
    </div>
  );
}