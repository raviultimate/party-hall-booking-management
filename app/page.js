import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // If user is not logged in, redirect to login page
  if (!session) {
    redirect("/auth/signin");
  }
  
  // If user is logged in, redirect to dashboard
  redirect("/dashboard");
}
