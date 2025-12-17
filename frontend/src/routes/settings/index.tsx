import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "../../components/layout/PageHeader";
import SettingsSections from "../../components/settings/SettingsSections";
import DefaultLayout from "../../layouts/DefaultLayout";
import { requireAuth } from "../../auth/requireAuth";

export const Route = createFileRoute("/settings/")({
  beforeLoad: requireAuth,
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <DefaultLayout>
      <section className="max-w-6xl mx-auto w-full py-4 sm:py-6 px-4 sm:px-0">
        <PageHeader
          title="Settings"
          subtitle="Configure your MeetEase account and workspace."
        />
        <SettingsSections />
      </section>
    </DefaultLayout>
  );
}


