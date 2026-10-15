/**
 * Tipos de la base de datos (formato de `supabase gen types`).
 * Regenerar tras cambiar el esquema:  npm run db:types
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          phone: string | null;
          lat: number;
          lng: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          phone?: string | null;
          lat: number;
          lng: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          phone?: string | null;
          lat?: number;
          lng?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      cars: {
        Row: {
          id: string;
          name: string;
          brand: string;
          year: number;
          category: Database["public"]["Enums"]["car_category"];
          transmission: Database["public"]["Enums"]["transmission"];
          fuel: Database["public"]["Enums"]["fuel_type"];
          seats: number;
          horsepower: number;
          engine: string;
          price_per_day: number;
          photo: string;
          is_published: boolean;
          mileage_km: number;
          branch_id: string | null;
          lat: number | null;
          lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          year: number;
          category: Database["public"]["Enums"]["car_category"];
          transmission: Database["public"]["Enums"]["transmission"];
          fuel: Database["public"]["Enums"]["fuel_type"];
          seats: number;
          horsepower: number;
          engine: string;
          price_per_day: number;
          photo: string;
          is_published?: boolean;
          mileage_km?: number;
          branch_id?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          year?: number;
          category?: Database["public"]["Enums"]["car_category"];
          transmission?: Database["public"]["Enums"]["transmission"];
          fuel?: Database["public"]["Enums"]["fuel_type"];
          seats?: number;
          horsepower?: number;
          engine?: string;
          price_per_day?: number;
          photo?: string;
          is_published?: boolean;
          mileage_km?: number;
          branch_id?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "cars_branch_id_fkey"; columns: ["branch_id"]; isOneToOne: false; referencedRelation: "branches"; referencedColumns: ["id"] },
        ];
      };
      reservations: {
        Row: {
          id: string;
          code: string;
          car_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          start_date: string;
          end_date: string;
          status: Database["public"]["Enums"]["reservation_status"];
          delivery_mode: Database["public"]["Enums"]["delivery_mode"];
          pickup_branch_id: string | null;
          dropoff_branch_id: string | null;
          delivery_address: string | null;
          delivery_lat: number | null;
          delivery_lng: number | null;
          route_distance_km: number | null;
          route_duration_min: number | null;
          days: number;
          price_per_day: number;
          subtotal: number;
          discount: number;
          delivery_fee: number;
          total: number;
          payment_provider: string | null;
          payment_ref: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          car_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          start_date: string;
          end_date: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"];
          pickup_branch_id?: string | null;
          dropoff_branch_id?: string | null;
          delivery_address?: string | null;
          delivery_lat?: number | null;
          delivery_lng?: number | null;
          route_distance_km?: number | null;
          route_duration_min?: number | null;
          days: number;
          price_per_day: number;
          subtotal: number;
          discount?: number;
          delivery_fee?: number;
          total: number;
          payment_provider?: string | null;
          payment_ref?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          car_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          start_date?: string;
          end_date?: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"];
          pickup_branch_id?: string | null;
          dropoff_branch_id?: string | null;
          delivery_address?: string | null;
          delivery_lat?: number | null;
          delivery_lng?: number | null;
          route_distance_km?: number | null;
          route_duration_min?: number | null;
          days?: number;
          price_per_day?: number;
          subtotal?: number;
          discount?: number;
          delivery_fee?: number;
          total?: number;
          payment_provider?: string | null;
          payment_ref?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "reservations_car_id_fkey"; columns: ["car_id"]; isOneToOne: false; referencedRelation: "cars"; referencedColumns: ["id"] },
          { foreignKeyName: "reservations_pickup_branch_id_fkey"; columns: ["pickup_branch_id"]; isOneToOne: false; referencedRelation: "branches"; referencedColumns: ["id"] },
          { foreignKeyName: "reservations_dropoff_branch_id_fkey"; columns: ["dropoff_branch_id"]; isOneToOne: false; referencedRelation: "branches"; referencedColumns: ["id"] },
        ];
      };
      reviews: {
        Row: {
          id: string;
          car_id: string;
          reservation_id: string;
          author_name: string;
          overall: number;
          comfort: number;
          cleanliness: number;
          performance: number;
          efficiency: number;
          value: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          reservation_id: string;
          author_name: string;
          overall: number;
          comfort: number;
          cleanliness: number;
          performance: number;
          efficiency: number;
          value: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          reservation_id?: string;
          author_name?: string;
          overall?: number;
          comfort?: number;
          cleanliness?: number;
          performance?: number;
          efficiency?: number;
          value?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "reviews_car_id_fkey"; columns: ["car_id"]; isOneToOne: false; referencedRelation: "cars"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_reservation_id_fkey"; columns: ["reservation_id"]; isOneToOne: true; referencedRelation: "reservations"; referencedColumns: ["id"] },
        ];
      };
      trip_logs: {
        Row: {
          id: string;
          car_id: string;
          reservation_id: string | null;
          distance_km: number;
          fuel_used_l: number;
          incidents: number;
          notes: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          reservation_id?: string | null;
          distance_km: number;
          fuel_used_l: number;
          incidents?: number;
          notes?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          reservation_id?: string | null;
          distance_km?: number;
          fuel_used_l?: number;
          incidents?: number;
          notes?: string | null;
          recorded_at?: string;
        };
        Relationships: [
          { foreignKeyName: "trip_logs_car_id_fkey"; columns: ["car_id"]; isOneToOne: false; referencedRelation: "cars"; referencedColumns: ["id"] },
          { foreignKeyName: "trip_logs_reservation_id_fkey"; columns: ["reservation_id"]; isOneToOne: true; referencedRelation: "reservations"; referencedColumns: ["id"] },
        ];
      };
      maintenances: {
        Row: {
          id: string;
          car_id: string;
          kind: string;
          description: string | null;
          cost: number;
          start_date: string;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          kind: string;
          description?: string | null;
          cost?: number;
          start_date: string;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          kind?: string;
          description?: string | null;
          cost?: number;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "maintenances_car_id_fkey"; columns: ["car_id"]; isOneToOne: false; referencedRelation: "cars"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: {
      car_rating_stats: {
        Row: { car_id: string | null; rating_average: number | null; rating_count: number | null };
        Relationships: [
          { foreignKeyName: "reviews_car_id_fkey"; columns: ["car_id"]; isOneToOne: false; referencedRelation: "cars"; referencedColumns: ["id"] },
        ];
      };
    };
    Functions: {
      increment_car_mileage: { Args: { p_car_id: string; p_km: number }; Returns: undefined };
    };
    Enums: {
      car_category: "SEDAN" | "SUV" | "DEPORTIVO" | "LUJO" | "COMPACTO" | "PICKUP";
      transmission: "MANUAL" | "AUTOMATICA";
      fuel_type: "NAFTA" | "DIESEL" | "HIBRIDO" | "ELECTRICO";
      reservation_status: "PENDING" | "PAID" | "ACTIVE" | "COMPLETED" | "CANCELLED";
      delivery_mode: "BRANCH" | "HOME";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
