/// <reference path="../.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime { }
}

interface Env {
	DB: D1Database;
	TWILIO_ACCOUNT_SID?: string;
	TWILIO_AUTH_TOKEN?: string;
	TWILIO_FROM_NUMBER?: string;
	WHATSAPP_TO_NUMBER?: string;
	WORKER_URL?: string;
}
