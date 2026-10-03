import { createSignal, onMount, For, Show } from "solid-js";
import { OrderDetail, OrderSummary } from "../../../types/profile";
import { fetchOrdersApi, fetchOrderDetailApi, cancelOrderApi, initiateReturnApi } from "../../../api/orders";
import { authStore } from "../../auth/stores/authStore";

export function OrdersTab() {
  const [orders, setOrders] = createSignal<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [selectedStatus, setSelectedStatus] = createSignal("ALL");
  const [currentPage, setCurrentPage] = createSignal(0);
  const [totalPages, setTotalPages] = createSignal(1);

  // Detail Modal
  const [selectedOrderDetail, setSelectedOrderDetail] = createSignal<OrderDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = createSignal(false);

  // Cancel & Return Action Modals
  const [cancellingOrderId, setCancellingOrderId] = createSignal<string | null>(null);
  const [cancelReason, setCancelReason] = createSignal("");

  const [returningOrderId, setReturningOrderId] = createSignal<string | null>(null);
  const [returnReason, setReturnReason] = createSignal("");

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetchOrdersApi(
        {
          status: selectedStatus() !== "ALL" ? selectedStatus() : undefined,
          page: currentPage(),
          size: 6,
        },
        authStore.accessToken()
      );
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      authStore.showToast(`Failed to load orders: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(loadOrders);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0);
    loadOrders();
  };

  const openOrderDetail = async (orderId: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await fetchOrderDetailApi(orderId, authStore.accessToken());
      setSelectedOrderDetail(detail);
    } catch (err: any) {
      authStore.showToast(`Error fetching order: ${err.message}`);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleConfirmCancel = async () => {
    const id = cancellingOrderId();
    if (!id || !cancelReason()) return;
    try {
      await cancelOrderApi(id, cancelReason(), authStore.accessToken());
      authStore.showToast("Order has been cancelled");
      setCancellingOrderId(null);
      setCancelReason("");
      if (selectedOrderDetail()?.id === id) {
        await openOrderDetail(id);
      }
      await loadOrders();
    } catch (err: any) {
      authStore.showToast(`Cancel failed: ${err.message}`);
    }
  };

  const handleConfirmReturn = async () => {
    const id = returningOrderId();
    if (!id || !returnReason()) return;
    try {
      await initiateReturnApi(id, returnReason(), authStore.accessToken());
      authStore.showToast("Return request submitted for review");
      setReturningOrderId(null);
      setReturnReason("");
      if (selectedOrderDetail()?.id === id) {
        await openOrderDetail(id);
      }
      await loadOrders();
    } catch (err: any) {
      authStore.showToast(`Return failed: ${err.message}`);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "SHIPPED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "PROCESSING":
      case "CONFIRMED":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "RETURN_REQUESTED":
      case "RETURNED":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div class="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)]">My Orders</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-1">
          Track packages, view digital invoices, initiate returns, and review past purchases.
        </p>
      </div>

      {/* Filter Tabs */}
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["ALL", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
          <button
            type="button"
            onClick={() => handleStatusFilter(st)}
            class={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatus() === st
                ? "bg-[var(--brand-600)] text-white shadow-sm font-bold"
                : "bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
            }`}
          >
            {st === "ALL" ? "All Orders" : st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <Show
        when={!isLoading()}
        fallback={
          <div class="py-12 text-center text-xs text-[var(--text-secondary)]">Loading orders...</div>
        }
      >
        <Show
          when={orders().length > 0}
          fallback={
            <div class="py-16 text-center border border-dashed border-[var(--border)] rounded-3xl p-8 space-y-3">
              <span class="text-4xl">📦</span>
              <h3 class="text-sm font-bold text-[var(--text-primary)]">No orders found</h3>
              <p class="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                You have not placed any orders matching this status filter yet.
              </p>
              <a
                href="/"
                class="inline-block px-4 py-2 rounded-xl bg-[var(--brand-600)] text-white text-xs font-bold"
              >
                Browse Catalog
              </a>
            </div>
          }
        >
          <div class="space-y-4">
            <For each={orders()}>
              {(order) => (
                <div class="p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--brand-500)]/50 transition-all">
                  <div class="flex items-start gap-4 min-w-0">
                    <div class="w-16 h-16 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {order.firstItemImageUrl ? (
                        <img src={order.firstItemImageUrl} alt="Product" class="w-full h-full object-cover" />
                      ) : (
                        <span>🛍️</span>
                      )}
                    </div>
                    <div class="min-w-0 space-y-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-bold text-[var(--text-primary)]">#{order.orderNumber}</span>
                        <span class={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p class="text-xs font-medium text-[var(--text-primary)] truncate">
                        {order.firstItemTitle} {order.itemCount > 1 ? `+ ${order.itemCount - 1} more items` : ""}
                      </p>
                      <p class="text-[11px] text-[var(--text-secondary)]">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
                    <div class="text-left md:text-right">
                      <span class="text-xs text-[var(--text-secondary)] block">Total</span>
                      <span class="text-sm font-bold text-[var(--text-primary)]">
                        ₹{order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openOrderDetail(order.id)}
                        class="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border)]/60 border border-[var(--border)] text-xs font-bold transition-all"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>

          {/* Pagination */}
          <Show when={totalPages() > 1}>
            <div class="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={currentPage() === 0}
                onClick={() => {
                  setCurrentPage((p) => Math.max(0, p - 1));
                  loadOrders();
                }}
                class="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs disabled:opacity-30"
              >
                Previous
              </button>
              <span class="text-xs text-[var(--text-secondary)] font-semibold">
                Page {currentPage() + 1} of {totalPages()}
              </span>
              <button
                type="button"
                disabled={currentPage() >= totalPages() - 1}
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  loadOrders();
                }}
                class="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </Show>
        </Show>
      </Show>

      {/* Order Detail Modal with Timeline */}
      <Show when={selectedOrderDetail()}>
        {(() => {
          const detail = selectedOrderDetail()!;
          return (
            <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-base font-bold text-[var(--text-primary)]">
                        Order #{detail.orderNumber}
                      </h3>
                      <span class={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(detail.status)}`}>
                        {detail.status}
                      </span>
                    </div>
                    <p class="text-xs text-[var(--text-secondary)] mt-0.5">
                      Placed on {new Date(detail.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetail(null)}
                    class="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/50"
                  >
                    ✕
                  </button>
                </div>

                {/* Tracking Timeline */}
                <div class="p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] space-y-4">
                  <h4 class="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Fulfillment Progress
                  </h4>

                  {/* Step Progress Bar */}
                  <div class="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    {["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"].map((step, idx) => {
                      const stages = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
                      const currentIdx = stages.indexOf(detail.status);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div class="space-y-1.5">
                          <div
                            class={`h-1.5 rounded-full ${
                              isComplete ? "bg-emerald-500" : "bg-[var(--border)]"
                            }`}
                          ></div>
                          <span
                            class={
                              isCurrent
                                ? "text-[var(--brand-600)] font-bold"
                                : isComplete
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-[var(--text-secondary)]"
                            }
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <Show when={detail.trackingNumber}>
                    <div class="pt-2 text-xs flex items-center justify-between text-[var(--text-secondary)] border-t border-[var(--border)]/60">
                      <span>Carrier: <strong class="text-[var(--text-primary)]">{detail.trackingCarrier}</strong></span>
                      <span>Tracking: <strong class="text-[var(--text-primary)]">{detail.trackingNumber}</strong></span>
                    </div>
                  </Show>
                </div>

                {/* Items Breakdown */}
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Items in Order
                  </h4>
                  <div class="divide-y divide-[var(--border)]/60 border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-page)]">
                    <For each={detail.items}>
                      {(item) => (
                        <div class="p-3.5 flex items-center justify-between gap-4 text-xs">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {item.imageUrl ? <img src={item.imageUrl} alt="" class="w-full h-full object-cover" /> : <span>🛍️</span>}
                            </div>
                            <div>
                              <p class="font-bold text-[var(--text-primary)]">{item.productTitle}</p>
                              <p class="text-[11px] text-[var(--text-secondary)]">Qty: {item.quantity} × ₹{item.unitPrice.toFixed(2)}</p>
                            </div>
                          </div>
                          <span class="font-bold text-[var(--text-primary)]">₹{item.totalPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>

                {/* Financial Summary & Address */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div class="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] space-y-1">
                    <h5 class="font-bold text-[var(--text-secondary)] text-[11px] uppercase">Delivery Address</h5>
                    <p class="text-[var(--text-primary)] leading-relaxed pt-1">{detail.shippingAddress}</p>
                  </div>
                  <div class="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] space-y-1.5">
                    <div class="flex justify-between text-[var(--text-secondary)]">
                      <span>Subtotal:</span>
                      <span>₹{detail.subtotalAmount.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-[var(--text-secondary)]">
                      <span>Tax:</span>
                      <span>₹{detail.taxAmount.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-[var(--text-secondary)]">
                      <span>Shipping:</span>
                      <span>₹{detail.shippingAmount.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between font-bold text-sm text-[var(--text-primary)] pt-1 border-t border-[var(--border)]">
                      <span>Total:</span>
                      <span>₹{detail.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div class="flex items-center justify-between pt-2">
                  <div>
                    <Show when={detail.canCancel}>
                      <button
                        type="button"
                        onClick={() => {
                          setCancellingOrderId(detail.id);
                        }}
                        class="px-4 py-2 rounded-xl bg-rose-600/10 text-rose-600 hover:bg-rose-600/20 text-xs font-bold transition-all"
                      >
                        Cancel Order
                      </button>
                    </Show>
                    <Show when={detail.canReturn}>
                      <button
                        type="button"
                        onClick={() => {
                          setReturningOrderId(detail.id);
                        }}
                        class="px-4 py-2 rounded-xl bg-purple-600/10 text-purple-600 hover:bg-purple-600/20 text-xs font-bold transition-all"
                      >
                        Initiate Return / Refund
                      </button>
                    </Show>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetail(null)}
                    class="px-5 py-2 rounded-xl bg-[var(--brand-600)] text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Show>

      {/* Cancel Reason Modal */}
      <Show when={cancellingOrderId()}>
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 class="text-sm font-bold text-[var(--text-primary)]">Cancel Order</h3>
            <p class="text-xs text-[var(--text-secondary)]">
              Please let us know why you'd like to cancel this order:
            </p>
            <textarea
              rows={3}
              value={cancelReason()}
              onInput={(e) => setCancelReason(e.currentTarget.value)}
              placeholder="e.g., Ordered by mistake, found better price..."
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrderId(null)}
                class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={!cancelReason()}
                onClick={handleConfirmCancel}
                class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Return Reason Modal */}
      <Show when={returningOrderId()}>
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 class="text-sm font-bold text-[var(--text-primary)]">Initiate Return & Refund</h3>
            <p class="text-xs text-[var(--text-secondary)]">
              Specify the reason for returning your delivered items:
            </p>
            <textarea
              rows={3}
              value={returnReason()}
              onInput={(e) => setReturnReason(e.currentTarget.value)}
              placeholder="e.g., Item defective, incorrect size, damaged package..."
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReturningOrderId(null)}
                class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!returnReason()}
                onClick={handleConfirmReturn}
                class="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Submit Return Request
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
