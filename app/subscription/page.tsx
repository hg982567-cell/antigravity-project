import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SubscriptionRedirectPage() {
  redirect("/app/billing");
}
