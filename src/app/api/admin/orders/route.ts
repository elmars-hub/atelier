import {
  jsonResponse,
  parsePagination,
  withAdminRoute,
} from "@/lib/api-utils";
import { getOrders } from "@/lib/services/orders";

export const GET = withAdminRoute(async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);

  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const result = await getOrders(pagination, { status, search });
  return jsonResponse(result);
});
