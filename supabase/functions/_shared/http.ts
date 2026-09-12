const localOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function configuredOrigins() {
  return new Set(
    [
      Deno.env.get("SITE_URL"),
      ...(Deno.env.get("CHECKOUT_ALLOWED_ORIGINS") ?? "").split(","),
    ]
      .map((origin) => origin?.trim())
      .filter((origin): origin is string => Boolean(origin)),
  );
}

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigins = configuredOrigins();
  const allowLocal = Deno.env.get("ALLOW_LOCAL_CHECKOUT") === "true";
  const allowed =
    allowedOrigins.has(origin) || (allowLocal && localOrigins.has(origin));

  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(request),
      "Content-Type": "application/json",
    },
  });
}

export function handleOptions(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const headers = getCorsHeaders(request);

  if (headers["Access-Control-Allow-Origin"] !== origin) {
    return jsonResponse(request, { error: "Origin is not allowed." }, 403);
  }

  return new Response("ok", { headers });
}

export function requireAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  return getCorsHeaders(request)["Access-Control-Allow-Origin"] === origin;
}
