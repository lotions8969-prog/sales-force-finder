import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AssessmentClient from "./AssessmentClient";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { sessionId } = await params;
  return <AssessmentClient sessionId={sessionId} />;
}
