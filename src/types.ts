export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  year: string;
  createdAt: number;
}

export interface ArtistInfo {
  name: string;
  bio: string;
  email: string;
  phone?: string;
  instagram?: string;
  telegram?: string;
  profileImageUrl?: string;
  homeHeroBgUrl?: string;
  homeHeroSubtitle?: string;
  homePortfolioSubtitle?: string;
}

export type Category = 'Живопись' | 'Рисунок' | 'Скульптура' | 'Цифровое искусство' | 'Другое';
