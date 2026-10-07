import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { api } from "@/lib/api";
import { createWrapper } from "@/test/utils";
import { LoginForm } from "./login-form";
import { signupSchema } from "./schemas";

describe("LoginForm", () => {
  it("validates fields inline before calling the API", async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows the server error for wrong credentials", async () => {
    await api.auth.signUp({ name: "Priya", email: "priya@example.com", password: "secret123" });
    await api.auth.logOut();

    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: createWrapper() });
    await user.type(screen.getByLabelText("Email"), "priya@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Incorrect email or password."),
    );
  });
});

describe("signupSchema", () => {
  const valid = {
    name: "Priya Patel",
    email: "priya@example.com",
    password: "secret123",
    confirmPassword: "secret123",
  };

  it("accepts valid input and normalises whitespace", () => {
    const result = signupSchema.safeParse({
      ...valid,
      name: "  Priya Patel ",
      email: " priya@example.com ",
    });
    expect(result.success && result.data).toMatchObject({
      name: "Priya Patel",
      email: "priya@example.com",
    });
  });

  it("enforces password strength and confirmation", () => {
    const issues = (values: Partial<typeof valid>) =>
      signupSchema
        .safeParse({ ...valid, ...values })
        .error?.issues.map((i) => `${i.path.join(".")}: ${i.message}`);

    expect(issues({ password: "short1", confirmPassword: "short1" })).toEqual([
      "password: Password must be at least 8 characters",
    ]);
    expect(issues({ password: "allletters", confirmPassword: "allletters" })).toEqual([
      "password: Include at least one number",
    ]);
    expect(issues({ confirmPassword: "different1" })).toEqual([
      "confirmPassword: Passwords don't match",
    ]);
  });
});
