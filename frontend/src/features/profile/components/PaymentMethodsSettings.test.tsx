import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, waitFor } from "@solidjs/testing-library";
import { PaymentMethodsSettings } from "./PaymentMethodsSettings";
import * as paymentApi from "../../../api/paymentMethods";
import { authStore } from "../../auth/stores/authStore";

describe("PaymentMethodsSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStore, "accessToken").mockReturnValue("mock-token");
    vi.spyOn(paymentApi, "fetchPaymentMethodsApi").mockResolvedValue([]);
  });

  it("renders payment methods header and empty state initially", async () => {
    const { getByText } = render(() => <PaymentMethodsSettings />);

    expect(getByText("Payment Methods")).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText("No payment methods saved yet")).toBeInTheDocument();
    });
  });

  it("opens add UPI form and validates format", async () => {
    const { getByText, getByPlaceholderText, getByRole } = render(() => <PaymentMethodsSettings />);

    const addBtn = getByRole("button", { name: /\+ Add UPI ID/i });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(getByText("Add New UPI ID")).toBeInTheDocument();

    const input = getByPlaceholderText("username@okhdfcbank") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "invalid-vpa" } });

    // Verify button should be disabled for invalid regex format
    const verifyBtn = getByText("Verify UPI ID") as HTMLButtonElement;
    expect(verifyBtn.disabled).toBe(true);

    // Enter valid format
    fireEvent.input(input, { target: { value: "rahul@okhdfcbank" } });
    expect(verifyBtn.disabled).toBe(false);
  });

  it("verifies VPA and displays resolved account holder name", async () => {
    vi.spyOn(paymentApi, "validateVpaApi").mockResolvedValue({
      vpa: "rahul@okhdfcbank",
      isValid: true,
      accountHolderName: "Rahul Sharma",
      bankName: "HDFC Bank",
      gatewayReferenceId: "tok_123",
    });

    const { getByText, getByPlaceholderText, getByRole } = render(() => <PaymentMethodsSettings />);

    const addBtn = getByRole("button", { name: /\+ Add UPI ID/i });
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);

    const input = getByPlaceholderText("username@okhdfcbank");
    fireEvent.input(input, { target: { value: "rahul@okhdfcbank" } });

    fireEvent.click(getByText("Verify UPI ID"));

    await waitFor(() => {
      expect(getByText("Rahul Sharma")).toBeInTheDocument();
      expect(getByText("HDFC Bank")).toBeInTheDocument();
      expect(getByText("Confirm & Save UPI ID")).toBeInTheDocument();
    });
  });

  it("renders saved methods with masked VPA and default badge", async () => {
    vi.spyOn(paymentApi, "fetchPaymentMethodsApi").mockResolvedValue([
      {
        id: "pm-1",
        type: "UPI",
        vpa: "rahul@okhdfcbank",
        maskedVpa: "rah***@okhdfcbank",
        accountHolderName: "Rahul Sharma",
        bankName: "HDFC Bank",
        isVerified: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const { getByText } = render(() => <PaymentMethodsSettings />);

    await waitFor(() => {
      expect(getByText("rah***@okhdfcbank")).toBeInTheDocument();
      expect(getByText("Rahul Sharma • HDFC Bank")).toBeInTheDocument();
      expect(getByText("Default")).toBeInTheDocument();
      expect(getByText("✓ Verified")).toBeInTheDocument();
    });
  });
});
