import {
  VeilleApiError,
  VeilleClient,
  VeilleError,
  type ApiResponse,
  type VeilleClientOptions,
} from "@veille/sdk";

import { coerce, looseValue, normalize, parseArgs } from "./args.js";
import { COMMANDS } from "./commands.js";
import { CliUsageError } from "./errors.js";
import { commandHelp, endpointsList, rootHelp } from "./help.js";
import type { CliIo, CommandDefinition } from "./types.js";
import { VERSION } from "./version.js";

export type ClientFactory = (
  options: VeilleClientOptions,
) => Pick<VeilleClient, "request">;

const DEFAULT_FACTORY: ClientFactory = (options) => new VeilleClient(options);
const CONTROL_FLAGS = new Set([
  "output",
  "method",
  "params",
  "help",
  "compact",
  "raw",
]);

/** Runs the CLI and returns the process exit code: 0 success, 1 API or network failure, 2 usage error. */
export async function runCli(
  argv: readonly string[],
  io: CliIo,
  clientFactory: ClientFactory = DEFAULT_FACTORY,
): Promise<number> {
  try {
    return await dispatch(argv, io, clientFactory);
  } catch (error) {
    if (error instanceof CliUsageError) {
      io.stderr.write(`Error: ${error.message}\n`);
      return 2;
    }
    if (error instanceof VeilleApiError) {
      io.stderr.write(`Veille API error ${error.status}: ${error.message}\n`);
      if (error.responseBody !== undefined)
        io.stderr.write(`${JSON.stringify(error.responseBody, null, 2)}\n`);
      return 1;
    }
    if (error instanceof VeilleError) {
      io.stderr.write(`Error: ${error.message}\n`);
      return error.name.endsWith("ConfigurationError") ? 2 : 1;
    }
    throw error;
  }
}

async function dispatch(
  argv: readonly string[],
  io: CliIo,
  clientFactory: ClientFactory,
): Promise<number> {
  const [first, ...rest] = argv;
  if (
    first === undefined ||
    first === "--help" ||
    first === "-h" ||
    first === "help"
  ) {
    io.stdout.write(rootHelp());
    return first === undefined ? 2 : 0;
  }
  if (first === "--version" || first === "-v") {
    io.stdout.write(`${VERSION}\n`);
    return 0;
  }
  if (first === "endpoints") {
    io.stdout.write(endpointsList(rest[0]));
    return 0;
  }
  if (first === "request") {
    return runRequest(rest, io, clientFactory);
  }
  const command = COMMANDS.find(
    (c) => c.command === first || c.operation === first,
  );
  if (!command) {
    throw new CliUsageError(
      `Unknown command "${first}". Run "veille endpoints" to list commands.`,
    );
  }
  const booleans = new Set(
    command.params.filter((p) => p.type === "boolean").map((p) => p.name),
  );
  const parsed = parseArgs(rest, booleans);
  if (parsed.flags.has("help")) {
    io.stdout.write(commandHelp(command));
    return 0;
  }
  if (parsed.positionals.length > 0) {
    throw new CliUsageError(
      `Unexpected argument "${parsed.positionals[0]}". Pass parameters as --name value.`,
    );
  }
  const params = await readParamsFile(parsed.flags, io);
  for (const [name, raw] of parsed.flags) {
    if (CONTROL_FLAGS.has(name)) continue;
    const definition = command.params.find((p) => p.name === name);
    if (!definition) {
      throw new CliUsageError(
        `Unknown parameter --${name.replace(/_/g, "-")} for ${command.command}. Run "veille ${command.command} --help".`,
      );
    }
    params[name] = coerce(definition, raw);
  }
  const missing = command.params.filter(
    (p) => p.required && params[p.name] === undefined,
  );
  if (missing.length > 0) {
    throw new CliUsageError(
      `Missing required parameter${missing.length > 1 ? "s" : ""}: ${missing.map((p) => `--${p.name.replace(/_/g, "-")}`).join(", ")}.`,
    );
  }
  const method = readMethod(parsed.flags, command);
  const client = createClient(io, clientFactory);
  const response = await client.request(method, command.path, params);
  return writeResponse(response, parsed.flags, io);
}

