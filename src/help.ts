import { flag } from "./args.js";
import { COMMANDS } from "./commands.js";
import type { CommandDefinition, ParamDefinition } from "./types.js";

export function rootHelp(): string {
  const width =
    Math.max(...COMMANDS.map((c) => c.command.length), "endpoints".length) + 2;
  const lines = COMMANDS.map((c) => `  ${c.command.padEnd(width)}${c.summary}`);
  return `Veille CLI — fraud prevention API

Usage:
  veille <command> [--param value ...] [-o <path|->] [--method get|post] [--params <file|->]
  veille request <get|post> <path> [--param value ...]
  veille endpoints [filter]
  veille --help | --version

Commands:
${lines.join("\n")}

  ${"request".padEnd(width)}Call any API path.
  ${"endpoints".padEnd(width)}List commands with their HTTP paths.

Environment:
  VEILLE_API_KEY   API key (required).

Run "veille <command> --help" for the parameters of a command.
`;
}

export function commandHelp(command: CommandDefinition): string {
  const params = command.params.map(formatParam).join("\n");
  return `${command.summary} — ${command.methods.join(" / ")} ${command.path}
${command.description ? `\n${command.description}\n` : ""}
Usage:
  veille ${command.command}${command.params
    .filter((p) => p.required)
    .map((p) => ` --${flag(p.name)} <${p.type}>`)
    .join("")} [options]

Parameters:
${params || "  (none)"}

CLI controls:
  -o, --output <path|->   Write the response to a file, or - for standard output.
  --method <get|post>     HTTP method (default ${command.methods[0]!.toLowerCase()}).
  --params <path|->       Read a JSON object of parameters from a file or standard input; flags override it.
  --compact               Print JSON on one line.
  --help                  Show this help.
`;
}

function formatParam(param: ParamDefinition): string {
  const shape =
    param.type === "boolean"
      ? "[=true|false]"
      : ` <${param.type === "array" ? `${param.items ?? "string"},...` : param.type}>`;
  const notes: string[] = [];
  if (param.required) notes.push("required");
  if (param.enum)
    notes.push(
      `one of: ${param.enum.slice(0, 12).join(", ")}${param.enum.length > 12 ? ", …" : ""}`,
    );
  if (param.default !== undefined)
    notes.push(`default: ${JSON.stringify(param.default)}`);
  const head = `  --${flag(param.name)}${shape}`;
  const description = [
    param.description,
    notes.length ? `(${notes.join("; ")})` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return description ? `${head}\n      ${description}` : head;
}

export function endpointsList(filter: string | undefined): string {
  const needle = filter?.toLowerCase();
  const rows = COMMANDS.filter(
    (c) =>
      !needle ||
      c.command.includes(needle) ||
      c.path.toLowerCase().includes(needle) ||
      c.summary.toLowerCase().includes(needle),
  );
  const width = Math.max(0, ...rows.map((c) => c.command.length)) + 2;
  return (
    rows
      .map(
        (c) =>
          `${c.command.padEnd(width)}${c.methods.join("/").padEnd(10)}${c.path}`,
      )
      .join("\n") + "\n"
  );
}
