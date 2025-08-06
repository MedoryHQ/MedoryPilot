import express from "express";
import path from "path";
import { generateRoutes } from "./utils";
import cors from "cors";
import fs from "fs";
import { getEnvVariable, prisma } from "./config";
import cookies from "cookie-parser";
import http from "http";

const allowedOrigins = [
  getEnvVariable("clientUrl"),
  getEnvVariable("adminUrl"),
];

const app = express();
const server = http.createServer(app);

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookies());

app.use(
  "/api",
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.static(__dirname + "/public"));

const nodeEnv = getEnvVariable("nodeEnv");

const uploadsPath = path.join(
  __dirname,
  nodeEnv === "production" ? "../../uploads" : "../uploads"
);

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(
  "/uploads",
  express.static(uploadsPath, {
    fallthrough: false,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    },
  })
);

const PORT = getEnvVariable("port") || 3000;

async function main() {
  generateRoutes(app);

  server.listen(PORT, () => {
    console.log(`Server is running on ${getEnvVariable("serverUrl")}`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
