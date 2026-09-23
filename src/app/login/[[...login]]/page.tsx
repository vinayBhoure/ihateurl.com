import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-950 p-4">
      <SignIn path="/login" />
    </div>
  );
}
