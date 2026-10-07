import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { todayISO } from "@/lib/dates";
import { TransactionForm, TRANSACTION_FORM_ID } from "./transaction-form";

function renderForm(onSubmit = vi.fn()) {
  render(
    <>
      <TransactionForm onSubmit={onSubmit} />
      <button type="submit" form={TRANSACTION_FORM_ID}>
        Save
      </button>
    </>,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe("TransactionForm", () => {
  it("shows inline, accessible errors and does not submit invalid data", async () => {
    const { onSubmit, user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Save" }));

    const amount = screen.getByLabelText("Amount (₹)");
    expect(amount).toHaveAttribute("aria-invalid", "true");
    expect(amount).toHaveAccessibleDescription("Enter an amount");
    expect(screen.getByText("Description must be at least 2 characters")).toBeInTheDocument();
    expect(screen.getByText("Choose a category")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects malformed and future values", async () => {
    const { user } = renderForm();
    await user.type(screen.getByLabelText("Amount (₹)"), "12.345");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2999-01-01");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Enter a valid amount (up to 2 decimal places)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Date can't be in the future")).toBeInTheDocument();
  });

  it("submits a typed TransactionInput when valid", async () => {
    const { onSubmit, user } = renderForm();
    await user.click(screen.getByRole("radio", { name: "Income" }));
    await user.type(screen.getByLabelText("Amount (₹)"), "45,000");
    await user.type(screen.getByLabelText("Description"), "  Freelance project  ");
    await user.selectOptions(screen.getByLabelText("Category"), "freelance");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      type: "income",
      amount: 45000,
      description: "Freelance project",
      category: "freelance",
      date: todayISO(),
    });
  });

  it("only offers categories that match the selected type", async () => {
    const { user } = renderForm();
    const category = screen.getByLabelText("Category");
    expect(category).toHaveTextContent("Groceries");
    expect(category).not.toHaveTextContent("Salary");

    await user.click(screen.getByRole("radio", { name: "Income" }));
    expect(category).toHaveTextContent("Salary");
    expect(category).not.toHaveTextContent("Groceries");
  });
});
