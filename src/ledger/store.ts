import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import type { LedgerEvent } from "./events.js";

interface ChainedLine { event: LedgerEvent; prev_hash: string; hash: string }
const GENESIS = "0".repeat(64);

/** Canonical JSON with sorted keys (one level deep is enough for our flat events + small args). */
function canonical(event: LedgerEvent): string {
  return JSON.stringify(event, Object.keys(event as Record<string, unknown>).sort());
}
function hashOf(prev: string, event: LedgerEvent): string {
  return createHash("sha256").update(prev + canonical(event)).digest("hex");
}

export function readChain(path: string): ChainedLine[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as ChainedLine);
}

export function appendEvent(path: string, event: LedgerEvent): void {
  const chain = readChain(path);
  const prev = chain.length ? chain[chain.length - 1]!.hash : GENESIS;
  const line: ChainedLine = { event, prev_hash: prev, hash: hashOf(prev, event) };
  appendFileSync(path, `${JSON.stringify(line)}\n`);
}

export function verifyChain(path: string): { ok: boolean; brokenAt?: number } {
  const chain = readChain(path);
  let prev = GENESIS;
  for (let i = 0; i < chain.length; i++) {
    const line = chain[i]!;
    if (line.prev_hash !== prev || line.hash !== hashOf(prev, line.event)) return { ok: false, brokenAt: i };
    prev = line.hash;
  }
  return { ok: true };
}
