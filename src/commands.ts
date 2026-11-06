// Generated from the Veille OpenAPI document. Do not edit by hand.

import type { CommandDefinition } from "./types.js";

export const COMMANDS: readonly CommandDefinition[] = [
  {
    command: "intelligence-domain",
    operation: "intelligence_domain",
    path: "/v1/intelligence/domain",
    methods: ["GET"],
    summary: "Domain Validation",
    description:
      "Check any domain instantly. Detects disposable email providers, public webmail, relay services, and education domains. Returns DNS health with MX provider detection, domain history, and optional SSL/TLS certificate transparency.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "The domain to validate. Accepts raw domains (tempmail.org), full URLs (https://www.tempmail.org/page), or domains with www. prefix, all are normalized automatically.",
      },
      {
        name: "certificate_transparency",
        type: "boolean",
        required: false,
        description:
          "Enable Certificate Transparency lookup. Returns SSL/TLS certificate history, current certificate, issuers, and all Subject Alternative Names (SANs) ever associated with the domain. Adds 1-5 seconds o…",
        default: false,
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
      {
        name: "is_async",
        type: "boolean",
        required: false,
        description:
          "Process the request asynchronously: the response is a job_id to poll on /v1/jobs/{id} (see waitForJob).",
        default: false,
      },
      {
        name: "soft_fail",
        type: "boolean",
        required: false,
        description:
          "Return HTTP 200 even when an error occurs; the error is then in the response body.",
        default: false,
      },
    ],
  },
  {
    command: "intelligence-email",
    operation: "intelligence_email",
    path: "/v1/intelligence/email",
    methods: ["GET"],
    summary: "Email Validation",
    description:
      "Validate any email address in a single call. Detects disposable and temporary inboxes, identifies role accounts, public webmail, relay services, and returns a 0-100 risk score. For deep deliverability verification (SMTP check, catch-all de…",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "The email address to validate (e.g. john@example.com). Automatically normalized to lowercase.",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
      {
        name: "is_async",
        type: "boolean",
        required: false,
        description:
          "Process the request asynchronously: the response is a job_id to poll on /v1/jobs/{id} (see waitForJob).",
        default: false,
      },
      {
        name: "soft_fail",
        type: "boolean",
        required: false,
        description:
          "Return HTTP 200 even when an error occurs; the error is then in the response body.",
        default: false,
      },
    ],
  },
  {
    command: "intelligence-emailq",
    operation: "intelligence_emailq",
    path: "/v1/intelligence/emailq",
    methods: ["GET"],
    summary: "Email Qualification",
    description:
      "Deep email deliverability verification. Performs full Email Validation plus SMTP inbox check, catch-all detection, and returns a qualification verdict (valid, invalid, risky, disposable, unknown).",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "The email address to qualify (e.g. john@example.com). Automatically normalized to lowercase.",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
      {
        name: "is_async",
        type: "boolean",
        required: false,
        description:
          "Process the request asynchronously: the response is a job_id to poll on /v1/jobs/{id} (see waitForJob).",
        default: false,
      },
      {
        name: "soft_fail",
        type: "boolean",
        required: false,
        description:
          "Return HTTP 200 even when an error occurs; the error is then in the response body.",
        default: false,
      },
    ],
  },
  {
    command: "intelligence-ip",
    operation: "intelligence_ip",
    path: "/v1/intelligence/ip",
    methods: ["GET"],
    summary: "IP Reputation",
    description:
      "Assess the reputation of any IP address. Detects VPNs, proxies, Tor exit nodes, datacenter hosting, abusive traffic, and bots. Returns geolocation, network owner, and a 0-100 threat score.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "The IP address to analyze (IPv4 or IPv6).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
      {
        name: "is_async",
        type: "boolean",
        required: false,
        description:
          "Process the request asynchronously: the response is a job_id to poll on /v1/jobs/{id} (see waitForJob).",
        default: false,
      },
      {
        name: "soft_fail",
        type: "boolean",
        required: false,
        description:
          "Return HTTP 200 even when an error occurs; the error is then in the response body.",
        default: false,
      },
    ],
  },
  {
    command: "intelligence-phone",
    operation: "intelligence_phone",
    path: "/v1/intelligence/phone",
    methods: ["GET"],
    summary: "Phone Validation",
    description:
      "Validate any phone number in E.164 format. Detects disposable and virtual numbers, identifies carrier and line type (mobile/fixed/VoIP), returns country and timezone, and computes a 0-100 risk score.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description:
          "The phone number to validate in E.164 format (must start with +, e.g. +33612345678).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
      {
        name: "is_async",
        type: "boolean",
        required: false,
        description:
          "Process the request asynchronously: the response is a job_id to poll on /v1/jobs/{id} (see waitForJob).",
        default: false,
      },
      {
        name: "soft_fail",
        type: "boolean",
        required: false,
        description:
          "Return HTTP 200 even when an error occurs; the error is then in the response body.",
        default: false,
      },
    ],
  },
  {
    command: "jobs",
    operation: "jobs",
    path: "/v1/jobs/{id}",
    methods: ["GET"],
    summary: "Jobs",
    description:
      "Poll the status, progress (0–100) and result of a job started with is_async=true. Polling is free. Poll until status is terminal: CompletedJob, Error, NotFound or BadRequest.",
    params: [
      {
        name: "id",
        type: "string",
        required: true,
        description:
          "The job_id returned by an endpoint called with is_async=true.",
      },
    ],
  },
  {
    command: "stats",
    operation: "stats",
    path: "/v1/stats",
    methods: ["GET"],
    summary: "Stats",
    description:
      "Infrastructure health for an engine or endpoint over the last hour. Not scoped to your account or tenant. Enabled per account: HTTP 403 means contact support to activate it.",
    params: [
      {
        name: "engine",
        type: "string",
        required: false,
        description:
          "API family to check, for example vat. Provide at least engine or path.",
      },
      {
        name: "path",
        type: "string",
        required: false,
        description:
          "Specific endpoint to check, for example /v1/vat. If you also pass engine, use an endpoint from that API.",
      },
    ],
  },
  {
    command: "usage",
    operation: "usage",
    path: "/v1/usage",
    methods: ["GET"],
    summary: "Usage",
    description:
      "Retrieve real-time usage statistics and credit balance for your Veille account.",
    params: [],
  },
  {
    command: "vat",
    operation: "vat",
    path: "/v1/vat",
    methods: ["GET"],
    summary: "VAT Validation",
    description:
      "Validate a European VAT number against the VIES database. Returns company name, registered address, and validity status for any EU member state.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "The VAT number to validate (e.g. FR40303265045).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
      {
        name: "is_async",
        type: "boolean",
        required: false,
        description:
          "Process the request asynchronously: the response is a job_id to poll on /v1/jobs/{id} (see waitForJob).",
        default: false,
      },
      {
        name: "soft_fail",
        type: "boolean",
        required: false,
        description:
          "Return HTTP 200 even when an error occurs; the error is then in the response body.",
        default: false,
      },
    ],
  },
  {
    command: "vat-iban",
    operation: "vat_iban",
    path: "/v1/vat/iban",
    methods: ["GET"],
    summary: "IBAN Validation",
    description:
      "Validate any IBAN and retrieve associated bank details. Returns the BIC/SWIFT code, bank name, country, BBAN structural breakdown, and SEPA zone membership.",
    params: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "The IBAN to validate (e.g. FR7630006000011234567890189).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
      {
        name: "is_async",
        type: "boolean",
        required: false,
        description:
          "Process the request asynchronously: the response is a job_id to poll on /v1/jobs/{id} (see waitForJob).",
        default: false,
      },
      {
        name: "soft_fail",
        type: "boolean",
        required: false,
        description:
          "Return HTTP 200 even when an error occurs; the error is then in the response body.",
        default: false,
      },
    ],
  },
  {
    command: "vat-rates",
    operation: "vat_rates",
    path: "/v1/vat/rates",
    methods: ["GET"],
    summary: "Exchange Rates",
    description:
      "Get current ECB exchange rates for any supported base currency. Optionally filter to specific target currencies. Updated daily from the European Central Bank.",
    params: [
      {
        name: "base",
        type: "string",
        required: false,
        description: "Base currency ISO 4217 code (defaults to EUR).",
        default: "EUR",
      },
      {
        name: "symbols",
        type: "string",
        required: false,
        description:
          "Comma-separated target currency codes to filter (e.g. USD,GBP,JPY).",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        description:
          "Comma-separated list of fields to keep in the response, with dot notation for nested fields (e.g. name,location.city). Does not change the credit cost.",
      },
      {
        name: "is_async",
        type: "boolean",
        required: false,
        description:
          "Process the request asynchronously: the response is a job_id to poll on /v1/jobs/{id} (see waitForJob).",
        default: false,
      },
      {
        name: "soft_fail",
        type: "boolean",
        required: false,
        description:
          "Return HTTP 200 even when an error occurs; the error is then in the response body.",
        default: false,
      },
    ],
  },
];
