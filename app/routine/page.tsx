import { redirect } from "next/navigation";

export default function RoutinePage() {
  redirect("/today?view=program");
}
