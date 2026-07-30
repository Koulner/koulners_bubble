import React, { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudioDashboard from "@/components/StudioDashboard";

export const metadata = {
  title: "Bubble Studio | Enterprise CMS & GitOps",
  description: "Geschütztes Headless-CMS Dashboard für Koulners Bubbles",
};

export default async function StudioPage() {
  const session = await auth();

  // Sicherheits-Check auf Serverebene (zusätzlich zur Middleware)
  if (!session?.user) {
    redirect("/studio/login");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050B08]" />}>
      <StudioDashboard user={session.user} />
    </Suspense>
  );
}
