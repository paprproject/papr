import { createClient } from "npm:@supabase/supabase-js@2";

function requireEnvironment(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

export function createAdminClient() {
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SECRET_KEY");

  if (!serviceKey) {
    throw new Error(
      "Missing server environment variable: SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(requireEnvironment("SUPABASE_URL"), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireUser(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Sign in before starting checkout.");
  }

  const admin = createAdminClient();
  const token = authorization.slice("Bearer ".length);
  const { data, error } = await admin.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return { admin, user: data.user };
}
