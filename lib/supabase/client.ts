import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage:
                    typeof window !== "undefined"
                        ? window.localStorage
                        : undefined,
            },
        }
    );
}
