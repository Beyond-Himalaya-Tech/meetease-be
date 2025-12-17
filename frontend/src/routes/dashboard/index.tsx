import { createFileRoute } from "@tanstack/react-router";
import DashboardOverview from "../../components/dashboard/DashboardOverview";
import PageHeader from "../../components/layout/PageHeader";
import DefaultLayout from "../../layouts/DefaultLayout";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <DefaultLayout>
      <section className="max-w-6xl mx-auto w-full py-4 sm:py-6 px-4 sm:px-0">
        <PageHeader
          title="Dashboard"
          subtitle="Overview of your meetings, bookings, and activity."
        />
        <DashboardOverview />
      </section>
    </DefaultLayout>
  );
}


