import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { Dialog } from "./dialog";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit item"
        description="Make changes"
      >
        <input aria-label="First" />
        <button type="button">Last</button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("is labelled, focuses its first field, traps Tab and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Edit item" });
    expect(dialog).toHaveAccessibleDescription("Make changes");
    expect(screen.getByLabelText("First")).toHaveFocus();

    // Focus wraps from the last focusable element back to the first (close button).
    await user.click(screen.getByRole("button", { name: "Last" }));
    await user.tab();
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();

    // Escape fires the native `cancel` event (simulated here for jsdom).
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    await screen.findByRole("button", { name: "Open" });
    expect(screen.queryByLabelText("First")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
