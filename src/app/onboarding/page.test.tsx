import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import OnboardingPage from "./page";
import { SlugStep } from "@/components/onboarding/SlugStep";

const { wallet, me, getBySlug } = vi.hoisted(() => ({
  wallet: {
    isConnected: true,
    jwt: "session" as string | null,
    error: null,
    isSigningIn: false,
    retrySignIn: vi.fn(),
  },
  me: vi.fn(),
  getBySlug: vi.fn(),
}));

vi.mock("@/contexts/WalletContext", () => ({ useWallet: () => wallet }));
vi.mock("@/lib/api", () => ({ authApi: { me }, creatorApi: { getBySlug } }));
vi.mock("@/components/ThemeToggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/components/WalletConnectButton", () => ({ WalletConnectButton: () => null }));
vi.mock("@/components/onboarding/SlugStep", () => ({
  SlugStep: vi.fn(() => <div>Slug step</div>),
}));
vi.mock("@/components/onboarding/SplitsStep", () => ({
  SplitsStep: () => <div>Splits step</div>,
}));
vi.mock("@/components/onboarding/ShareStep", () => ({
  ShareStep: () => <div>Share step</div>,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function session(slug: string) {
  return { user: { sub: "creator-1", wallet: "wallet-address", slug } };
}

beforeEach(() => {
  vi.resetAllMocks();
  wallet.jwt = "session";
  vi.mocked(SlugStep).mockImplementation(() => <div>Slug step</div>);
});

afterEach(cleanup);

describe("OnboardingPage resume check", () => {
  it("does not mount step one while the check is pending, then starts a new creator there", async () => {
    const pending = deferred<ReturnType<typeof session>>();
    me.mockReturnValue(pending.promise);

    render(<OnboardingPage />);

    expect(screen.getByText(/Checking your progress/)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Onboarding steps" })).not.toBeInTheDocument();
    // A DOM query alone would miss a step that mounted before the effect ran.
    expect(SlugStep).not.toHaveBeenCalled();

    await act(async () => { pending.resolve(session("user_1234abcd")); });

    expect(screen.getByText("Slug step")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Onboarding steps" })).toBeInTheDocument();
    expect(getBySlug).not.toHaveBeenCalled();
  });

  it("keeps step one unmounted when a session becomes available after the initial render", async () => {
    const pending = deferred<ReturnType<typeof session>>();
    me.mockReturnValue(pending.promise);
    wallet.jwt = null;
    const { rerender } = render(<OnboardingPage />);

    wallet.jwt = "session";
    rerender(<OnboardingPage />);

    expect(screen.getByText(/Checking your progress/)).toBeInTheDocument();
    expect(SlugStep).not.toHaveBeenCalled();

    await act(async () => { pending.resolve(session("user_1234abcd")); });
    expect(screen.getByText("Slug step")).toBeInTheDocument();
  });

  it.each([
    { splits: [], expected: "Splits step" },
    { splits: [{ to: "recipient", bps: 10_000 }], expected: "Share step" },
  ])("waits for the creator profile before resuming at $expected", async ({ splits, expected }) => {
    const pending = deferred<{ creator: { splits: typeof splits } }>();
    me.mockResolvedValue(session("alice"));
    getBySlug.mockReturnValue(pending.promise);

    render(<OnboardingPage />);
    await waitFor(() => expect(getBySlug).toHaveBeenCalledWith("alice"));

    expect(screen.getByText(/Checking your progress/)).toBeInTheDocument();
    expect(SlugStep).not.toHaveBeenCalled();
    expect(screen.queryByText("Splits step")).not.toBeInTheDocument();
    expect(screen.queryByText("Share step")).not.toBeInTheDocument();

    await act(async () => { pending.resolve({ creator: { splits } }); });

    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(SlugStep).not.toHaveBeenCalled();
    expect(screen.queryByText(/Checking your progress/)).not.toBeInTheDocument();
  });
});
