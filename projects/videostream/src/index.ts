import dotenv from "dotenv";
import { loadConfig } from "./config";
import { startStreamServer } from "./stream-server";

dotenv.config();

async function bootstrap(): Promise<void> {
  const config = loadConfig();
  await startStreamServer(config);
}

bootstrap().catch((error) => {
  console.error("Fatal startup error", error);
  process.exit(1);
});
