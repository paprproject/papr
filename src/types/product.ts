export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  starting_price: number;
  delivery_days: string;
  created_at: string;
  image_url?: string | null;
  rating?: number | null;
  review_count?: number | null;
  order_count?: number | null;
  badge?: string | null;
};
