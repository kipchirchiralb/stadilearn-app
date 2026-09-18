import type { Metadata } from "next";
import { VerifyCertificateForm } from "@/components/forms/VerifyCertificateForm";
import { Card, Eyebrow, Notice, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Verify a Stadilearn certificate",
  description: "Enter the verification code shown on a Stadilearn certificate to confirm it is genuine.",
};

type Props = { searchParams: Promise<{ code?: string }> };

export default async function VerifyCertificatePage({ searchParams }: Props) {
  const { code } = await searchParams;
  return (
    <Section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl py-space-lg">
        <div className="lg:col-span-5 space-y-space-md">
          <Eyebrow>Certificate verification</Eyebrow>
          <h1 className="font-display-hero text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
            Verify a Stadilearn certificate
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Employers, institutions and partners can confirm a certificate is genuine. Enter the verification code shown
            on the certificate.
          </p>
          <Notice icon="privacy_tip">
            <strong>What is shown publicly:</strong> certificate status, the learner&apos;s approved display name, course
            title, completion date, issuing programme and code. No contact details or grades are shown.
          </Notice>
        </div>
        <Card className="lg:col-span-7">
          <VerifyCertificateForm initialCode={code} />
        </Card>
      </div>
    </Section>
  );
}
