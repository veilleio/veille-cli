import { CliUsageError } from "./errors.js";
import type { ParamDefinition } from "./types.js";

export interface ParsedArgs {
  readonly positionals: string[];
  readonly flags: Map<string, string[]>;
}

const BOOLEAN_CONTROLS = new Set(["help", "h", "version", "raw", "compact"]);

/**
 * Splits argv into positionals and `--name value` / `--name=value` flags. A flag directly followed by
 * another flag (or nothing) is recorded as the string "true", so boolean parameters can be bare.
 */
export function parseArgs(
  argv: readonly string[],
  booleanFlags: ReadonlySet<string> = new Set(),
): ParsedArgs {
  const positionals: string[] = [];
  const flags = new Map<string, string[]>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--") {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (arg === "-o") {
      const value = argv[i + 1];
      if (value === undefined)
        throw new CliUsageError("-o needs a path (or - for standard output).");
      push(flags, "output", value);
      i++;
      continue;
    }
    if (arg === "-h") {
      push(flags, "help", "true");
      continue;
    }
    if (!arg.startsWith("--") || arg === "--") {
      positionals.push(arg);
      continue;
    }
    const body = arg.slice(2);
    const eq = body.indexOf("=");
    if (eq >= 0) {
      push(flags, normalize(body.slice(0, eq)), body.slice(eq + 1));
      continue;
    }
    const name = normalize(body);
    const next = argv[i + 1];
    if (
      BOOLEAN_CONTROLS.has(name) ||
      booleanFlags.has(name) ||
      next === undefined ||
      next.startsWith("--")
    ) {
      push(flags, name, "true");
    } else {
      push(flags, name, next);
      i++;
    }
  }
  return { positionals, flags };
}

/** `--full-page` and `--full_page` both address the `full_page` parameter. */
export function normalize(name: string): string {
  return name.replace(/-/g, "_");
}

function push(flags: Map<string, string[]>, name: string, value: string): void {
  const list = flags.get(name) ?? [];
  list.push(value);
  flags.set(name, list);
}

/** Converts raw flag strings into typed parameter values. */
export function coerce(
  definition: ParamDefinition,
  raw: readonly string[],
): unknown {
  const last = raw[raw.length - 1]!;
  switch (definition.type) {
    case "boolean":
      if (last === "true" || last === "1") return true;
      if (last === "false" || last === "0") return false;
      throw new CliUsageError(
        `--${flag(definition.name)} expects true or false.`,
      );
    case "number":
    case "integer": {
      const value = Number(last);
      if (last.trim() === "" || !Number.isFinite(value)) {
        throw new CliUsageError(`--${flag(definition.name)} expects a number.`);
      }
      if (definition.type === "integer" && !Number.isInteger(value)) {
        throw new CliUsageError(
          `--${flag(definition.name)} expects an integer.`,
        );
      }
      return value;
    }
    case "array":
      if (definition.items === "object")
        return raw.map((item) => parseJson(definition.name, item));
      return raw.flatMap((item) =>
        item
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part !== ""),
      );
    case "object":
      return parseJson(definition.name, last);
    default:
      return last;
  }
}

export function flag(name: string): string {
  return name.replace(/_/g, "-");
}

function parseJson(name: string, text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new CliUsageError(`--${flag(name)} expects JSON.`);
  }
}

/** Interprets a free-form value for `request` and `--params` overrides: numbers and booleans stay strings. */
export function looseValue(raw: readonly string[]): unknown {
  return raw.length === 1 ? raw[0] : [...raw];
}
