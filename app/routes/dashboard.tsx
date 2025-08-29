// app/routes/dashboard.tsx
import { redirect, useLoaderData } from "react-router";
import { isAuthenticated, sessionStorage } from "~/services/auth.server";
import type { LoaderFunctionArgs } from "react-router";

// Este loader atua como um "guarda" (guard).
export async function loader({ request }: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    // Se não estiver autenticado, redireciona para a página inicial.
    return redirect("/");
  }

  // Se autenticado, podemos ler os dados da sessão e passá-los para a página.
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const accessToken = session.get("access_token");

  // Em um app real, você poderia decodificar o token para pegar o nome do usuário.
  // Para este spike, vamos apenas mostrar que temos o token.
  return { message: "Você está na área protegida!", accessToken };
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{data.message}</p>
      <h2>Seu Access Token (apenas para demonstração):</h2>
      <pre style={{ background: "#eee", padding: "1rem", overflowX: "auto" }}>
        <code>{data.accessToken}</code>
      </pre>
    </div>
  );
}