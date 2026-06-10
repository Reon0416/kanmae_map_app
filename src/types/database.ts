export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          genre: string;
          price_band: string;
          lat: number;
          lng: number;
          created_at: string;
        };
      };
      current_store_status: {
        Row: {
          store_id: string;
          display_status: string;
          wait_time_bucket: string;
          updated_at: string;
        };
      };
    };
  };
};
