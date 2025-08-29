// app/routes/auth.callback.tsx
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { handleCallback } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // O handleCallback troca o código por tokens e retorna o cookie de sessão.
  const sessionCookie = await handleCallback(request);

  // Redirecionamos o usuário para uma página protegida, enviando o cookie.
  return redirect("/dashboard", {
    headers: { "Set-Cookie": sessionCookie },
  });
}