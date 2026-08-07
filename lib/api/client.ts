import type { Envelope } from './types';

const BASE_URL = () =>
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL()}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection.', 0);
  }

  const envelope = await response
    .json()
    .then((value) => value as Envelope<T>)
    .catch(() => null);

  if (!envelope) {
    // No body (e.g. 204 No Content) is a success if the request succeeded;
    // an unparsable body on a failed request is a generic HTTP failure.
    if (response.ok) {
      return undefined as T;
    }
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
    );
  }

  if (!response.ok || envelope.status === 'error') {
    throw new ApiError(envelope.message ?? 'Request failed', response.status);
  }

  return envelope.data;
}
