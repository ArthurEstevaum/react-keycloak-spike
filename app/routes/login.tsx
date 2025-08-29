// app/routes/login.tsx
import type { LoaderFunctionArgs } from "react-router";
import { login } from "~/services/auth.server";

// Conceito do Remix: `loader`
// Uma função `loader` roda *apenas no servidor* ANTES da página ser renderizada.
// É o lugar ideal para buscar dados ou, neste caso, para executar a lógica
// de redirecionamento do login.
export async function loader({ request }: LoaderFunctionArgs) {
  return login(request);
}

export default function LoginPage() {
  // Como o loader sempre redireciona, este componente nunca será renderizado.
  return null;
}