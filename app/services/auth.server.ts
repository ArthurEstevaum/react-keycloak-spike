// app/services/auth.server.ts
import { createCookieSessionStorage, redirect } from "react-router";
import { randomBytes, createHash } from "crypto";

// --- 1. CONFIGURAÇÃO INICIAL ---
const keycloakConfig = {
  url: process.env.KEYCLOAK_URL!,
  realm: process.env.KEYCLOAK_REALM!,
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
  callbackUrl: "http://localhost:5173/auth/callback",
};

// --- 2. GERENCIAMENTO DA SESSÃO ---
// Conceito do Remix: `createCookieSessionStorage` cria um mecanismo para
// armazenar dados em um cookie. Esses dados ficam seguros no servidor
// e o cookie contém apenas um ID de sessão assinado.
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.REMIX_SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

const { getSession, commitSession, destroySession } = sessionStorage;

// --- 3. LÓGICA DE AUTENTICAÇÃO E PKCE ---

// Função para gerar o 'code_verifier' e 'code_challenge' do PKCE
function generatePkce() {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

/**
 * Inicia o fluxo de login. Gera o desafio PKCE, guarda o verificador na
 * sessão e redireciona o usuário para a tela de login do Keycloak.
 */
export async function login(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const { codeVerifier, codeChallenge } = generatePkce();

  // Guarda o codeVerifier na sessão para uso posterior no callback.
  session.set("pkce_code_verifier", codeVerifier);

  const authUrl = new URL(
    `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`
  );
  authUrl.searchParams.set("client_id", keycloakConfig.clientId);
  authUrl.searchParams.set("redirect_uri", keycloakConfig.callbackUrl);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  // Redireciona o usuário para o Keycloak, enviando o cookie de sessão atualizado.
  return redirect(authUrl.toString(), {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

/**
 * Lida com o retorno do Keycloak após o login. Troca o 'code' por tokens.
 */
export async function handleCallback(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const codeVerifier = session.get("pkce_code_verifier");

  if (!code || !codeVerifier) {
    throw new Error("Código de autorização ou verificador PKCE inválido.");
  }

  const tokenUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", keycloakConfig.clientId);
  params.append("client_secret", keycloakConfig.clientSecret);
  params.append("code", code);
  params.append("redirect_uri", keycloakConfig.callbackUrl);
  params.append("code_verifier", codeVerifier);

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao obter tokens: ${errorText}`);
  }

  const tokens = await response.json();

  // Armazena os tokens na sessão.
  session.set("access_token", tokens.access_token);
  session.set("refresh_token", tokens.refresh_token);

  // Retorna o cookie de sessão para ser usado no redirecionamento final.
  return await commitSession(session);
}

/**
 * Verifica se o usuário está autenticado olhando a sessão.
 */
export async function isAuthenticated(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.has("access_token");
}

/**
 * Faz o logout do usuário destruindo a sessão.
 */
export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}