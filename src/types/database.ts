export interface Database {
  public: {
    Tables: {
      mynext_services: {
        Row: {
          id: number;
          title: string;
          description: string;
          price: string;
          featured: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mynext_services']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['mynext_services']['Row']>;
      };
      mynext_projects: {
        Row: {
          id: number;
          title: string;
          description: string;
          image_url: string;
          project_url: string;
          technologies: string;
          featured: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mynext_projects']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['mynext_projects']['Row']>;
      };
      mynext_testimonials: {
        Row: {
          id: string | number;
          client_name?: string;
          name?: string;
          role?: string;
          position?: string;
          company?: string;
          testimonial?: string;
          content?: string;
          rating?: number;
          image_url?: string;
          author_photo?: string;
          google_review_id?: string;
          relative_time?: string;
          source?: string;
          active: boolean;
          created_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['mynext_testimonials']['Row']>;
        Update: Partial<Database['public']['Tables']['mynext_testimonials']['Row']>;
      };
      mynext_settings: {
        Row: {
          key: string;
          value: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mynext_settings']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['mynext_settings']['Row']>;
      };
    };
  };
}
