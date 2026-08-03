export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          phone: string;
          email: string;
          member_id: string | null;
          identity_type: string | null;
          status: string | null;
          trial_start_date: string | null;
          trial_end_date: string | null;
          stock_shares: number | null;
          contribution_points: number | null;
          edu_training_completed: boolean | null;
          id_card_front_url: string | null;
          remittance_proof_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          phone: string;
          email: string;
          member_id?: string | null;
          identity_type?: string | null;
          status?: string | null;
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          stock_shares?: number | null;
          contribution_points?: number | null;
          edu_training_completed?: boolean | null;
          id_card_front_url?: string | null;
          remittance_proof_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string;
          email?: string;
          member_id?: string | null;
          identity_type?: string | null;
          status?: string | null;
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          stock_shares?: number | null;
          contribution_points?: number | null;
          edu_training_completed?: boolean | null;
          id_card_front_url?: string | null;
          remittance_proof_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          price_member: number;
          price_guest: number;
          is_tax_exempt: boolean | null;
          temp_control: string | null;
          is_preorder: boolean | null;
          preorder_threshold: number | null;
          preorder_deadline: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          price_member: number;
          price_guest: number;
          is_tax_exempt?: boolean | null;
          temp_control?: string | null;
          is_preorder?: boolean | null;
          preorder_threshold?: number | null;
          preorder_deadline?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          price_member?: number;
          price_guest?: number;
          is_tax_exempt?: boolean | null;
          temp_control?: string | null;
          is_preorder?: boolean | null;
          preorder_threshold?: number | null;
          preorder_deadline?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          member_id: string | null;
          product_id: string | null;
          quantity: number;
          temp_control: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          temp_control?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          temp_control?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          member_id: string | null;
          total_amount: number;
          tax_amount: number | null;
          status: string | null;
          delivery_method: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          total_amount: number;
          tax_amount?: number | null;
          status?: string | null;
          delivery_method?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string | null;
          total_amount?: number;
          tax_amount?: number | null;
          status?: string | null;
          delivery_method?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string | null;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          tax_type: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          tax_type: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number;
          tax_type?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string | null;
          payment_method: string;
          status: string | null;
          bank_last_five: string | null;
          invoice_number: string | null;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          payment_method: string;
          status?: string | null;
          bank_last_five?: string | null;
          invoice_number?: string | null;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          payment_method?: string;
          status?: string | null;
          bank_last_five?: string | null;
          invoice_number?: string | null;
          paid_at?: string | null;
        };
        Relationships: [];
      };
      logistics: {
        Row: {
          id: string;
          order_id: string | null;
          recipient_name: string;
          recipient_phone: string;
          delivery_address: string | null;
          store_code_711: string | null;
          shipment_no: string | null;
          temp_layer: string | null;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          recipient_name: string;
          recipient_phone: string;
          delivery_address?: string | null;
          store_code_711?: string | null;
          shipment_no?: string | null;
          temp_layer?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          recipient_name?: string;
          recipient_phone?: string;
          delivery_address?: string | null;
          store_code_711?: string | null;
          shipment_no?: string | null;
          temp_layer?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist_surveys: {
        Row: {
          id: string;
          member_id: string | null;
          product_name: string;
          type: string;
          expected_qty: number | null;
          reference_link: string | null;
          points_awarded: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          product_name: string;
          type: string;
          expected_qty?: number | null;
          reference_link?: string | null;
          points_awarded?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string | null;
          product_name?: string;
          type?: string;
          expected_qty?: number | null;
          reference_link?: string | null;
          points_awarded?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PublicSchema = Database["public"];
export type TableName = keyof PublicSchema["Tables"];
export type TableRow<T extends TableName> = PublicSchema["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = PublicSchema["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = PublicSchema["Tables"][T]["Update"];
