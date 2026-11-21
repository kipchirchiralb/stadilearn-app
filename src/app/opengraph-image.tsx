import { ImageResponse } from "next/og";

export const alt = "Stadilearn — practical digital and AI learning in Kenya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#004d61",
          color: "#ffffff",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 18, height: 18, borderRadius: 99, backgroundColor: "#fd6604" }} />
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Stadilearn</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 920 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5 }}>
            Practical digital and AI learning in Kenya
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: "#b9eaff" }}>
            Mobile-friendly courses, teacher training, and verifiable certificates.
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#99e1ff" }}>stadilearn.co.ke</div>
      </div>
    ),
    { ...size },
  );
}
