import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: {
    default: "Nexus Business Suite",
    template: "%s · Nexus Business Suite",
  },
  description:
    "One place for CRM, HR and work management — built for growing companies that have outgrown spreadsheets.",
};

const themeInit = `
(function () {
  try {
    var stored = localStorage.getItem("nexus-theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
