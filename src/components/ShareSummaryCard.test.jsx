/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareSummaryCard from "./ShareSummaryCard.jsx";
import * as htmlToImage from "html-to-image";

vi.mock("html-to-image", () => ({
  toPng: vi.fn(() => Promise.resolve("data:image/png;base64,abc")),
  toBlob: vi.fn(() => Promise.resolve(new Blob(["x"], { type: "image/png" }))),
}));

afterEach(() => cleanup());

describe("ShareSummaryCard", () => {
  it("download uses html-to-image PNG export", async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(
      <ShareSummaryCard
        title="Learner"
        headline="Done"
        scoreLabel="5/8"
        sublabel="path"
        badges={["Badge A"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /download png/i }));

    expect(htmlToImage.toPng).toHaveBeenCalled();

    clickSpy.mockRestore();
  });
});
