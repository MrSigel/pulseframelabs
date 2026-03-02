import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overlay",
};

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Override body background for OBS Browser Source transparency */}
      <style>{`html, body { background: transparent !important; }`}</style>
      <div className="min-h-screen bg-transparent">
        {children}
      </div>
    </>
  );
}
