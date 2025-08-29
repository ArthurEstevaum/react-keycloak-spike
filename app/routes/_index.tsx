// app/routes/_index.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, Form, useLoaderData } from "react-router";
import { isAuthenticated } from "~/services/auth.server";

// O loader verificará o status de autenticação no servidor.
export async function loader({ request }: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(request);
  return { isAuthenticated: authenticated };
}

export default function Index() {
  // Conceito do Remix: `useLoaderData`
  // Este hook do React dá ao nosso componente acesso aos dados que
  // foram retornados pela função `loader` no servidor.
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Bem-vindo ao Spike Remix + Keycloak</h1>
      {isAuthenticated ? (
        <div>
          <p>Você está autenticado!</p>
          <Link to="/dashboard">Ir para o Dashboard</Link>
          {/* Conceito do Remix: <Form>
              Este componente do Remix funciona como um <form> HTML, mas ele
              automaticamente chama a função `action` da rota especificada. */}
          <Form action="/logout" method="post">
            <button type="submit">Logout</button>
          </Form>
        </div>
      ) : (
        <a href="/login">
          <button>Login com Keycloak</button>
        </a>
      )}
    </div>
  );
}