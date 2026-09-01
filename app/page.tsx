import { redirect } from "next/navigation";

export default function Home() {
  // redirect ไป login เป็น default
  redirect("/login");
}
