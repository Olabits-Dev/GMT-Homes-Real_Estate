import { handleBackendRequest } from "../src/app.js";

export const runtime = "nodejs";
export const maxDuration = 15;

function buildBackendRequest(request: Request) {
  const url = new URL(request.url);
  const route = url.searchParams.get("route")?.trim() ?? "";
  const normalizedRoute = route.replace(/^\/+/, "");

  url.searchParams.delete("route");
  url.pathname = normalizedRoute ? `/api/${normalizedRoute}` : "/api";

  return new Request(url, request);
}

export default {
  async fetch(request: Request) {
    return handleBackendRequest(buildBackendRequest(request));
  },
};
