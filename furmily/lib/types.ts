export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  delivery_estimate?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  variant?: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type OrderFormData = {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: {
    product_name: string;
    variant?: string;
    quantity: number;
    price: number;
  }[];
  notes?: string;
};