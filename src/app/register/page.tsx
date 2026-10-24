import { AuthForm } from "@/app/auth/components/AuthForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm mode="register" next={params.next ?? "/profile"} />;
}