import { Router } from "express";
import path from "path";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { getEnvVariable } from "@/config";
import { swaggerAuthenticate } from "@/middlewares/customer";

const patl = path.join(__dirname, "..", "..", "docs", "customer", "*.ts");
console.log(patl);
const swaggerOptions: swaggerJsDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Medory API",
      version: "1.0.0",
      description:
        "API documentation for Medory - Admin and Customer endpoints",
    },
    servers: [
      {
        url: `${getEnvVariable("SERVER_URL")}/api/v1`,
      },
    ],
  },
  apis: [
    path.join(__dirname, "..", "..", "docs", "admin", "*.js"),
    path.join(__dirname, "..", "..", "docs", "admin", "website", "*.js"),
    path.join(__dirname, "..", "..", "docs", "customer", "website", "*.js"),
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const SwaggerRouter = Router();

SwaggerRouter.use(
  "/",
  swaggerAuthenticate,
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);
