import Link from "next/link";
import Logo from "@/app/components/Logo";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm rounded-[28px] bg-card p-8">
        <div className="flex items-center gap-3 mb-1">
          <Logo size={40} />
        </div>
        <p className="text-sm text-muted mb-6">Create your account</p>

        <SignupForm />

        <p className="text-xs text-muted mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-medium underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
