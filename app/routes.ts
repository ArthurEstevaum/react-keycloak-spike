import { index, route, type RouteConfig } from '@react-router/dev/routes';
export default [
  index("routes/_index.tsx"),
  route("/auth/callback", "routes/auth.callback.tsx"),
  route("/login", "routes/login.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/logout", "routes/logout.tsx"),
] satisfies RouteConfig;
