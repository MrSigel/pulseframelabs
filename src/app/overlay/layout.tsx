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
    <div className="min-h-screen bg-transparent">
      {children}
    </div>
  );
}
