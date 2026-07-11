import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("manifest exposes installable PWA metadata and maskable icons", () => {
  const manifest = JSON.parse(
    readFileSync(join(root, "public", "manifest.webmanifest"), "utf8"),
  ) as {
    name?: string;
    short_name?: string;
    start_url?: string;
    display?: string;
    icons?: Array<{ src: string; sizes: string; purpose?: string }>;
  };

  assert.equal(manifest.name, "Duelo");
  assert.equal(manifest.short_name, "Duelo");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  assert.ok(
    manifest.icons?.some(
      (icon) => icon.sizes === "192x192" && icon.purpose?.includes("maskable"),
    ),
  );
  assert.ok(
    manifest.icons?.some(
      (icon) => icon.sizes === "512x512" && icon.purpose?.includes("maskable"),
    ),
  );
});

test("PWA registers a service worker with offline support", () => {
  const registerPath = join(root, "src", "components", "pwa-register.tsx");
  const serviceWorkerPath = join(root, "public", "sw.js");

  assert.ok(existsSync(registerPath), "client registration component should exist");
  assert.ok(existsSync(serviceWorkerPath), "service worker should exist");

  const registerSource = readFileSync(registerPath, "utf8");
  const serviceWorkerSource = readFileSync(serviceWorkerPath, "utf8");

  assert.match(registerSource, /navigator\.serviceWorker\.register\(["']\/sw\.js["']\)/);
  assert.match(serviceWorkerSource, /addEventListener\(["']install["']/);
  assert.match(serviceWorkerSource, /addEventListener\(["']fetch["']/);
  assert.match(serviceWorkerSource, /offline/i);
});
