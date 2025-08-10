import supabase from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { Category, Media, MediaInsert, Provider } from "@/types/db";

type UpsertInput = {
  category: Category;
  provider: Provider;
  providerId: string;
  title: string;
  creators?: string[];
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  releaseDate?: string; // YYYY-MM-DD
  extra?: Record<string, unknown>;
};

interface MediaRow {
  id: string;
  category: Category;
  provider: Provider;
  provider_id: string;
  title: string;
  creators: string[] | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  release_date: string | null;
  extra: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function mapRowToMedia(row: MediaRow): Media {
  return {
    id: row.id as string,
    category: row.category as Category,
    provider: row.provider as Provider,
    providerId: row.provider_id as string,
    title: row.title as string,
    creators: (row.creators as string[] | null) ?? null,
    description: (row.description as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    linkUrl: (row.link_url as string | null) ?? null,
    releaseDate: (row.release_date as string | null) ?? null,
    extra: (row.extra as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapInsertToDb(input: MediaInsert) {
  return {
    category: input.category,
    provider: input.provider,
    provider_id: input.providerId,
    title: input.title,
    creators: input.creators ?? null,
    description: input.description ?? null,
    image_url: input.imageUrl ?? null,
    link_url: input.linkUrl ?? null,
    release_date: input.releaseDate ?? null,
    extra: input.extra ?? {},
  } as const;
}

/**
 * Upsert a media by (provider, providerId) and return the latest record.
 */
export async function upsertMediaByProvider(
  input: UpsertInput
): Promise<Media> {
  const dbInput = mapInsertToDb(input);
  const { data, error } = await supabaseAdmin
    .from("media")
    .upsert(dbInput, { onConflict: "provider,provider_id" })
    .select("*")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Upsert failed: no data returned");
  return mapRowToMedia(data);
}

/**
 * Get a media row by id.
 */
export async function getMediaById(id: string): Promise<Media | null> {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRowToMedia(data as unknown as MediaRow) : null;
}

export type { UpsertInput as UpsertMediaByProviderInput };
