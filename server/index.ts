import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import photoVerificationRoutes from "./routes/photoVerification";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Photo verification routes
  app.use("/api", photoVerificationRoutes);

  return app;
}

// Start server if this file is run directly
if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  const app = createServer();
  const port = process.env.PORT || 3001;
  
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📸 Photo verification service available at http://localhost:8000`);
  });
}
