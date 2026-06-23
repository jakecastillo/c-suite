import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import type { LedgerEvent } from "./events.js";

interface ChainedLine {
  event: LedgerEvent;
  prev_hash: string;
  hash: string;
}
const GENESIS = "0".repeat(64);

/** Deterministic stringify: recursively sort object keys so the hash covers ALL fields,
 *  including nested predicate_args. (A JSON.stringify replacer-array filters nested keys
 *  and would silently drop predicate_args — do not use that approach.) */
function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`)
    .join(",")}}`;
}
function hashOf(prev: string, event: LedgerEvent): string {
  return createHash("sha256")
    .update(prev + canonical(event))
    .digest("hex");
}

export function readChain(path: string): ChainedLine[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as ChainedLine);
}

export function appendEvent(path: string, event: LedgerEvent): void {
  const chain = readChain(path);
  const last = chain.at(-1);
  const prev = last ? last.hash : GENESIS;
  const line: ChainedLine = {
    event,
    prev_hash: prev,
    hash: hashOf(prev, event),
  };
  appendFileSync(path, `${JSON.stringify(line)}\n`);
}

export function verifyChain(path: string): { ok: boolean; brokenAt?: number } {
  const chain = readChain(path);
  let prev = GENESIS;
  for (const [i, line] of chain.entries()) {
    if (line.prev_hash !== prev || line.hash !== hashOf(prev, line.event))
      return { ok: false, brokenAt: i };
    prev = line.hash;
  }
  return { ok: true };
}
