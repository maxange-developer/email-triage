import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const raw = fs.readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(
  env["NEXT_PUBLIC_SUPABASE_URL"]!,
  env["SUPABASE_SERVICE_ROLE_KEY"]!,
);

async function main(): Promise<void> {
  process.stdout.write("Exporting demo data from emails_mock...\n");

  const { data: emails, error: emailsErr } = await supabase
    .from("emails_mock")
    .select("*")
    .order("received_at", { ascending: false });

  if (emailsErr) {
    process.stderr.write(`emails_mock fetch failed: ${emailsErr.message}\n`);
    process.exit(1);
  }

  const { data: accounts, error: accErr } = await supabase
    .from("gmail_accounts")
    .select("*");

  if (accErr) {
    process.stderr.write(`gmail_accounts fetch failed: ${accErr.message}\n`);
    process.exit(1);
  }

  const { data: settings, error: setErr } = await supabase
    .from("users_settings")
    .select("*");

  if (setErr) {
    process.stderr.write(`users_settings fetch warning: ${setErr.message}\n`);
  }

  const redactedSettings = Array.isArray(settings)
    ? settings.map((s) => ({
        ...s,
        google_refresh_token: null,
        google_access_token: null,
      }))
    : settings
      ? { ...settings, google_refresh_token: null, google_access_token: null }
      : null;

  const payload = {
    exported_at: new Date().toISOString(),
    emails_mock: emails ?? [],
    gmail_accounts: accounts ?? [],
    users_settings: redactedSettings,
  };

  const outPath = path.join(process.cwd(), "scripts/demo-data.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");

  const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
  process.stdout.write(`Wrote ${outPath} (${sizeKB} KB)\n`);
  process.stdout.write(`  emails_mock:     ${emails?.length ?? 0}\n`);
  process.stdout.write(`  gmail_accounts:  ${accounts?.length ?? 0}\n`);
  process.stdout.write(`  users_settings:  ${redactedSettings?.length ?? 0}\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err}\n`);
  process.exit(1);
});
