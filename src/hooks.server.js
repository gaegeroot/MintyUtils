import { COOKIE_NAME, SESSION_SECRET } from "$env/static/private";
import { setAuthCookie } from "$lib/auth/auth0";
import { privateRoutes } from "$lib/consts";
import jwt from "jsonwebtoken";

export const handle = async ({ event, resolve }) => {
  const cookie = event.cookies.get(COOKIE_NAME);

  if (cookie) {
    try {
      const decoded = jwt.verify(cookie, SESSION_SECRET);

      // Attach to locals.user
      event.locals.user = decoded;

      // Refresh cookie
      setAuthCookie(event.cookies, decoded);
    } catch (err) {
      event.cookies.delete(COOKIE_NAME, { path: "/" });
    }
  }

  const url = new URL(event.request.url);

  const matchedRoute = privateRoutes.find(route =>
    url.pathname.startsWith(route.path)
  );

  if (matchedRoute) {
    const requiredRoles = matchedRoute.roles || [];
    const hasAccess =
      event.locals.user &&
      (requiredRoles.length === 0 ||
        requiredRoles.some(r => event.locals.user.roles.includes(r)));

    if (!hasAccess) {
      return new Response(null, {
        status: 302,
        headers: { location: `/api/auth/login?returnUrl=${url.pathname}` },
      });
    }
  }

  return await resolve(event);
};
