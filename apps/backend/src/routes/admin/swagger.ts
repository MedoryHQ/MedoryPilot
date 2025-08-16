import { Router } from "express";
import path from "path";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { getEnvVariable } from "../../config";
import { swaggerAuthenticate } from "../../middlewares/customer";

const swaggerOptions: swaggerJsDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "PraxisSync API",
      version: "1.0.0",
      description:
        "API documentation for PraxisSync - Admin and Customer endpoints",
    },
    servers: [
      {
        url: `${getEnvVariable("SERVER_URL")}/api/v1`,
      },
    ],
  },
  apis: [
    path.join(__dirname, "..", "..", "docs", "admin", "*.ts"),
    path.join(__dirname, "..", "..", "docs", "customer", "*.ts"),
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
