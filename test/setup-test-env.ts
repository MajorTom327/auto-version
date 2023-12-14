import dotenv from "dotenv";
import { vi } from "vitest";

dotenv.config({ path: "../.env" });

vi.mock("../app/db.server");
