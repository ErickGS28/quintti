/**
 * A small client for the two Supabase services Quintti uses: the database through its REST API
 * (PostgREST) and file storage. Server only: it carries the secret key. Plain `fetch`, so the app
 * needs no Supabase library.
 */

/** A request Supabase refused, with its HTTP status and, for the database, the Postgres error code. */
export class SupabaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "SupabaseError";
  }

  /** A row with the same key already exists (Postgres `unique_violation`). */
  get isConflict(): boolean {
    return this.status === 409 || this.code === "23505";
  }
}

export interface SupabaseRest {
  /** Rows of `table` matching PostgREST filters, for example `{ contract_id: "eq.C…" }`. */
  select<T>(table: string, query: Record<string, string>): Promise<T[]>;
  /** Inserts one row and returns it as stored. */
  insert<T>(table: string, row: Record<string, unknown>): Promise<T>;
  /** Stores a file, replacing one at the same path (paths carry the file's hash, so it is the same file). */
  upload(bucket: string, path: string, body: Blob, contentType: string): Promise<void>;
  /** Reads a stored file. The caller streams the response body. */
  download(bucket: string, path: string): Promise<Response>;
}

export interface SupabaseCredentials {
  url: string;
  key: string;
}

/**
 * Legacy keys are JWTs and go in both headers. The newer secret keys (`sb_secret_…`) are not JWTs
 * and only go in `apikey`; the gateway authorizes them from there.
 */
function headersFor(key: string): Record<string, string> {
  const headers: Record<string, string> = { apikey: key };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

async function failure(response: Response): Promise<SupabaseError> {
  let message = `Supabase answered ${response.status}`;
  let code: string | undefined;
  try {
    const body = (await response.json()) as { message?: string; code?: string; error?: string };
    message = body.message ?? body.error ?? message;
    code = body.code;
  } catch {
    // Not every error has a JSON body.
  }
  return new SupabaseError(message, response.status, code);
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function createSupabaseRest({ url, key }: SupabaseCredentials, fetchImpl: typeof fetch = fetch): SupabaseRest {
  const base = url.replace(/\/+$/, "");
  const auth = headersFor(key);

  return {
    async select<T>(table: string, query: Record<string, string>): Promise<T[]> {
      const search = new URLSearchParams(query).toString();
      const response = await fetchImpl(`${base}/rest/v1/${table}?${search}`, {
        headers: { ...auth, Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) throw await failure(response);
      return (await response.json()) as T[];
    },

    async insert<T>(table: string, row: Record<string, unknown>): Promise<T> {
      const response = await fetchImpl(`${base}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          ...auth,
          "Content-Type": "application/json",
          Accept: "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(row),
      });
      if (!response.ok) throw await failure(response);
      const [stored] = (await response.json()) as T[];
      return stored;
    },

    async upload(bucket: string, path: string, body: Blob, contentType: string): Promise<void> {
      const response = await fetchImpl(`${base}/storage/v1/object/${bucket}/${encodePath(path)}`, {
        method: "POST",
        headers: { ...auth, "Content-Type": contentType, "x-upsert": "true", "Cache-Control": "max-age=3600" },
        body,
      });
      if (!response.ok) throw await failure(response);
    },

    async download(bucket: string, path: string): Promise<Response> {
      const response = await fetchImpl(`${base}/storage/v1/object/${bucket}/${encodePath(path)}`, {
        headers: auth,
        cache: "no-store",
      });
      if (!response.ok) throw await failure(response);
      return response;
    },
  };
}
