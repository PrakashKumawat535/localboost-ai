export interface BusinessProfile {
  id?: string;
  user_id: string;
  business_name: string;
  niche: string;
  target_audience: string;
  tone: string;
  language: string;
  brand_colors: string[];
  logo_url?: string;
  phone?: string;
  address?: string;
  instagram_handle?: string;
  facebook_handle?: string;
  website_url?: string;
}

export interface GeneratedPost {
  id?: string;
  user_id: string;
  prompt: string;
  poster_url: string;
  poster_title?: string;
  poster_subheading?: string;
  badge_text?: string;
  short_caption: string;
  long_caption: string;
  cta: string;
  hashtags: string[];
  font_color?: string;
  font_style?: 'modern' | 'classic' | 'bold' | 'elegant' | 'playful';
  text_position?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  contact_position?: 'top' | 'bottom' | 'left' | 'right';
  logo_position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  contact_style?: 'boxed' | 'minimal' | 'gradient' | 'integrated';
  logo_background_style?: 'light' | 'dark' | 'none';
  show_business_name_logo?: boolean;
  selected_theme?: string;
  selected_archetype?: string;
  price?: string;
  discount?: string;
  tagline?: string;
  offer_percentage?: string;
  headline_position?: 'center' | 'right';
  features?: string[];
  platform: 'Instagram' | 'Facebook';
  created_at?: string;
  is_liked?: boolean;
  is_disliked?: boolean;
  style_tag?: string;
  layout_tag?: string;
  color_tag?: string;
}

export interface UserCredits {
  user_id: string;
  credits: number;
  plan: 'free' | 'pro';
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  business_type?: string;
}
