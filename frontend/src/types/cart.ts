export interface CartItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
  createdAt: string;
}

export interface CartSummary {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
}
