/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import BadgeCard from "./BadgeCard.jsx";

afterEach(() => cleanup());

describe("BadgeCard", () => {
  it("renders badge metadata when id exists", () => {
    render(<BadgeCard badgeId="election_ready" unlockedAt={new Date(0).toISOString()} />);
    expect(screen.getByRole("article", { name: /Election Ready/i })).toBeInTheDocument();
  });

  it("renders nothing for unknown badge", () => {
    const { container } = render(<BadgeCard badgeId="nope" />);
    expect(container.firstChild).toBeNull();
  });
});
