import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import nodemailer from "nodemailer";
import sharp from "sharp";
import { collections, globals } from "./cms/schema";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = process.env.SITE_URL || "http://localhost:3000";
const env = process.env;

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  admin: { user: "users", meta: { titleSuffix: " | Kidz Time CMS" } },
  collections, globals, sharp, editor: lexicalEditor(),
  cors: [siteUrl], csrf: [siteUrl],
  upload: { limits: { fileSize: 10_000_000 } },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  // Optional: e-mail alerts for new enquiries. Off unless SMTP_HOST is set (see DEPLOYMENT.md).
  email: env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: env.SMTP_FROM || env.SMTP_USER || "",
        defaultFromName: "Kidz Time School website",
        transport: nodemailer.createTransport({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 587), secure: env.SMTP_PORT === "465", auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }),
      })
    : undefined,
  // One SQLite file. Everything (content, enquiries, users) lives in it, so a backup is a file copy.
  db: sqliteAdapter({ client: { url: process.env.SQLITE_URL || "file:./kidztime.db" }, prodMigrations: migrations }),
});
