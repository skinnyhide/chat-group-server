import { scrypt } from "node:crypto";

const salt = process.env.PASSWORD_SALT!;

async function hashPassword(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(text, salt, 64, (err, derivedKey) => {
      if (err) reject(err.message);
      resolve(derivedKey.toString("hex"));
    });
  });
}

export default hashPassword;
