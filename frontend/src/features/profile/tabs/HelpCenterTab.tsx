import { createSignal, onMount, For, Show } from "solid-js";
import { SupportFaq, SupportTicket, SupportTicketDetail } from "../../../types/profile";
import { fetchFaqsApi, createTicketApi, fetchUserTicketsApi, fetchTicketDetailApi, addTicketReplyApi } from "../../../api/support";
import { authStore } from "../../auth/stores/authStore";

export function HelpCenterTab() {
  const [faqs, setFaqs] = createSignal<SupportFaq[]>([]);
  const [tickets, setTickets] = createSignal<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [activeTab, setActiveTab] = createSignal<"faqs" | "tickets" | "new_ticket">("faqs");

  // Search query & category filter for FAQs
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal("ALL");
  const [expandedFaqId, setExpandedFaqId] = createSignal<string | null>(null);

  // New ticket form
  const [ticketCategory, setTicketCategory] = createSignal("Orders & Shipping");
  const [ticketSubject, setTicketSubject] = createSignal("");
  const [ticketMessage, setTicketMessage] = createSignal("");
  const [ticketOrderId, setTicketOrderId] = createSignal("");
  const [isSubmittingTicket, setIsSubmittingTicket] = createSignal(false);

  // Ticket Detail View
  const [selectedTicket, setSelectedTicket] = createSignal<SupportTicketDetail | null>(null);
  const [replyMessage, setReplyMessage] = createSignal("");
  const [isReplying, setIsReplying] = createSignal(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [faqData, ticketData] = await Promise.all([
        fetchFaqsApi(),
        fetchUserTicketsApi(authStore.accessToken()),
      ]);
      setFaqs(faqData);
      setTickets(ticketData);
    } catch (err: any) {
      console.error("Failed to load help center data", err);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(loadData);

  const categories = () => ["ALL", ...Array.from(new Set(faqs().map((f) => f.category)))];

  const filteredFaqs = () => {
    const query = searchQuery().toLowerCase().trim();
    const cat = selectedCategory();

    return faqs().filter((faq) => {
      const matchCat = cat === "ALL" || faq.category === cat;
      const matchQuery =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  };

  const handleCreateTicket = async (e: Event) => {
    e.preventDefault();
    if (!ticketSubject() || !ticketMessage()) return;
    setIsSubmittingTicket(true);
    try {
      const ticket = await createTicketApi(
        {
          category: ticketCategory(),
          subject: ticketSubject(),
          message: ticketMessage(),
          orderId: ticketOrderId() || undefined,
        },
        authStore.accessToken()
      );
      authStore.showToast(`Support Ticket #${ticket.ticketNumber} created!`);
      setTicketSubject("");
      setTicketMessage("");
      setTicketOrderId("");
      setActiveTab("tickets");
      await loadData();
    } catch (err: any) {
      authStore.showToast(`Ticket failed: ${err.message}`);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const openTicketDetail = async (ticketId: string) => {
    try {
      const detail = await fetchTicketDetailApi(ticketId, authStore.accessToken());
      setSelectedTicket(detail);
    } catch (err: any) {
      authStore.showToast(`Failed to load ticket: ${err.message}`);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket() || !replyMessage()) return;
    setIsReplying(true);
    try {
      await addTicketReplyApi(selectedTicket()!.id, replyMessage(), undefined, authStore.accessToken());
      setReplyMessage("");
      await openTicketDetail(selectedTicket()!.id);
      authStore.showToast("Reply sent!");
    } catch (err: any) {
      authStore.showToast(err.message);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div class="space-y-6 animate-in fade-in duration-200">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)]">Help & Support</h1>
          <p class="text-xs text-[var(--text-secondary)] mt-1">
            Search knowledge base articles, contact customer service, or track existing support tickets.
          </p>
        </div>

        {/* Action Toggle */}
        <div class="flex items-center gap-2 bg-[var(--bg-page)] p-1 rounded-2xl border border-[var(--border)]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("faqs");
              setSelectedTicket(null);
            }}
            class={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab() === "faqs"
                ? "bg-[var(--brand-600)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            FAQs
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("tickets");
              setSelectedTicket(null);
            }}
            class={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab() === "tickets"
                ? "bg-[var(--brand-600)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            My Tickets ({tickets().length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("new_ticket");
              setSelectedTicket(null);
            }}
            class={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab() === "new_ticket"
                ? "bg-[var(--brand-600)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            + New Ticket
          </button>
        </div>
      </div>

      {/* FAQs Section */}
      <Show when={activeTab() === "faqs"}>
        <div class="space-y-4">
          {/* Search bar */}
          <div class="relative">
            <input
              type="text"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              placeholder="Search help topics (e.g. returns, tracking, 2FA)..."
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-2xl py-3 pl-10 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
            <span class="absolute left-3.5 top-3.5 text-[var(--text-secondary)]">🔍</span>
          </div>

          {/* Category Chips */}
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <For each={categories()}>
              {(cat) => (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  class={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                    selectedCategory() === cat
                      ? "bg-[var(--text-primary)] text-[var(--bg-page)]"
                      : "bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border)]"
                  }`}
                >
                  {cat === "ALL" ? "All Questions" : cat}
                </button>
              )}
            </For>
          </div>

          {/* Accordion FAQ list */}
          <div class="space-y-3 pt-2">
            <For each={filteredFaqs()}>
              {(faq) => {
                const isOpen = () => expandedFaqId() === faq.id;
                return (
                  <div class="rounded-2xl border border-[var(--border)] bg-[var(--bg-page)] overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isOpen() ? null : faq.id)}
                      class="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[var(--border)]/20 transition-colors"
                    >
                      <span class="text-xs font-bold text-[var(--text-primary)]">{faq.question}</span>
                      <span class="text-xs text-[var(--text-secondary)] transform transition-transform duration-200">
                        {isOpen() ? "▲" : "▼"}
                      </span>
                    </button>
                    <Show when={isOpen()}>
                      <div class="p-4 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)]/40 bg-[var(--bg-surface)]/40 animate-in fade-in">
                        {faq.answer}
                      </div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </Show>

      {/* Tickets List */}
      <Show when={activeTab() === "tickets" && !selectedTicket()}>
        <div class="space-y-4">
          <Show
            when={tickets().length > 0}
            fallback={
              <div class="py-16 text-center border border-dashed border-[var(--border)] rounded-3xl p-8 space-y-3">
                <span class="text-4xl">💬</span>
                <h3 class="text-sm font-bold text-[var(--text-primary)]">No support tickets</h3>
                <p class="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Have a question or issue with an order? Open a ticket and our support team will assist you.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("new_ticket")}
                  class="px-4 py-2 rounded-xl bg-[var(--brand-600)] text-white text-xs font-bold"
                >
                  Create Support Ticket
                </button>
              </div>
            }
          >
            <div class="space-y-3">
              <For each={tickets()}>
                {(t) => (
                  <div
                    onClick={() => openTicketDetail(t.id)}
                    class="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] hover:border-[var(--brand-500)]/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-[11px] font-bold text-[var(--brand-600)]">{t.ticketNumber}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {t.category}
                        </span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {t.status}
                        </span>
                      </div>
                      <h4 class="text-xs font-bold text-[var(--text-primary)]">{t.subject}</h4>
                      <span class="text-[10px] text-[var(--text-secondary)] block">
                        Opened on {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span class="text-xs font-bold text-[var(--brand-600)]">View & Reply →</span>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>

      {/* Ticket Detail Thread */}
      <Show when={selectedTicket()}>
        {(() => {
          const t = selectedTicket()!;
          return (
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  class="text-xs font-bold text-[var(--brand-600)] hover:underline"
                >
                  ← Back to Tickets
                </button>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-bold">{t.ticketNumber}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    {t.status}
                  </span>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] space-y-1">
                <h3 class="text-sm font-bold text-[var(--text-primary)]">{t.subject}</h3>
                <p class="text-xs text-[var(--text-secondary)]">Category: {t.category}</p>
              </div>

              {/* Thread Messages */}
              <div class="space-y-3">
                <For each={t.messages}>
                  {(msg) => (
                    <div
                      class={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 max-w-lg ${
                        msg.senderType === "CUSTOMER"
                          ? "ml-auto bg-[var(--brand-600)] text-white border-[var(--brand-700)]"
                          : "mr-auto bg-[var(--bg-page)] text-[var(--text-primary)] border-[var(--border)]"
                      }`}
                    >
                      <div class="flex justify-between items-center gap-4 text-[10px] opacity-75">
                        <span class="font-bold">{msg.senderType === "CUSTOMER" ? "You" : "Support Agent"}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p>{msg.message}</p>
                    </div>
                  )}
                </For>
              </div>

              {/* Reply Box */}
              <div class="flex gap-2">
                <input
                  type="text"
                  value={replyMessage()}
                  onInput={(e) => setReplyMessage(e.currentTarget.value)}
                  placeholder="Type your reply to customer support..."
                  class="flex-1 bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                />
                <button
                  type="button"
                  disabled={!replyMessage() || isReplying()}
                  onClick={handleSendReply}
                  class="px-5 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold disabled:opacity-40"
                >
                  {isReplying() ? "Sending..." : "Reply"}
                </button>
              </div>
            </div>
          );
        })()}
      </Show>

      {/* New Ticket Form */}
      <Show when={activeTab() === "new_ticket"}>
        <form onSubmit={handleCreateTicket} class="space-y-4 max-w-xl">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Issue Category *</label>
              <select
                value={ticketCategory()}
                onChange={(e) => setTicketCategory(e.currentTarget.value)}
                class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
              >
                <option value="Orders & Shipping">Orders & Shipping</option>
                <option value="Returns & Refunds">Returns & Refunds</option>
                <option value="Payments & Pricing">Payments & Pricing</option>
                <option value="Account & Security">Account & Security</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Order Reference (Optional)</label>
              <input
                type="text"
                value={ticketOrderId()}
                onInput={(e) => setTicketOrderId(e.currentTarget.value)}
                placeholder="Paste Order UUID if applicable"
                class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Subject *</label>
            <input
              type="text"
              value={ticketSubject()}
              onInput={(e) => setTicketSubject(e.currentTarget.value)}
              placeholder="Brief summary of your question or issue"
              required
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">Detailed Message *</label>
            <textarea
              rows={4}
              value={ticketMessage()}
              onInput={(e) => setTicketMessage(e.currentTarget.value)}
              placeholder="Describe your issue with as much detail as possible..."
              required
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-3.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("faqs")}
              class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingTicket()}
              class="px-6 py-2 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold disabled:opacity-50"
            >
              {isSubmittingTicket() ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </Show>
    </div>
  );
}
