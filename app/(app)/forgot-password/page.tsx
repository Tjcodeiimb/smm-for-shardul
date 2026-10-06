import Link from "next/link";
import Logo from "@/app/components/Logo";
import { Icon } from "@/app/components/Icons";

// No email-sending infrastructure exists yet, so this is an honest
// placeholder rather than a flow that pretends to send a reset link.
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm rounded-[28px] bg-card p-8">
        <Logo size={40} />
        <div className="mt-6">
          <span className="grid place-items-center h-12 w-12 rounded-full bg-accent text-accent-deep mb-4">
            <Icon name="mail" />
          </span>
          <h1 className="font-heading text-2xl">Password reset isn&apos;t available yet</h1>
          <p className="text-sm text-muted mt-2">
            This deployment doesn&apos;t have email sending set up yet, so self-serve password reset isn&apos;t live.
            If you&apos;re locked out, whoever manages this deployment can reset your password directly in the
            database.
          </p>
          <Link href="/login" className="mt-6 block rounded-full bg-accent text-accent-deep py-2.5 text-center text-sm font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
