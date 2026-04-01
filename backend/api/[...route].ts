import { handleBackendRequest } from "../src/app.ts";

export const runtime = "nodejs";
export const maxDuration = 15;

async function handleRequest(request: Request) {
  return handleBackendRequest(request);
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function PUT(request: Request) {
  return handleRequest(request);
}

export async function PATCH(request: Request) {
  return handleRequest(request);
}

export async function DELETE(request: Request) {
  return handleRequest(request);
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      Allow: "DELETE, GET, OPTIONS, PATCH, POST, PUT",
    },
    status: 204,
  });
}
