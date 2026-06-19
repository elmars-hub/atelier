// ==========================================
// Database Types — mirrors Supabase schema
// Replace with `supabase gen types typescript` output
// once you have the Supabase CLI set up.
// ==========================================

// ---- Tables ----

export type AdminUser = {
  id: string;
  user_id: string;
  role: "super_admin" | "admin";
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  cta_description: string | null;
  care_guide: string | null;
  cover_image_url: string | null;
  brand: string | null;
  price: number;
  discount_price: number | null;
  is_featured: boolean;
  is_available: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  image_url: string | null;
  is_default: boolean;
  material: string | null;
  finish: string | null;
  stock_quantity: number;
  price_modifier: number;
  sku: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  variant_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductSpecification = {
  id: string;
  product_id: string;
  label: string;
  value: string;
  display_order: number;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
};

export type Wishlist = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  variant_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "payment_verified"
  | "preparing"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type ShippingAddress = {
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  order_number: string;
  tracking_id: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  stripe_payment_intent_id: string | null;
  courier: string | null;
  current_location: string | null;
  destination: string | null;
  estimated_delivery: string | null;
  shipping_address: ShippingAddress | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_image_url: string | null;
  color_name: string | null;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export type OrderTrackingEvent = {
  id: string;
  order_id: string;
  status: string;
  label: string;
  location: string | null;
  event_time: string;
  created_at: string;
};

export type Insert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Update<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// ==========================================
// Supabase Database type (used for typed client)
// Each table MUST include `Relationships` to satisfy
// GenericSchema in @supabase/supabase-js v2.108+.
//
// Insert types explicitly mark fields that have database
// defaults as optional (?:) so callers don't have to
// provide them.
// ==========================================

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser;
        Insert: {
          id?: string;
          user_id: string;
          role?: "super_admin" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "super_admin" | "admin";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          cover_image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          cover_image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          cta_description?: string | null;
          care_guide?: string | null;
          cover_image_url?: string | null;
          brand?: string | null;
          price: number;
          discount_price?: number | null;
          is_featured?: boolean;
          is_available?: boolean;
          average_rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          cta_description?: string | null;
          care_guide?: string | null;
          cover_image_url?: string | null;
          brand?: string | null;
          price?: number;
          discount_price?: number | null;
          is_featured?: boolean;
          is_available?: boolean;
          average_rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: {
          id?: string;
          product_id: string;
          color_name: string;
          color_hex: string;
          image_url?: string | null;
          is_default?: boolean;
          material?: string | null;
          finish?: string | null;
          stock_quantity?: number;
          price_modifier?: number;
          sku?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          color_name?: string;
          color_hex?: string;
          image_url?: string | null;
          is_default?: boolean;
          material?: string | null;
          finish?: string | null;
          stock_quantity?: number;
          price_modifier?: number;
          sku?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: ProductImage;
        Insert: {
          id?: string;
          variant_id: string;
          image_url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      product_specifications: {
        Row: ProductSpecification;
        Insert: {
          id?: string;
          product_id: string;
          label: string;
          value: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          label?: string;
          value?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: Review;
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          is_verified_purchase?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          is_verified_purchase?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: CartItem;
        Insert: {
          id?: string;
          user_id: string;
          variant_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          variant_id?: string;
          product_id?: string;
          quantity?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlists: {
        Row: Wishlist;
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlists_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number: string;
          tracking_id?: string | null;
          status?: OrderStatus;
          subtotal: number;
          shipping_cost?: number;
          tax?: number;
          total: number;
          stripe_payment_intent_id?: string | null;
          courier?: string | null;
          current_location?: string | null;
          destination?: string | null;
          estimated_delivery?: string | null;
          shipping_address?: ShippingAddress | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          tracking_id?: string | null;
          status?: OrderStatus;
          subtotal?: number;
          shipping_cost?: number;
          tax?: number;
          total?: number;
          stripe_payment_intent_id?: string | null;
          courier?: string | null;
          current_location?: string | null;
          destination?: string | null;
          estimated_delivery?: string | null;
          shipping_address?: ShippingAddress | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          product_image_url?: string | null;
          color_name?: string | null;
          quantity: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          product_image_url?: string | null;
          color_name?: string | null;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      order_tracking_events: {
        Row: OrderTrackingEvent;
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          label: string;
          location?: string | null;
          event_time?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: string;
          label?: string;
          location?: string | null;
          event_time?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_tracking_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
};

// ==========================================
// Shared API Types
// ==========================================

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  isAdmin: boolean;
  role: string | null;
};
