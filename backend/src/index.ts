import { createServer, type IncomingHttpHeaders, type IncomingMessage, type ServerResponse } from "node:http";
import { Buffer } from "node:buffer";
import { fileURLToPath } from "node:url";
import { handleBackendRequest } from "./app.ts";
import { getHost, getPort } from "./lib/server-env.ts";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

async function readNodeRequestBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function createHeaders(headers: IncomingHttpHeaders) {
  const normalizedHeaders = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        normalizedHeaders.append(name, entry);
      }
      continue;
    }

    if (value !== undefined) {
      normalizedHeaders.set(name, value);
    }
  }

  return normalizedHeaders;
}

async function toWebRequest(request: IncomingMessage) {
  const method = request.method ?? "GET";
  const hostHeader = request.headers.host ?? `${getHost()}:${getPort()}`;
  const url = new URL(request.url ?? "/", `http://${hostHeader}`);
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await readNodeRequestBody(request);

  return new Request(url, {
    body: body && body.byteLength > 0 ? body : undefined,
    headers: createHeaders(request.headers),
    method,
  });
}

function appendResponseHeader(
  headers: Map<string, string[]>,
  name: string,
  value: string,
) {
  const existingValues = headers.get(name) ?? [];
  existingValues.push(value);
  headers.set(name, existingValues);
}

async function sendNodeResponse(
  response: ServerResponse,
  webResponse: Response,
) {
  const responseHeaders = new Map<string, string[]>();

  for (const [name, value] of webResponse.headers) {
    appendResponseHeader(responseHeaders, name, value);
  }

  for (const [name, values] of responseHeaders) {
    response.setHeader(name, values.length === 1 ? values[0] : values);
  }

  response.statusCode = webResponse.status;

  if (!webResponse.body) {
    response.end();
    return;
  }

  const body = Buffer.from(await webResponse.arrayBuffer());
  response.end(body);
}

export async function startBackendServer() {
  const host = getHost();
  const port = getPort();

  return await new Promise<void>((resolve, reject) => {
    const server = createServer(async (request, response) => {
      try {
        const webRequest = await toWebRequest(request);
        const webResponse = await handleBackendRequest(webRequest);
        await sendNodeResponse(response, webResponse);
      } catch (error) {
        console.error("Unhandled backend request failure.", error);
        await sendNodeResponse(
          response,
          Response.json(
            {
              message:
                error instanceof Error && error.message.trim() !== ""
                  ? error.message
                  : "The GMT Homes backend encountered an unexpected error.",
            },
            {
              headers: jsonHeaders,
              status: 500,
            },
          ),
        );
      }
    });

    server.once("error", reject);
    server.listen(port, host, () => {
      console.log(`GMT Homes backend running on http://${host}:${port}`);
      resolve();
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startBackendServer().catch((error) => {
    console.error("Failed to start the GMT Homes backend.", error);
    process.exit(1);
  });
}
