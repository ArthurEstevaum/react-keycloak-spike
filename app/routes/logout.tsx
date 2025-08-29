// app/routes/logout.tsx
import type { ActionFunctionArgs } from "react-router";
import { logout } from "~/services/auth.server";

// Conceito do Remix: `action`
// Uma função `action` roda *apenas no servidor* para lidar com envios
// de formulários (POST, PUT, DELETE, etc.). É perfeita para o logout.
export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}