import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { VeilleClient, type VeilleFetch } from "@veille/sdk";

import { runCli, type ClientFactory } from "../src/cli.js";
import { COMMANDS } from "../src/commands.js";
import type { CliIo } from "../src/types.js";

type Call = { url: URL; init: RequestInit };

function harness(
  respond: () => Response = () => Response.json({ ok: true }),
  env: Record<string, string> = { VEILLE_API_KEY: "test-key" },
) {
  const calls: Call[] = [];
  const out: (string | Uint8Array)[] = [];
  const err: string[] = [];
  const files = new Map<string, string | Uint8Array>();
  const fetch: VeilleFetch = async (input, init) => {
    calls.push({ url: new URL(String(input)), init });
    return respond();
  };
  const factory: ClientFactory = (options) =>
    new VeilleClient({ ...options, fetch });
  const io: CliIo = {
    env,
    stdout: { write: (chunk) => out.push(chunk), isTTY: true },
    stderr: { write: (chunk) => err.push(chunk) },
    readStdin: async () => '{"from_stdin": "yes"}',
    writeFile: async (path, data) => {
      files.set(path, data);
    },
    readFile: async () => "{}",
  };
  return {
    calls,
    out,
    err,
    files,
    io,
    factory,
    text: () => out.map(String).join(""),
  };
}

describe("veille CLI", () => {
  it("prints help and version", async () => {
    const h = harness();
    assert.equal(await runCli(["--help"], h.io, h.factory), 0);
    assert.match(h.text(), /Usage:/);
    assert.match(h.text(), /intelligence-email/);
    const v = harness();
    assert.equal(await runCli(["--version"], v.io, v.factory), 0);
    assert.match(v.text(), /^\d+\.\d+\.\d+/);
  });

  it("prints command help", async () => {
    const h = harness();
    assert.equal(
      await runCli(["intelligence-email", "--help"], h.io, h.factory),
      0,
    );
    assert.match(h.text(), /\/v1\/intelligence\/email/);
  });

  it("runs the featured command", async () => {
    const h = harness(() => Response.json({ hello: "world" }));
    const code = await runCli(
      ["intelligence-email", ...["--query", "jane.doe@example.com"]],
      h.io,
      h.factory,
    );
    assert.equal(code, 0, h.err.join(""));
    assert.deepEqual(JSON.parse(h.text()), { hello: "world" });
    const call = h.calls[0]!;
    assert.equal(call.url.pathname, "/v1/intelligence/email");
    assert.equal(new Headers(call.init.headers).get("x-api-key"), "test-key");
  });

  it("requires the API key", async () => {
    const h = harness(undefined, {});
    assert.equal(
      await runCli(
        ["intelligence-email", ...["--query", "jane.doe@example.com"]],
        h.io,
        h.factory,
      ),
      2,
    );
    assert.match(h.err.join(""), /VEILLE_API_KEY/);
    assert.equal(h.calls.length, 0);
  });

  it("rejects unknown commands and parameters, and missing required ones", async () => {
    const a = harness();
    assert.equal(await runCli(["no-such-command"], a.io, a.factory), 2);
    const b = harness();
    assert.equal(
      await runCli(
        [
          "intelligence-email",
          ...["--query", "jane.doe@example.com"],
          "--not-a-param",
          "x",
        ],
        b.io,
        b.factory,
      ),
      2,
    );
    const c = harness();
    assert.equal(await runCli(["intelligence-email"], c.io, c.factory), 2);
    assert.match(c.err.join(""), /Missing required/);
    assert.equal(a.calls.length + b.calls.length + c.calls.length, 0);
  });

  it("calls any path with request", async () => {
    const h = harness();
    assert.equal(
      await runCli(
        ["request", "get", "/v1/usage", "--foo", "bar"],
        h.io,
        h.factory,
      ),
      0,
    );
    assert.equal(h.calls[0]!.url.pathname, "/v1/usage");
    assert.equal(h.calls[0]!.url.searchParams.get("foo"), "bar");
  });

  it("reads --params from standard input and lets flags override it", async () => {
    const h = harness();
    assert.equal(
      await runCli(
        ["request", "post", "/v1/anything", "--params", "-", "--x", "1"],
        h.io,
        h.factory,
      ),
      0,
    );
    assert.deepEqual(JSON.parse(String(h.calls[0]!.init.body)), {
      from_stdin: "yes",
      x: "1",
    });
  });

  it("refuses to print binary output to a terminal and saves it with -o", async () => {
    const png = () =>
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "image/png" },
      });
    const a = harness(png);
    assert.equal(
      await runCli(["request", "get", "/v1/file"], a.io, a.factory),
      2,
    );
    const b = harness(png);
    assert.equal(
      await runCli(
        ["request", "get", "/v1/file", "-o", "out.png"],
        b.io,
        b.factory,
      ),
      0,
    );
    assert.deepEqual([...(b.files.get("out.png") as Uint8Array)], [1, 2, 3]);
  });

  it("maps API errors to exit code 1", async () => {
    const h = harness(() =>
      Response.json({ error: "Invalid API Key" }, { status: 401 }),
    );
    assert.equal(
      await runCli(["request", "get", "/v1/usage"], h.io, h.factory),
      1,
    );
    assert.match(h.err.join(""), /401: Invalid API Key/);
  });

  it("coerces typed parameters", async () => {
    const command = COMMANDS.find(
      (c) =>
        c.params.some((p) => p.type === "boolean") &&
        c.params.some((p) => p.type === "number"),
    );
    if (!command) return;
    const bool = command.params.find((p) => p.type === "boolean")!;
    const num = command.params.find((p) => p.type === "number")!;
    const required = command.params
      .filter((p) => p.required)
      .flatMap((p) => [
        `--${p.name}`,
        p.type === "number"
          ? "1"
          : p.type === "boolean"
            ? "true"
            : p.type === "object"
              ? "{}"
              : "x",
      ]);
    const h = harness();
    const code = await runCli(
      [
        command.command,
        ...required,
        `--${bool.name.replace(/_/g, "-")}`,
        `--${num.name}`,
        "2.5",
      ],
      h.io,
      h.factory,
    );
    assert.equal(code, 0, h.err.join(""));
    const query = h.calls[0]!.url.searchParams;
    assert.equal(query.get(bool.name), "true");
    assert.equal(query.get(num.name), "2.5");
  });

  it("has one command per endpoint", () => {
    assert.equal(COMMANDS.length, 11);
    assert.equal(new Set(COMMANDS.map((c) => c.command)).size, COMMANDS.length);
  });
});
