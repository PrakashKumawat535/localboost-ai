import { PromptTemplate } from '../types';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'salon-weekend-special',
    title: 'Weekend Special for Salons',
    description: 'A promotional prompt for weekend salon services.',
    category: 'Salon & Spa',
    business_type: 'Salon',
    template: 'Create a weekend special post for my salon. Offer a 20% discount on all hair treatments. Mention the relaxing atmosphere and expert stylists.'
  },
  {
    id: 'shop-new-launch',
    title: 'New Product Launch for Shops',
    description: 'Announce a new product arrival in your shop.',
    category: 'Retail',
    business_type: 'Shop',
    template: 'Announce the launch of our new summer collection. Highlight the vibrant colors and sustainable materials. Encourage customers to visit the shop today.'
  },
  {
    id: 'restaurant-happy-hour',
    title: 'Happy Hour Promotion',
    description: 'Promote happy hour deals for restaurants and bars.',
    category: 'Food & Beverage',
    business_type: 'Restaurant',
    template: 'Promote our daily happy hour from 4 PM to 7 PM. Mention 2-for-1 cocktails and half-price appetizers. Create a lively and inviting vibe.'
  },
  {
    id: 'fitness-membership-drive',
    title: 'New Member Discount',
    description: 'Attract new members to your gym or fitness studio.',
    category: 'Health & Fitness',
    business_type: 'Gym',
    template: 'Offer a special discount for new members joining this month. Highlight our state-of-the-art equipment and personal training sessions.'
  },
  {
    id: 'real-estate-open-house',
    title: 'Open House Announcement',
    description: 'Invite potential buyers to an open house event.',
    category: 'Real Estate',
    business_type: 'Real Estate Agent',
    template: 'Invite everyone to our open house this Sunday. Describe the beautiful garden, modern kitchen, and spacious living area of this luxury home.'
  },
  {
    id: 'bakery-morning-fresh',
    title: 'Morning Fresh Bakes',
    description: 'Showcase freshly baked goods for bakeries.',
    category: 'Food & Beverage',
    business_type: 'Bakery',
    template: 'Showcase our freshly baked sourdough bread and croissants available every morning. Mention the warm, buttery aroma and perfect crunch.'
  },
  {
    id: 'premium-high-end-ad',
    title: 'Premium High-End Advertisement',
    description: 'Create an ultra-realistic, 4K resolution, cinematic advertisement poster.',
    category: 'Premium',
    business_type: 'Modern Brand',
    template: 'Create a premium, high-end advertisement poster for a modern brand. STYLE: Ultra realistic, 4K resolution, cinematic lighting, sharp focus, high detail, professional advertising style (Nike/Apple). COMPOSITION: Dynamic, asymmetrical layout, strong visual hierarchy, subject slightly off-center, depth with background blur and lighting gradients. TYPOGRAPHY: Bold, modern headline font, secondary smaller subheading, proper spacing. ELEMENTS: Ultra sharp main product, subtle shadows and reflections, soft glow or rim light. COLOR: Cinematic grading, realistic tones, avoid oversaturation.'
  }
];

export const PROMPT_CATEGORIES = Array.from(new Set(PROMPT_TEMPLATES.map(t => t.category)));
