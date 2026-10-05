import { SupportFaq, SupportTicket, SupportTicketDetail, SupportTicketMessage } from "../types/profile";

const SUPPORT_API_URL =
  typeof window !== "undefined" && window.location?.origin && window.location.origin !== "null"
    ? (import.meta.env.VITE_SUPPORT_API_URL || `${window.location.origin}/api/v1/support`)
    : (import.meta.env.VITE_SUPPORT_API_URL || "http://localhost:8081/api/v1/support");

function getAuthHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchFaqsApi(category?: string): Promise<SupportFaq[]> {
  const url = category && category !== "ALL"
    ? `${SUPPORT_API_URL}/faqs?category=${encodeURIComponent(category)}`
    : `${SUPPORT_API_URL}/faqs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load FAQs");
  return await res.json();
}

export async function createTicketApi(
  payload: { category: string; subject: string; message: string; orderId?: string; attachmentUrl?: string },
  token?: string | null
): Promise<SupportTicket> {
  const res = await fetch(`${SUPPORT_API_URL}/tickets`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create support ticket");
  }
  return await res.json();
}

export async function fetchUserTicketsApi(token?: string | null): Promise<SupportTicket[]> {
  const res = await fetch(`${SUPPORT_API_URL}/tickets`, {
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return await res.json();
}

export async function fetchTicketDetailApi(id: string, token?: string | null): Promise<SupportTicketDetail> {
  const res = await fetch(`${SUPPORT_API_URL}/tickets/${id}`, {
    headers: getAuthHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch ticket details");
  return await res.json();
}

export async function addTicketReplyApi(
  ticketId: string,
  message: string,
  attachmentUrl?: string,
  token?: string | null
): Promise<SupportTicketMessage> {
  const res = await fetch(`${SUPPORT_API_URL}/tickets/${ticketId}/reply`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify({ message, attachmentUrl }),
  });
  if (!res.ok) throw new Error("Failed to post reply");
  return await res.json();
}
