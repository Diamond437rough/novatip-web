"use client";

/**
 * Header.tsx
 *
 * Global top navigation bar.
 * Shows the Novatip logo, dashboard link (if connected), and wallet button.
 */

import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/contexts/WalletContext";
import { WalletConnectButton } from "./WalletConnectButton";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "./ui/Badge";
import { config } from "@/lib/config";

export function Header() {
  const { isConnected } = useWallet();
  const showNetworkBadge = config.stellar.network !== "mainnet";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
            aria-label="Novatip home"
          >
            {/* unoptimized: the optimizer refuses SVG unless dangerouslyAllowSVG
                is enabled, and this is our own asset, not user input. */}
            <Image
              src="/logo.svg"
              alt=""
              width={28}
              height={28}
              className="rounded-md"
              unoptimized
              priority
            />
            <span className="font-semibold text-fg group-hover:text-accent transition-colors">
              Novatip
            </span>
            {showNetworkBadge && (
              <Badge variant="warning" className="ml-2">
                {config.stellar.network}
              </Badge>
            )}
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-2 sm:gap-4">
            {isConnected && (
              <Link
                href="/dashboard"
                className="text-sm text-fg-subtle hover:text-fg transition-colors whitespace-nowrap"
              >
                Dashboard
              </Link>
            )}
            <ThemeToggle />
            <WalletConnectButton size="sm" />
          </nav>

        </div>
      </div>
    </header>
  );
}
