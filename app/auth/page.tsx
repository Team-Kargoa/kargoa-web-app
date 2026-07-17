// app/auth/page.tsx
'use client';

import React, { useState } from 'react';
import { verifyCredentials } from './actions';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await verifyCredentials(formData);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Something went wrong');
    }
  }

  return (
    <div
      className="relative
          h-screen
          w-full
          bg-[linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)),url('/hero.png')]
          bg-cover
          bg-center
          bg-no-repeat
          overflow-hidden
          flex items-center justify-center"
    >
      <div className="bg-white/30 backdrop-blur-md border border-white/20 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-100/80 rounded border border-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
