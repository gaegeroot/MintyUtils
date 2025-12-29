import { redirect } from "@sveltejs/kit";

export async function load({ locals, url }) {
    
  const user = locals.user;

  // Redirect to login if no user is present
  if (!user) {
    throw redirect(302, `/api/auth/login?returnUrl=${url.pathname}`);
  }

  // Optional: enforce a specific role
  // if (!user.roles.includes('Admin')) {
  //   throw redirect(302, '/unauthorized');
  // }

  return {
    user,
    token: user ? locals.user.token : null, // if you stored the token in sessionUser
  };
}
