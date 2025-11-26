export interface MarketplaceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

export interface OrderItem {
  item_id: number;
  quantity: number;
}

export interface OrderRequest {
  user_id: number; // added user identifier
  items: OrderItem[];
  shipping_address: string;
  payment_method: 'cash' | 'transfer';
}

export interface OrderResponse {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
}

export interface ItemRequest {
  user_id: number; // added user identifier
  item_name: string;
  description: string;
}

export interface ItemRequestResponse {
  id: number;
  status: string;
  item_name: string;
}
