// const express = require("express");
// const helmet = require("helmet");
// const cors = require("cors");
// const swaggerUi = require("swagger-ui-express");
// const { logger } = require("./logger");
// const { requestLogger } = require("./middleware/requestLogger");
// const { errorHandler } = require("./middleware/errorHandler");
// const healthRoutes = require("./routes/health");
// const processRoutes = require("./routes/process");

// const PORT = process.env.PORT || 10000;

// const app = express();

// // Security + parsing
// app.use(helmet());
// app.use(cors({ origin: "*" }));
// app.use(express.json({ limit: "1mb" }));
// app.use(requestLogger);

// // Routes
// app.use(healthRoutes);
// app.use(processRoutes);

// // Swagger docs
// const openApiSpec = {
//   openapi: "3.0.0",
//   info: { title: "Render API Service", version: "1.0.0" },
//   paths: {
//     "/health": {
//       get: { summary: "Health check", responses: { "200": { description: "Service healthy" } } }
//     },
//     "/process": {
//       post: {
//         summary: "Process query",
//         requestBody: {
//           required: true,
//           content: { "application/json": { schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } }
//         },
//         responses: {
//           "200": {
//             description: "Processed result",
//             content: { "application/json": { schema: { type: "object", properties: { result: { type: "string" }, source: { type: "string" } } } } }
//           }
//         }
//       }
//     }
//   }
// };
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// // Root
// app.get("/", (req, res) => {
//   res.json({ message: "Render API Service", docs: "/docs", health: "/health" });
// });

// // Error handling
// app.use(errorHandler);

// // Start
// app.listen(PORT, () => {
//   logger.info(`Server listening on port ${PORT}`);
// });

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { logger } = require("./logger");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");

// NEW
const { authMiddleware } = require("./middleware/authMiddleware");
const tokenRoutes = require("./routes/token");

const healthRoutes = require("./routes/health");
const processRoutes = require("./routes/process");

const PORT = process.env.PORT || 10000;
const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

// Keep existing routes as-is
app.use(healthRoutes);
app.use(processRoutes);

// NEW: opt-in auth middleware only where needed
// If you want /health to stay public, don’t apply here.
// For demo, we’ll protect the exchange route only:
app.use(authMiddleware);
app.use(tokenRoutes);

// Swagger (you can add the new route there too if you like)
const openApiSpec = {
  openapi: "3.0.0",
  info: { title: "Render API Service", version: "1.0.0" },
  paths: {
    "/health": { get: { summary: "Health check", responses: { "200": { description: "Service healthy" } } } },
    "/process": { post: { summary: "Process query" } },
    "/token/exchange": { post: { summary: "Exchange Entra token for GCP access token (WIF)" } }
  }
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/", (req, res) => {
  res.json({ message: "Render API Service", docs: "/docs", health: "/health" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
