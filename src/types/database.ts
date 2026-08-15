export interface Database {
  public: {
    Tables: {
      mynext_services: {
        Row: {
          id: number;
          title?: string;
          title_es?: string;
          title_en?: string;
          badge_es?: string;
          badge_en?: string;
          description?: string;
          description_es?: string;
          description_en?: string;
          features?: string[] | string;
          features_es?: string[] | string;
          features_en?: string[] | string;
          price?: string | number;
          period_es?: string;
          period_en?: string;
          featured?: boolean;
          popular?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['mynext_services']['Row']>;
        Update: Partial<Database['public']['Tables']['mynext_services']['Row']>;
      };
      mynext_projects: {
        Row: {
          id: number;
          slug?: string;
          title: string;
          category_es?: string;
          category_en?: string;
          description?: string;
          description_es?: string;
          description_en?: string;
          full_description?: string;
          image_url: string;
          project_url: string;
          technologies?: string;
          featured?: boolean;
          active?: boolean;
          sort_order?: number;
          gallery_title?: any;
          gallery_subtitle?: any;
          gallery?: any;
          created_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['mynext_projects']['Row']>;
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
          content_es?: string;
          content_en?: string;
          rating?: number;
          image_url?: string;
          author_photo?: string;
          google_review_id?: string;
          relative_time?: string;
          source?: string;
          active?: boolean;
          created_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['mynext_testimonials']['Row']>;
        Update: Partial<Database['public']['Tables']['mynext_testimonials']['Row']>;
      };
      mynext_settings: {
        Row: {
          id?: string;
          key: string;
          value: string;
          created_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['mynext_settings']['Row']>;
        Update: Partial<Database['public']['Tables']['mynext_settings']['Row']>;
      };
      mynext_hero: {
        Row: {
          id?: number;
          title_es?: string;
          title_en?: string;
          subtitle_es?: string;
          subtitle_en?: string;
          cta_primary_es?: string;
          cta_primary_en?: string;
          banner_offer_es?: string;
          banner_offer_en?: string;
          updated_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['mynext_hero']['Row']>;
        Update: Partial<Database['public']['Tables']['mynext_hero']['Row']>;
      };
      mynext_about: {
        Row: {
          id?: number;
          title_es?: string;
          title_en?: string;
          subtitle_es?: string;
          subtitle_en?: string;
          bio_p1_es?: string;
          bio_p1_en?: string;
          bio_p2_es?: string;
          bio_p2_en?: string;
          stat_experience?: string;
          stat_projects?: string;
          updated_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['mynext_about']['Row']>;
        Update: Partial<Database['public']['Tables']['mynext_about']['Row']>;
      };
      mynext_faq: {
        Row: {
          id?: number;
          question_es?: string;
          question_en?: string;
          answer_es?: string;
          answer_en?: string;
          sort_order?: number;
          active?: boolean;
        };
        Insert: Partial<Database['public']['Tables']['mynext_faq']['Row']>;
        Update: Partial<Database['public']['Tables']['mynext_faq']['Row']>;
      };
      mynext_contact: {
        Row: {
          id?: number;
          phone?: string;
          email?: string;
          whatsapp_message_es?: string;
          whatsapp_message_en?: string;
          site_title_es?: string;
          site_title_en?: string;
          meta_description_es?: string;
          meta_description_en?: string;
          footer_text_es?: string;
          footer_text_en?: string;
          updated_at?: string;
        };
        Insert: Partial<Database['public']['Tables']['mynext_contact']['Row']>;
        Update: Partial<Database['public']['Tables']['mynext_contact']['Row']>;
      };
    };
  };
}
