import { type NextRequest } from "next/server";
import { type ZodSchema, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminUser } from "@/types/database";

// ==========================================
// Response Helpers
// ==========================================

export function jsonResponse<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function validationErrorResponse(error: ZodError) {
  return Response.json(
    {
      error: "Validation failed",
      details: error.flatten().fieldErrors,
    },
    { status: 422 },
  );
}

// ==========================================
// Body Parsing
// ==========================================

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ data: T; error?: never } | { data?: never; error: Response }> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return { error: errorResponse("Invalid JSON body", 400) };
  }

  const result = schema.safeParse(raw);

  if (!result.success) {
    return { error: validationErrorResponse(result.error) };
  }

  return { data: result.data };
}

// ==========================================
// Auth Helpers
// ==========================================

type AdminAuth = {
  user: { id: string; email?: string };
  adminUser: AdminUser;
};

/**
 * Verify the current request is from an authenticated admin user.
 * Returns the user + admin record, or a ready-to-return error Response.
 */
export async function requireAdmin(): Promise<
  { auth: AdminAuth; error?: never } | { auth?: never; error: Response }
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: errorResponse("Unauthorized", 401) };
  }

  const { data: adminUser, error: adminError } = await createAdminClient()
    .from("admin_users")
    .select("id, user_id, role")
    .eq("user_id", user.id)
    .single();

  if (adminError || !adminUser) {
    return { error: errorResponse("Forbidden: admin access required", 403) };
  }

  return {
    auth: {
      user: { id: user.id, email: user.email },
      adminUser: adminUser as AdminUser,
    },
  };
}

// ==========================================
// Pagination
// ==========================================

export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
  sort: string;
  order: "asc" | "desc";
};

const ALLOWED_SORT_COLUMNS = new Set([
  "created_at",
  "updated_at",
  "name",
  "price",
  "total",
  "status",
  "display_order",
  "rating",
  "popular",
]);

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { sort?: string; limit?: number } = {},
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(
      1,
      parseInt(searchParams.get("limit") || String(defaults.limit ?? 20), 10),
    ),
  );
  const requestedSort = searchParams.get("sort");
  const defaultSort = defaults.sort ?? "created_at";
  const sort =
    requestedSort && ALLOWED_SORT_COLUMNS.has(requestedSort)
      ? requestedSort
      : defaultSort;
  const rawOrder = searchParams.get("order");
  const order: "asc" | "desc" =
    rawOrder === "asc" || rawOrder === "desc" ? rawOrder : "desc";

  return { page, limit, offset: (page - 1) * limit, sort, order };
}

// ==========================================
// Route Wrapper
// ==========================================

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>;

type AdminRouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AdminAuth,
) => Promise<Response>;

/**
 * Higher-order function that wraps an admin route handler.
 * Handles: auth check, error catching, consistent error responses.
 */
export function withAdminRoute(handler: AdminRouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      const result = await requireAdmin();

      if (result.error) {
        return result.error;
      }

      return await handler(request, context, result.auth);
    } catch (err) {
      console.error("[Admin Route Error]", err);
      return errorResponse("Internal server error", 500);
    }
  };
}

export type UserAuth = {
  user: { id: string; email?: string };
};

export async function requireUser(): Promise<
  { auth: UserAuth; error?: never } | { auth?: never; error: Response }
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: errorResponse("Unauthorized", 401) };
  }

  return {
    auth: {
      user: { id: user.id, email: user.email },
    },
  };
}

type UserRouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: UserAuth,
) => Promise<Response>;

/**
 * Higher-order function that wraps a protected user route handler.
 * Handles: auth check (requires any logged in user), error catching, consistent error responses.
 */
export function withUserRoute(handler: UserRouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      const result = await requireUser();

      if (result.error) {
        return result.error;
      }

      return await handler(request, context, result.auth);
    } catch (err) {
      console.error("[User Route Error]", err);
      return errorResponse("Internal server error", 500);
    }
  };
}
