import { randomBytes } from "node:crypto";

async function generateToken() {
  return randomBytes(27).toString("hex");
}

export default generateToken;
