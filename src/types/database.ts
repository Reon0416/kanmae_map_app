export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          description: string;
          genre: string;
          price_band: string;
          address: string;
          lat: number;
          lng: number;
          walk_minutes: number;
          hours: string;
          closed: string;
          accepts_takeout: boolean;
          has_student_discount: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      current_store_status: {
        Row: {
          store_id: string;
          display_status: string;
          wait_time: string;
          source: string;
          updated_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: "user" | "store" | "admin";
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
