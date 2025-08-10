import type {
  Category as MediaCategory,
  Provider as MediaProvider,
} from "@/types/media";

export type Category = MediaCategory;
export type Provider = MediaProvider;

export interface Media {
  id: string;
  category: Category;
  provider: Provider;
  providerId: string;
  title: string;
  creators: string[] | null;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  releaseDate: string | null;
  extra: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Top10Entry {
  id: string;
  userId: string;
  year: number;
  rank: number;
  mediaId: string;
  userNote: string | null;
  userLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

// Insert/Upsert helper shapes
export interface MediaInsert {
  category: Category;
  provider: Provider;
  providerId: string;
  title: string;
  creators?: string[] | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  releaseDate?: string | null; // YYYY-MM-DD
  extra?: Record<string, unknown>;
}

export interface Top10EntryInsert {
  userId: string;
  year: number;
  rank: number; // 1..10
  mediaId: string;
  userNote?: string | null;
  userLink?: string | null;
}

export interface ProfileInsert {
  id: string; // Supabase auth user id
  displayName?: string | null;
}
