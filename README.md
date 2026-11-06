# Veille CLI

Official command-line interface for the [Veille](https://www.veille.io) fraud prevention API.

Validate emails, domains, IPs, VAT numbers and IBANs in milliseconds to block fake sign-ups, bots and fraud.

Every documented endpoint is a command — **11 commands** — and `request` reaches any other path. JSON responses are pretty-printed; files (images, PDFs…) are saved with `-o`.

## Requirements

- Node.js 20 or newer
- a Veille [API key](https://app.veille.io)

## Install

```sh
npm install --global @veilleio/cli
veille --help
```

Or run it without installing:

```sh
npx @veilleio/cli --help
```

## Configure your API key

The CLI reads the key from the environment; it does not load `.env` files.

```sh
export VEILLE_API_KEY="YOUR_API_KEY"
```

PowerShell:

```powershell
$env:VEILLE_API_KEY = "YOUR_API_KEY"
```

## Usage

```sh
veille intelligence-email --query jane.doe@example.com
```

Parameters use the names of the [API reference](https://app.veille.io/openapi) as flags: `--full-page` and `--full_page` are equivalent. Boolean flags can be bare (`--flag`) or explicit (`--flag=false`); array parameters accept commas or repeated flags.

```sh
veille intelligence-email --help     # parameters of one command
veille endpoints                # every command and its HTTP path
veille endpoints search         # filter the list
```

### JSON parameters

```sh
echo '{"query": "jane.doe@example.com"}' | veille intelligence-email --params -
veille intelligence-email --params params.json --compact
```

Flags override values read with `--params`.

### Any endpoint

```sh
veille request get /v1/usage
veille request post /v1/some/new/endpoint --params body.json
```

### Pipe into jq

```sh
veille intelligence-email --query jane.doe@example.com | jq .
```

## Exit codes

| Code | Meaning                                                                             |
| ---- | ----------------------------------------------------------------------------------- |
| `0`  | Success.                                                                            |
| `1`  | The API returned an error (details on standard error) or the network failed.        |
| `2`  | Invalid usage: unknown command or parameter, missing API key or required parameter. |

## Commands

| Command               | HTTP                          | Description                                                                                                              |
| --------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `intelligence-domain` | GET `/v1/intelligence/domain` | Check any domain instantly. Detects disposable email providers, public webmail, relay services, and education domains.…  |
| `intelligence-email`  | GET `/v1/intelligence/email`  | Validate any email address in a single call. Detects disposable and temporary inboxes, identifies role accounts, public… |
| `intelligence-emailq` | GET `/v1/intelligence/emailq` | Deep email deliverability verification. Performs full Email Validation plus SMTP inbox check, catch-all detection, and…  |
| `intelligence-ip`     | GET `/v1/intelligence/ip`     | Assess the reputation of any IP address. Detects VPNs, proxies, Tor exit nodes, datacenter hosting, abusive traffic, an… |
| `intelligence-phone`  | GET `/v1/intelligence/phone`  | Validate any phone number in E.164 format. Detects disposable and virtual numbers, identifies carrier and line type (mo… |
| `jobs`                | GET `/v1/jobs/{id}`           | Poll the status, progress (0–100) and result of a job started with is_async=true. Polling is free. Poll until status is… |
| `stats`               | GET `/v1/stats`               | Infrastructure health for an engine or endpoint over the last hour. Not scoped to your account or tenant. Enabled per a… |
| `usage`               | GET `/v1/usage`               | Retrieve real-time usage statistics and credit balance for your Veille account.                                          |
| `vat`                 | GET `/v1/vat`                 | Validate a European VAT number against the VIES database. Returns company name, registered address, and validity status… |
| `vat-iban`            | GET `/v1/vat/iban`            | Validate any IBAN and retrieve associated bank details. Returns the BIC/SWIFT code, bank name, country, BBAN structural… |
| `vat-rates`           | GET `/v1/vat/rates`           | Get current ECB exchange rates for any supported base currency. Optionally filter to specific target currencies. Update… |

## Built on the SDK

The CLI uses the official [Node.js SDK](https://github.com/veilleio/veille-node) (`@veilleio/sdk`). Use the SDK directly for programmatic access.

## License

MIT — see [LICENSE](LICENSE).
