import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 54321;
const DB_FILE = path.join(__dirname, 'database.sqlite');
const STORAGE_DIR = path.join(__dirname, 'storage');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// 1. Initialize SQLite Database
const db = new DatabaseSync(DB_FILE);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE (user_id, role)
  );

  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    duration_months INTEGER DEFAULT 12,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    schedule TEXT,
    room_name TEXT,
    start_date TEXT,
    end_date TEXT,
    capacity INTEGER DEFAULT 60,
    status TEXT DEFAULT 'ongoing',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    roll_no TEXT UNIQUE NOT NULL,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    admission_date TEXT DEFAULT (date('now')),
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    qualification TEXT,
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parents (
    id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    occupation TEXT,
    address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parent_students (
    parent_id TEXT REFERENCES parents(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS live_classes (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    scheduled_start TEXT NOT NULL,
    scheduled_end TEXT NOT NULL,
    jitsi_room_name TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    live_class_id TEXT REFERENCES live_classes(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    recorded_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size TEXT,
    download_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recorded_classes (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER DEFAULT 3600,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_option_index INTEGER NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'Medium',
    marks INTEGER DEFAULT 4,
    negative_marks INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 180,
    total_marks INTEGER DEFAULT 300,
    is_published INTEGER DEFAULT 0,
    scheduled_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exam_results (
    id TEXT PRIMARY KEY,
    exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    percentage TEXT,
    accuracy_percentage REAL,
    air_rank INTEGER,
    responses TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id TEXT PRIMARY KEY,
    assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    submission_url TEXT,
    status TEXT DEFAULT 'submitted',
    submitted_at TEXT DEFAULT (datetime('now')),
    grade TEXT,
    feedback TEXT
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    interested_course TEXT,
    message TEXT,
    source TEXT DEFAULT 'Website Form',
    status TEXT DEFAULT 'NEW',
    internal_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS website_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS website_faculty (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    qualification TEXT NOT NULL,
    experience_years TEXT NOT NULL,
    photo_url TEXT,
    biography TEXT,
    display_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS website_testimonials (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    exam TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    photo_url TEXT,
    testimonial TEXT NOT NULL,
    year TEXT DEFAULT '2025',
    is_featured INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS website_success_stories (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    exam TEXT NOT NULL,
    achievement TEXT NOT NULL,
    year TEXT DEFAULT '2025',
    photo_url TEXT,
    story TEXT NOT NULL,
    is_featured INTEGER DEFAULT 1,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS website_faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS website_gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Campus Life',
    image_url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target_type TEXT DEFAULT 'ALL',
    target_id TEXT,
    sent_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    is_urgent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

try { db.exec(`ALTER TABLE exam_results ADD COLUMN percentage TEXT;`); } catch (_) {}
try { db.exec(`ALTER TABLE exam_results ADD COLUMN submitted_at TEXT;`); } catch (_) {}
try { db.exec(`ALTER TABLE exam_results ADD COLUMN responses TEXT;`); } catch (_) {}

// 2. Production Baseline: Operational tables start empty and are populated via Admin workflows.
console.log('[Database] Initialized operational database (clean production baseline).');


// 3. Helper Functions
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, prefer, range',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Expose-Headers': 'Content-Range, Range, Prefer',
    ...headers,
  });
  res.end(JSON.stringify(data));
}

// 4. HTTP Request Router
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, prefer, range',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  try {
    // --- AUTH ROUTES ---
    if (pathname.startsWith('/auth/v1/')) {
      const authEndpoint = pathname.replace('/auth/v1/', '');
      const body = await parseRequestBody(req);

      // Sign In with Password
      if (authEndpoint.startsWith('token') && method === 'POST') {
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        // Query user in profiles
        let profile = db.prepare('SELECT * FROM profiles WHERE lower(email) = ?').get(email);
        
        // Auto-provision if demo login
        if (!profile) {
          const newId = 'usr_' + crypto.randomUUID().slice(0, 8);
          let role = 'student';
          let name = 'Student User';
          if (email.includes('admin') || email.includes('director')) {
            role = 'admin';
            name = 'Administrator';
          } else if (email.includes('faculty') || email.includes('teacher')) {
            role = 'teacher';
            name = 'Faculty Member';
          }
          db.prepare('INSERT INTO profiles (id, email, full_name) VALUES (?, ?, ?)').run(newId, email, name);
          db.prepare('INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)').run(crypto.randomUUID(), newId, role);
          profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(newId);
        }

        const roleRow = db.prepare('SELECT role FROM user_roles WHERE user_id = ?').get(profile.id);
        const role = roleRow ? roleRow.role : 'student';

        const token = 'oci_jwt_' + Buffer.from(JSON.stringify({ sub: profile.id, email: profile.email, role })).toString('base64url');

        return sendJson(res, 200, {
          access_token: token,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'oci_ref_' + crypto.randomBytes(16).toString('hex'),
          user: {
            id: profile.id,
            email: profile.email,
            app_metadata: { provider: 'email', roles: [role] },
            user_metadata: { full_name: profile.full_name, role },
            aud: 'authenticated',
            created_at: profile.created_at,
          },
        });
      }

      // Current User info
      if (authEndpoint === 'user' && (method === 'GET' || method === 'POST')) {
        const authHeader = req.headers.authorization || '';
        let profile;
        if (authHeader.startsWith('Bearer oci_jwt_')) {
          try {
            const payload = JSON.parse(Buffer.from(authHeader.replace('Bearer oci_jwt_', ''), 'base64url').toString());
            profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(payload.sub);
          } catch (e) {}
        }
        if (!profile) {
          profile = db.prepare('SELECT * FROM profiles LIMIT 1').get();
        }
        const roleRow = db.prepare('SELECT role FROM user_roles WHERE user_id = ?').get(profile.id);
        const role = roleRow ? roleRow.role : 'student';

        return sendJson(res, 200, {
          id: profile.id,
          email: profile.email,
          app_metadata: { roles: [role] },
          user_metadata: { full_name: profile.full_name, role },
          aud: 'authenticated',
          created_at: profile.created_at,
        });
      }

      // Logout
      if (authEndpoint === 'logout' && method === 'POST') {
        return sendJson(res, 200, {});
      }

      // Verify OTP
      if (authEndpoint === 'verify' && method === 'POST') {
        const phone = body.phone || '+91 99999 99999';
        let profile = db.prepare('SELECT * FROM profiles WHERE phone = ?').get(phone);
        if (!profile) {
          profile = db.prepare('SELECT * FROM profiles WHERE lower(email) LIKE ?').get('%student%') || db.prepare('SELECT * FROM profiles LIMIT 1').get();
        }
        const roleRow = db.prepare('SELECT role FROM user_roles WHERE user_id = ?').get(profile.id);
        const role = roleRow ? roleRow.role : 'student';
        const token = 'oci_jwt_' + Buffer.from(JSON.stringify({ sub: profile.id, email: profile.email, role })).toString('base64url');

        return sendJson(res, 200, {
          access_token: token,
          token_type: 'bearer',
          user: {
            id: profile.id,
            email: profile.email,
            phone: profile.phone,
            app_metadata: { roles: [role] },
            user_metadata: { full_name: profile.full_name, role },
          },
        });
      }

      // Default auth response
      return sendJson(res, 200, { success: true });
    }

    // --- RPC STORED PROCEDURES ---
    if (pathname.startsWith('/rest/v1/rpc/')) {
      const funcName = pathname.replace('/rest/v1/rpc/', '');
      const body = await parseRequestBody(req);

      if (funcName === 'get_public_website_bundle') {
        const rows = db.prepare('SELECT key, value FROM website_content').all();
        const bundle = {};
        for (const r of rows) {
          try { bundle[r.key] = JSON.parse(r.value); } catch (e) { bundle[r.key] = r.value; }
        }
        return sendJson(res, 200, bundle);
      }

      if (funcName === 'upsert_website_section') {
        const { p_key, p_value } = body;
        const jsonStr = typeof p_value === 'string' ? p_value : JSON.stringify(p_value);
        db.prepare(`
          INSERT INTO website_content (key, value, updated_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
        `).run(p_key, jsonStr);
        return sendJson(res, 200, { success: true, key: p_key, updated_at: new Date().toISOString() });
      }

      if (funcName === 'is_admin') {
        return sendJson(res, 200, true);
      }

      return sendJson(res, 200, { success: true });
    }

    // --- EDGE FUNCTIONS ---
    if (pathname.startsWith('/functions/v1/')) {
      const funcName = pathname.replace('/functions/v1/', '');
      const body = await parseRequestBody(req);

      if (funcName === 'create-live-room') {
        const { class_id, role } = body;
        const roomName = `OCI_ROOM_${class_id || 'LIVE_LECTURE'}`;
        return sendJson(res, 200, {
          room_name: roomName,
          is_active: true,
          role: role || 'student',
          token: `jitsi_token_${role || 'student'}_${Date.now()}`,
          server_url: 'https://meet.jit.si',
        });
      }

      if (funcName === 'send-notification') {
        const { title, body: notifBody, target_type, target_id } = body;
        const notifId = 'notif_' + crypto.randomUUID().slice(0, 8);
        db.prepare('INSERT INTO notifications (id, title, body, target_type, target_id) VALUES (?, ?, ?, ?, ?)')
          .run(notifId, title || 'Notice', notifBody || '', target_type || 'ALL', target_id || null);
        
        return sendJson(res, 200, {
          success: true,
          delivered: true,
          id: notifId,
          title,
          body: notifBody,
          target_type: target_type || 'ALL',
          sent_at: new Date().toISOString(),
        });
      }
    }

    // --- STORAGE OBJECTS ---
    if (pathname.startsWith('/storage/v1/object/')) {
      const parts = pathname.replace('/storage/v1/object/', '').split('/');
      const isPublic = parts[0] === 'public';
      const bucket = isPublic ? parts[1] : parts[0];
      const filePath = isPublic ? parts.slice(2).join('/') : parts.slice(1).join('/');

      const targetDir = path.join(STORAGE_DIR, bucket);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      const fullPath = path.join(targetDir, path.basename(filePath));

      if (method === 'POST' || method === 'PUT') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => {
          const buffer = Buffer.concat(chunks);
          fs.writeFileSync(fullPath, buffer);
          return sendJson(res, 200, {
            Key: `${bucket}/${path.basename(filePath)}`,
            publicUrl: `http://localhost:${PORT}/storage/v1/object/public/${bucket}/${path.basename(filePath)}`,
          });
        });
        return;
      }

      if (method === 'GET') {
        if (fs.existsSync(fullPath)) {
          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Access-Control-Allow-Origin': '*',
          });
          return fs.createReadStream(fullPath).pipe(res);
        } else {
          return sendJson(res, 404, { error: 'File not found' });
        }
      }
    }

    // --- POSTGREST REST API (/rest/v1/<table_name>) ---
    if (pathname.startsWith('/rest/v1/')) {
      const tableName = pathname.replace('/rest/v1/', '').split('/')[0];
      if (!tableName) return sendJson(res, 400, { error: 'Table name required' });

      // GET: Query Records
      if (method === 'GET') {
        let sql = `SELECT * FROM ${tableName}`;
        const params = [];
        const conditions = [];

        for (const [key, value] of parsedUrl.searchParams.entries()) {
          if (['select', 'order', 'limit', 'offset'].includes(key)) continue;

          // Parse PostgREST filter: col=eq.val, col=ilike.%val%, col=in.(a,b)
          if (value.startsWith('eq.')) {
            conditions.push(`${key} = ?`);
            params.push(value.replace('eq.', ''));
          } else if (value.startsWith('neq.')) {
            conditions.push(`${key} != ?`);
            params.push(value.replace('neq.', ''));
          } else if (value.startsWith('ilike.')) {
            conditions.push(`${key} LIKE ?`);
            params.push(value.replace('ilike.', '').replace(/\*/g, '%'));
          } else if (value.startsWith('in.')) {
            const raw = value.replace('in.(', '').replace(')', '');
            const vals = raw.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
            conditions.push(`${key} IN (${vals.map(() => '?').join(',')})`);
            params.push(...vals);
          } else if (value.startsWith('is.')) {
            const v = value.replace('is.', '');
            conditions.push(`${key} IS ${v.toUpperCase()}`);
          }
        }

        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }

        const order = parsedUrl.searchParams.get('order');
        if (order) {
          const [col, dir] = order.split('.');
          sql += ` ORDER BY ${col} ${dir && dir.toLowerCase() === 'desc' ? 'DESC' : 'ASC'}`;
        }

        const limit = parsedUrl.searchParams.get('limit');
        if (limit) {
          sql += ` LIMIT ${parseInt(limit, 10)}`;
        }

        const offset = parsedUrl.searchParams.get('offset');
        if (offset) {
          sql += ` OFFSET ${parseInt(offset, 10)}`;
        }

        const rows = db.prepare(sql).all(...params);

        // Format special JSON fields
        for (const r of rows) {
          if (r.options && typeof r.options === 'string') {
            try { r.options = JSON.parse(r.options); } catch (e) {}
          }
          if (r.value && typeof r.value === 'string') {
            try { r.value = JSON.parse(r.value); } catch (e) {}
          }
        }

        const prefer = req.headers.prefer || '';
        if (prefer.includes('count=exact')) {
          const countSql = `SELECT COUNT(*) as cnt FROM ${tableName}` + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
          const total = db.prepare(countSql).get(...params).cnt;
          res.setHeader('Content-Range', `0-${rows.length}/${total}`);
        }

        return sendJson(res, 200, rows);
      }

      // POST: Insert Record(s)
      if (method === 'POST') {
        const body = await parseRequestBody(req);
        const records = Array.isArray(body) ? body : [body];
        const inserted = [];

        for (const rec of records) {
          if (!rec.id) rec.id = `${tableName.slice(0, 3)}_${Date.now()}_${crypto.randomUUID().slice(0, 4)}`;
          
          // Stringify JSON fields if needed
          const recordToSave = { ...rec };
          if (recordToSave.options && typeof recordToSave.options !== 'string') {
            recordToSave.options = JSON.stringify(recordToSave.options);
          }
          if (recordToSave.value && typeof recordToSave.value !== 'string') {
            recordToSave.value = JSON.stringify(recordToSave.value);
          }

          const cols = Object.keys(recordToSave);
          const placeholders = cols.map(() => '?').join(', ');
          const values = Object.values(recordToSave);

          const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`;
          db.prepare(sql).run(...values);
          inserted.push(rec);
        }

        const prefer = req.headers.prefer || '';
        if (prefer.includes('return=representation') || prefer.includes('return=minimal')) {
          return sendJson(res, 201, Array.isArray(body) ? inserted : inserted[0]);
        }
        return sendJson(res, 201, inserted);
      }

      // PATCH: Update Record(s)
      if (method === 'PATCH') {
        const body = await parseRequestBody(req);
        const updates = [];
        const params = [];

        for (const [k, v] of Object.entries(body)) {
          updates.push(`${k} = ?`);
          params.push(typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
        }

        const conditions = [];
        for (const [key, value] of parsedUrl.searchParams.entries()) {
          if (value.startsWith('eq.')) {
            conditions.push(`${key} = ?`);
            params.push(value.replace('eq.', ''));
          }
        }

        const sql = `UPDATE ${tableName} SET ${updates.join(', ')}` + (conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '');
        db.prepare(sql).run(...params);

        // Fetch updated
        const selectSql = `SELECT * FROM ${tableName}` + (conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '');
        const updatedRows = db.prepare(selectSql).all(...params.slice(updates.length));

        return sendJson(res, 200, updatedRows);
      }

      // DELETE: Delete Record(s)
      if (method === 'DELETE') {
        const conditions = [];
        const params = [];
        for (const [key, value] of parsedUrl.searchParams.entries()) {
          if (value.startsWith('eq.')) {
            conditions.push(`${key} = ?`);
            params.push(value.replace('eq.', ''));
          }
        }

        const sql = `DELETE FROM ${tableName}` + (conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '');
        db.prepare(sql).run(...params);
        return sendJson(res, 200, { success: true });
      }
    }

    // Fallback 404
    sendJson(res, 404, { error: 'Route not found: ' + pathname });
  } catch (err) {
    console.error(`[Server Error] ${method} ${pathname}:`, err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`[Intuition Backend Service] Running at http://localhost:${PORT}`);
  console.log(`[Database] SQLite WAL DB active at ${DB_FILE}`);
  console.log(`[Storage] Local storage active at ${STORAGE_DIR}`);
});
