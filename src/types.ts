export type ParamType =
  "string" | "integer" | "number" | "boolean" | "array" | "object";

export interface ParamDefinition {
  readonly name: string;
  readonly type: ParamType;
  readonly items?: ParamType;
  readonly required: boolean;
  readonly description: string;
  readonly enum?: readonly string[];
  readonly default?: unknown;
}

export interface CommandDefinition {
  readonly command: string;
  readonly operation: string;
  readonly path: string;
  readonly methods: readonly ("GET" | "POST")[];
  readonly summary: string;
  readonly description: string;
  readonly params: readonly ParamDefinition[];
}

/** Process streams and environment, injectable for tests. */
export interface CliIo {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly stdout: {
    write(chunk: string | Uint8Array): unknown;
    isTTY?: boolean;
  };
  readonly stderr: { write(chunk: string): unknown };
  readonly readStdin: () => Promise<string>;
  readonly writeFile: (
    path: string,
    data: string | Uint8Array,
  ) => Promise<void>;
  readonly readFile: (path: string) => Promise<string>;
}
