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

  const response = await fetch(`${BASE_URL()}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const envelope = await response
    .json()
    .then((value) => value as Envelope<T>)
    .catch(() => null);

  if (!envelope) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
    );
  }

  if (!response.ok || envelope.status === 'error') {
    throw new ApiError(envelope.message, response.status);
  }

  return envelope.data;
}