async function runRequest(
  argv: readonly string[],
  io: CliIo,
  clientFactory: ClientFactory,
): Promise<number> {
  const parsed = parseArgs(argv);
  if (parsed.flags.has("help")) {
    io.stdout.write(
      "Usage:\n  veille request <get|post> <path> [--name value ...] [-o <path|->] [--params <file|->]\n",
    );
    return 0;
  }
  const [method, path, extra] = parsed.positionals;
  if (!method || !path || extra !== undefined) {
    throw new CliUsageError(
      "request needs exactly <get|post> and <path>, e.g. veille request get /v1/usage",
    );
  }
  const verb = method.toUpperCase();
  if (verb !== "GET" && verb !== "POST")
    throw new CliUsageError(`Unsupported method "${method}".`);
  if (!path.startsWith("/"))
    throw new CliUsageError('The path must start with "/".');
  const params = await readParamsFile(parsed.flags, io);
  for (const [name, raw] of parsed.flags) {
    if (!CONTROL_FLAGS.has(name)) params[name] = looseValue(raw);
  }
  const client = createClient(io, clientFactory);
  const response = await client.request(verb, path, params);
  return writeResponse(response, parsed.flags, io);
}

function readMethod(
  flags: Map<string, string[]>,
  command: CommandDefinition,
): "GET" | "POST" {
  const raw = flags.get("method")?.at(-1);
  if (raw === undefined) return command.methods[0]!;
  const method = raw.toUpperCase();
  if (method !== "GET" && method !== "POST")
    throw new CliUsageError(`--method must be get or post.`);
  if (!command.methods.includes(method)) {
    throw new CliUsageError(
      `${command.command} supports ${command.methods.join(", ").toLowerCase()} only.`,
    );
  }
  return method;
}

async function readParamsFile(
  flags: Map<string, string[]>,
  io: CliIo,
): Promise<Record<string, unknown>> {
  const source = flags.get("params")?.at(-1);
  if (source === undefined) return {};
  const text =
    source === "-" ? await io.readStdin() : await io.readFile(source);
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new CliUsageError("--params must contain a JSON object.");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CliUsageError("--params must contain a JSON object.");
  }
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [normalize(k), v]),
  );
}

function createClient(
  io: CliIo,
  clientFactory: ClientFactory,
): Pick<VeilleClient, "request"> {
  const apiKey = io.env.VEILLE_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new CliUsageError(
      "Set the VEILLE_API_KEY environment variable to your Veille API key.",
    );
  }
  const baseUrl = io.env.VEILLE_BASE_URL;
  return clientFactory({ apiKey, ...(baseUrl ? { baseUrl } : {}) });
}

async function writeResponse(
  response: ApiResponse,
  flags: Map<string, string[]>,
  io: CliIo,
): Promise<number> {
  const output = flags.get("output")?.at(-1);
  const compact = flags.has("compact");
  if (response.kind === "json") {
    const text = `${JSON.stringify(response.data, null, compact ? 0 : 2)}\n`;
    if (output === undefined || output === "-") io.stdout.write(text);
    else await io.writeFile(output, text);
    return 0;
  }
  if (output === undefined) {
    if (io.stdout.isTTY) {
      throw new CliUsageError(
        `The response is binary (${response.contentType ?? "unknown type"}). Use -o <file> to save it, or -o - to pipe it.`,
      );
    }
    io.stdout.write(response.bytes);
    return 0;
  }
  if (output === "-") io.stdout.write(response.bytes);
  else {
    await io.writeFile(output, response.bytes);
    io.stderr.write(
      `Saved ${output} (${response.contentType ?? "binary"}, ${response.bytes.length} bytes)\n`,
    );
  }
  return 0;
}
