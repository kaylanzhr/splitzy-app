import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/app")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Your groups · Splitzy" },
      { name: "description", content: "Track shared expenses and settle up with your crew." },
    ],
  }),
});
