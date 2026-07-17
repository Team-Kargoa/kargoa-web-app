'use server';

export async function verifyCredentials(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const exactEmail = process.env.AUTH_EMAIL;
  const exactPassword = process.env.AUTH_PASSWORD;

  if (email === exactEmail && password === exactPassword) {
    return { success: true };
  }

  return { success: false, error: 'Invalid email or password' };
}
