import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"
import cors from "cors";

import router from "./routes/index"; // Assure-toi du bon chemin
import { UserService } from "./services/user.service";
import setupSwagger from "./config/swagger.config";

const app = express();

app.use(bodyParser.json());
app.use(express.json()); // 🛠️ Active le middleware JSON
app.use(cookieParser()); // 🛠️ Active le middleware cookie-parser

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://didimeet.didicode.com"] // 🌍 En prod, autorise le frontend en ligne
    : ["http://localhost:5173"]; // 💻 En dev, autorise le frontend local

app.use(
  cors({
    origin: allowedOrigins || "http://localhost:4173",
    credentials: true,
  })
);

const userService = new UserService();
userService.createSuperAdminIfNotExists();

// Routes
app.use("/", router); // Monte le routeur

setupSwagger(app); // Active Swagger

export default app;
