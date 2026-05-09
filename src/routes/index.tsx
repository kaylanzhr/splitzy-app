import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/Landing";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Splitzy — Split smarter, stay closer." },
      {
        name: "description",
        content:
          "The friendliest way for friends, trip groups, and flatmates to split bills and balance shared expenses. Now with n8n auto-summaries.",
      },
      { property: "og:title", content: "Splitzy — Split smarter, stay closer." },
      {
        property: "og:description",
        content:
          "Modern, warm, and fun split-bill app for your crew. Auto-send summaries via n8n.",
      },
    ],
  }),
});
