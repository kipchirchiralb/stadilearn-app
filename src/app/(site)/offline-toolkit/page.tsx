import type { Metadata } from "next";
import { CheckList, FeatureGrid, Notice, PageHero, Section, SectionHeader } from "@/components/ui";
import { MOODLE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Offline & Low-Data Toolkit",
  description: "How to study with limited connectivity: downloadable PDFs, low-data settings and what still needs a connection.",
};

export default function OfflineToolkitPage() {
  return (
    <>
      <PageHero
        eyebrow="Offline & low-data toolkit"
        highlight="on limited data."
        intro="Stadilearn is built for real connectivity conditions. Here is how to keep learning when data is expensive or the network drops."
        primary={{ href: MOODLE_URL, label: "Open learning space", external: true }}
        secondary={{ href: "/help", label: "Get help" }}
        title="Keep learning"
      />
      <Section tone="low">
        <SectionHeader eyebrow="What works offline" title="Prepare while you are connected" />
        <FeatureGrid
          items={[
            { icon: "picture_as_pdf", title: "Download lesson PDFs", body: "Most lessons include a PDF. Download them on Wi-Fi and read anywhere." },
            { icon: "cached", title: "Recently viewed pages", body: "Your browser can keep recently opened Stadilearn pages available for reading when the connection drops." },
            { icon: "data_saver_on", title: "Low-data media", body: "Choose lower video quality or audio and transcripts where they are offered." },
          ]}
        />
      </Section>
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter lg:gap-space-xl">
          <div>
            <SectionHeader align="left" eyebrow="Tips" title="Save data every day" />
            <CheckList
              items={[
                { title: "Turn on your phone's data saver", body: "Stops background apps using data while you study." },
                { title: "Batch your online tasks", body: "Take quizzes and submit work in one connected session." },
                { title: "Use a lightweight browser", body: "Keep one tab open and close others to reduce data use." },
              ]}
            />
          </div>
          <div>
            <SectionHeader align="left" eyebrow="What needs a connection" title="Be ready for these" />
            <CheckList
              items={[
                { title: "Quizzes and assignments", body: "Submitted and saved in Moodle only while online." },
                { title: "AI tutor and support assistant", body: "Need a connection to respond." },
                { title: "Progress and certificate updates", body: "Appear after Moodle activity has synchronised." },
              ]}
            />
          </div>
        </div>
        <div className="mt-space-lg">
          <Notice icon="wifi_off" tone="warning">
            Offline support is download-based. Assessment answers are not saved offline and synced later, so submit
            quizzes and assignments while you are connected.
          </Notice>
        </div>
      </Section>
    </>
  );
}
