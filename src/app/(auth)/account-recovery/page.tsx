import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = { title: "Account recovery", robots: { index: false } };

export default function AccountRecoveryPage() {
  return (
    <div className="space-y-space-md">
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface">Account recovery</h1>
        <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
          Stadilearn signs you in with a code sent to your email. If you still have access to your email, just{" "}
          <Link className="text-primary underline" href="/login">
            sign in
          </Link>
          . If you have lost access, tell us below and our team will verify your identity before updating your account.
        </p>
      </div>
      <ContactForm
        initialMessage="I have lost access to the email address on my Stadilearn account. My old email was: "
        initialType="support"
      />
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Forgot your Moodle password? Use “Forgotten password” on the Moodle login page — it is a separate account.
      </p>
    </div>
  );
}
