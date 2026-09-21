import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Lightweight native environment loader for CLI scripts.
 * Searches for local environment files (.env.local, .env) and loads
 * variables into process.env without external dependencies.
 * 
 * Existing process.env variables take precedence over file values.
 */
export function loadScriptEnv() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidateFiles = [
    path.resolve(__dirname, '../admin/.env.local'),
    path.resolve(__dirname, '../admin/.env'),
    path.resolve(__dirname, '../public-website/.env.local'),
    path.resolve(__dirname, '../public-website/.env'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../backend/.env'),
  ];

  for (const envFile of candidateFiles) {
    if (!fs.existsSync(envFile)) continue;
    try {
      const content = fs.readFileSync(envFile, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        // Only set if not already set in process.env
        if (process.env[key] === undefined || process.env[key] === '') {
          process.env[key] = val;
        }
      }
    } catch {
      // Silently proceed if file is unreadable
    }
  }
}

// Auto-execute when imported
loadScriptEnv();
