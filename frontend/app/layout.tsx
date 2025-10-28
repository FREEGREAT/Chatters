import "@/styles/globals.css";
import { Metadata } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import { RoomHeader } from "./components/RoomHeader";

export const metadata: Metadata = {
  title: "Chatters - Real-time Chat Application",
  description: "A modern real-time chat application",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "h-screen overflow-hidden text-foreground font-sans antialiased bg-gradient-to-br from-violet-900 via-slate-950 to-slate-900",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-full">
            <header className="w-full py-4 px-6 flex items-center justify-between bg-content1/50 backdrop-blur-lg border-b border-content1/10">
              <div className="flex items-center gap-4">
                <h1 className="font-bold text-xl bg-gradient-to-br from-secondary to-primary bg-clip-text text-transparent">
                  Chatters
                </h1>
                <RoomHeader />
              </div>
              <Link
                isExternal
                className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                href="https://github.com/FREEGREAT"
                title="View on GitHub"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </Link>
            </header>
            <main className="flex-1 h-full">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
