// Ambient type declarations for Supabase Edge Functions in IDE
declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response> | Response, options?: any): void;
}

declare namespace Deno {
  export function serve(handler: (req: Request) => Promise<Response> | Response, options?: any): void;
}
