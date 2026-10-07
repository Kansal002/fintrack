"use client";

import { PageHeader } from "@/components/layout/page-header";
import { DataSection } from "./data-section";
import { DeveloperSection } from "./developer-section";
import { PreferencesSection } from "./preferences-section";
import { ProfileSection } from "./profile-section";

export function SettingsView() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, preferences and demo data." />
      <div className="grid gap-4">
        <ProfileSection />
        <PreferencesSection />
        <DeveloperSection />
        <DataSection />
      </div>
    </>
  );
}
