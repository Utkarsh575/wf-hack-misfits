import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { Express } from "express";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Oracle Service API",
      version: "1.0.0",
      description: "API documentation for the Oracle Service",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: [
    // List all files with swagger docs here
    "./src/app.ts",
    "./src/controllers/*.ts",
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwaggerDocs(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
