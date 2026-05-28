/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 */
export const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8081").replace(/\/$/, "");

async function fetchModel(url) {
  const path = url.startsWith("/") ? url : `/${url}`;
  const response = await fetch(`${API_BASE}${path}`, { credentials: "include" });

  const text = await response.text();

  if (!response.ok) {
    const msg = text || `Request failed: ${response.status} ${response.statusText}`;
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON from server.");
  }
}

export default fetchModel;

export async function postJson(url, body) {
  const path = url.startsWith("/") ? url : `/${url}`;
  if (path === "/admin/login") {
    console.log("[login] POST", `${API_BASE}${path}`);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
  });
  const text = await response.text();
  if (!response.ok) {
    const msg = text || `Request failed: ${response.status} ${response.statusText}`;
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }
  return text ? JSON.parse(text) : {};
}

export async function postFile(url, file) {
  const path = url.startsWith("/") ? url : `/${url}`;
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const text = await response.text();
  if (!response.ok) {
    const msg = text || `Request failed: ${response.status} ${response.statusText}`;
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }
  return text ? JSON.parse(text) : {};
}
