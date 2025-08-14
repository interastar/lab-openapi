import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { TokenEndpoint } from "./endpoints/authEndpoint";
import { FrigosRouter } from "./endpoints/frigos/router";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.onError((err, c) => {
  if (err instanceof ApiException) {
    // If it's a Chanfana ApiException, let Chanfana handle the response
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode,
    );
  }

  console.error("Global error handler caught:", err); // Log the error if it's not known

  // For other errors, return a generic 500 response
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: "Internal Server Error" }],
    },
    500,
  );
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    info: {
      title: "Lab APIs",
      version: "1.0.0",
      description: "APIs de ejemplo.",
    },
    tags: [
      { name: 'auth', description: 'Operaciones de seguridad para autenticación y tokens' },
      { name: 'frigos', description: 'Operaciones de frigos' },
    ],
  },
});

// Register Tasks Sub router
//openapi.route("/tasks", tasksRouter);

// Register other endpoints
openapi.post("/auth/token", TokenEndpoint);

// Register Frigos Sub router
openapi.route("/frigos", FrigosRouter);

// Export the Hono app
export default app;
