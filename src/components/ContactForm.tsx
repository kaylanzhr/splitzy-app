import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/public/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      setStatus("success");
      toast.success("Message sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    }
  }

  return (
    <section id="contact" className="container mx-auto px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            Get in touch
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Send us a note</h2>
          <p className="mt-3 text-muted-foreground">
            Questions, feedback, or feature ideas? Drop us a line.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-3xl bg-card border border-border p-6 md:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cf-name">Your name</Label>
              <Input
                id="cf-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                maxLength={100}
                disabled={status === "loading"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-email">Email</Label>
              <Input
                id="cf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
                disabled={status === "loading"}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cf-message">Message</Label>
            <Textarea
              id="cf-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              rows={5}
              maxLength={2000}
              disabled={status === "loading"}
              required
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={status === "loading"}
            className="w-full rounded-full h-12 text-base"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Sent!
              </>
            ) : (
              "Send message"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
