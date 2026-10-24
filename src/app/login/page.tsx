import { AuthForm } from "@/app/auth/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm mode="login" next={params.next ?? "/profile"} />;
}