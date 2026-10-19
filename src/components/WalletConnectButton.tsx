"use client";

/**
 * WalletConnectButton.tsx
 *
 * Shows connect / disconnect state and triggers the Freighter SIWS flow.
 * Used in the Header and optionally on the tip page when a wallet is required.
 */

import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/Button";
import { shortenAddress } from "@novatip/sdk";

interface WalletConnectButtonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function WalletConnectButton({ size = "md", className }: WalletConnectButtonProps) {
  const { publicKey, isConnected, isConnecting, error, connect, disconnect } = useWallet();

  if (isConnected && publicKey) {
    return (
      <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
        <span className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-slow" />
          {shortenAddress(publicKey)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          onClick={disconnect}
          aria-label="Disconnect wallet"
        >
          <svg className="h-4 w-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 5H5v14h4M14 8l4 4-4 4M9 12h9" />
          </svg>
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="primary"
        size={size}
        loading={isConnecting}
        className={className}
        onClick={connect}
        aria-label="Connect Freighter wallet"
      >
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </Button>
      {error && (
        <p className="text-xs text-danger max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
