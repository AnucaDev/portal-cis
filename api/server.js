// ============================================================
//  CIS API – Servidor Express
//  Endpoints: health | registro | login | profesional | pacientes | consentimientos
// ============================================================

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const mailer  = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3001;

// ------------------------------------------------------------
//  Middlewares
// ------------------------------------------------------------
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: false,
}));

// Servir archivos estáticos del proyecto (html, css, js, imagenes)
const ROOT = path.resolve(__dirname, '..');
// Primero servir directorios desde la raíz (imagenes, css, js)
app.use('/css',       express.static(path.join(ROOT, 'css')));
app.use('/js',        express.static(path.join(ROOT, 'js')));
app.use('/imagenes',  express.static(path.join(ROOT, 'imagenes')));
// Luego servir HTML desde la carpeta html
app.use(express.static(path.join(ROOT, 'html')));
// Ruta raíz → index.html
app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'html', 'index.html')));

// ------------------------------------------------------------
//  Pool de conexiones MySQL
// ------------------------------------------------------------
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'cis_madrid',
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4',
});

// Verificar conexión al arrancar
pool.getConnection()
  .then(conn => {
    console.log('✅  Conectado a MySQL →', process.env.DB_NAME || 'cis_madrid');
    conn.release();
  })
  .catch(err => {
    console.error('❌  Error de conexión MySQL:', err.message);
    console.error('    Asegúrate de que XAMPP está arrancado y la BD cis_madrid existe.');
  });

// ------------------------------------------------------------
//  Transporter de email (Gmail SMTP)
// ------------------------------------------------------------
const transport = mailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar conexión SMTP al arrancar
transport.verify()
  .then(() => console.log('✅  SMTP Gmail conectado →', process.env.SMTP_USER))
  .catch(err => console.warn('⚠️  SMTP no disponible:', err.message));

/**
 * Envía el email de solicitud de consentimiento al tutor legal.
 */
async function sendConsentEmail({ emailTutor, nombreTutor, nombrePaciente, nombreProfesional, token }) {
  const APP_URL = process.env.APP_URL || 'http://localhost:3001';
  const urlPortal = `${APP_URL}/html/portal.html`;

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { font-family:'Segoe UI',Arial,sans-serif; background:#f4f7f9; margin:0; padding:20px; }
    .card { background:white; max-width:560px; margin:0 auto; border-radius:10px;
            box-shadow:0 2px 12px rgba(0,0,0,.1); overflow:hidden; }
    .header { background:linear-gradient(135deg,#4A90A4,#7EC8A4); padding:28px 32px; text-align:center; }
    .header h1 { color:white; margin:0; font-size:24px; letter-spacing:2px; }
    .header p  { color:rgba(255,255,255,.85); margin:6px 0 0; font-size:14px; }
    .body { padding:28px 32px; color:#333; line-height:1.7; }
    .highlight { background:#f0f9ff; border-left:4px solid #4A90A4;
                 padding:14px 18px; border-radius:0 6px 6px 0; margin:20px 0; }
    .highlight p { margin:4px 0; }
    .btn-row { text-align:center; margin:28px 0 10px; }
    .btn { display:inline-block; padding:13px 30px; border-radius:6px;
           font-size:15px; font-weight:600; text-decoration:none; }
    .btn-accept { background:#27ae60; color:white; }
    .footer { background:#f9f9f9; padding:16px 32px; text-align:center;
              font-size:12px; color:#999; border-top:1px solid #eee; }
  </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h1>CIS Madrid</h1>
        <p>Centro de Intervención Psicoeducativa</p>
      </div>
      <div class="body">
        <p>Hola, <strong>${nombreTutor || 'tutor/a legal'}</strong>.</p>
        <p>La profesional del centro <strong>${nombreProfesional}</strong> ha creado el perfil clínico de <strong>${nombrePaciente}</strong> y solicita tu autorización para vincularlo a tu cuenta familiar.</p>

        <div class="highlight">
          <p><strong>Paciente:</strong> ${nombrePaciente}</p>
          <p><strong>Profesional:</strong> ${nombreProfesional}</p>
          <p><strong>Centro:</strong> CIS Madrid</p>
        </div>

        <p>Para <strong>aceptar o rechazar</strong> esta solicitud, inicia sesión en tu portal de familias y revisa el apartado <em>"Solicitudes pendientes"</em>:</p>

        <div class="btn-row">
          <a href="${urlPortal}" class="btn btn-accept">✅ Ir al portal de familias</a>
        </div>

        <p style="font-size:13px;color:#888;margin-top:20px;">
          Si no reconoces esta solicitud o no tienes relación con el CIS Madrid,
          puedes ignorar este mensaje.<br>
          Referencia: <code style="font-size:11px;">${token.slice(0, 16)}...</code>
        </p>
      </div>
      <div class="footer">
        CIS Madrid · cismadrid23@gmail.com<br>
        Este es un mensaje automático, por favor no respondas a este email.
      </div>
    </div>
  </body>
  </html>`;

  await transport.sendMail({
    from:    process.env.EMAIL_FROM || 'CIS Madrid <cismadrid23@gmail.com>',
    to:      emailTutor,
    subject: `📋 Solicitud de consentimiento para ${nombrePaciente} – CIS Madrid`,
    html,
  });

  console.log(`[EMAIL] Consentimiento enviado a ${emailTutor} (paciente: ${nombrePaciente})`);
}

// ------------------------------------------------------------
//  Utilidades
// ------------------------------------------------------------

/** Respuesta de error estandarizada */
function errorRes(res, status, mensaje) {
  return res.status(status).json({ ok: false, mensaje });
}

/** Respuesta de éxito estandarizada */
function okRes(res, data) {
  return res.status(200).json({ ok: true, ...data });
}

/** Validación básica de email */
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Validación de teléfono español (se aceptan fijos y móviles) */
function telefonoValido(tel) {
  const limpio = tel.replace(/\s+/g, '');
  const t = limpio.startsWith('+') ? limpio : '+34' + limpio;
  return /^\+34(?:[6789]\d{8}|\d{9})$/.test(t);
}

// ------------------------------------------------------------
//  GET /api/health  – Estado de la API
// ------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return okRes(res, { mensaje: 'API CIS funcionando correctamente', bd: 'conectada' });
  } catch {
    return res.status(503).json({ ok: false, mensaje: 'API activa pero sin conexión a la BD' });
  }
});

// ------------------------------------------------------------
//  POST /api/registro  – Crear nueva cuenta de familia
// ------------------------------------------------------------
app.post('/api/registro', async (req, res) => {
  const { nombre, apellido, email, telefono, password } = req.body;

  // --- Validaciones de entrada ---
  if (!nombre || !apellido || !email || !telefono || !password) {
    return errorRes(res, 400, 'Todos los campos son obligatorios.');
  }
  if (nombre.trim().length < 2 || apellido.trim().length < 2) {
    return errorRes(res, 400, 'El nombre y el apellido deben tener al menos 2 caracteres.');
  }
  if (!emailValido(email)) {
    return errorRes(res, 400, 'El correo electrónico no tiene un formato válido.');
  }
  if (!telefonoValido(telefono)) {
    return errorRes(res, 400, 'El teléfono no tiene un formato español válido (ej: 612345678 o 912345678).');
  }
  if (password.length < 8) {
    return errorRes(res, 400, 'La contraseña debe tener al menos 8 caracteres.');
  }

  // Normalizar teléfono
  let tlfNorm = telefono.replace(/\s+/g, '');
  if (!tlfNorm.startsWith('+')) tlfNorm = '+34' + tlfNorm;

  try {
    // Comprobar si el email ya existe
    const [filas] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );
    if (filas.length > 0) {
      return errorRes(res, 409, 'Ya existe una cuenta con ese correo electrónico. ¿Quieres iniciar sesión?');
    }

    // Hashear contraseña
    const hash = await bcrypt.hash(password, 12);

    // Insertar usuario
    const [resultado] = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol)
       VALUES (?, ?, ?, ?, ?, 'familia')`,
      [nombre.trim(), apellido.trim(), email.toLowerCase(), tlfNorm, hash]
    );

    const nuevoId = resultado.insertId;

    console.log(`[REGISTRO] Nuevo usuario #${nuevoId} – ${email}`);

    return okRes(res, {
      mensaje: 'Cuenta creada correctamente.',
      usuario: {
        id:       nuevoId,
        nombre:   nombre.trim(),
        apellido: apellido.trim(),
        email:    email.toLowerCase(),
        telefono: tlfNorm,
        rol:      'familia',
      },
    });

  } catch (err) {
    console.error('[REGISTRO] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor. Inténtalo de nuevo.');
  }
});

// ------------------------------------------------------------
//  POST /api/login  – Iniciar sesión
// ------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorRes(res, 400, 'El correo y la contraseña son obligatorios.');
  }
  if (!emailValido(email)) {
    return errorRes(res, 400, 'El correo electrónico no tiene un formato válido.');
  }

  try {
    // Buscar usuario
    const [filas] = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, password_hash, rol, activo FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );

    if (filas.length === 0) {
      // Mensaje genérico para no revelar si el email existe
      return errorRes(res, 401, 'Correo o contraseña incorrectos.');
    }

    const usuario = filas[0];

    if (!usuario.activo) {
      return errorRes(res, 403, 'Tu cuenta está desactivada. Contacta con el centro.');
    }

    // Verificar contraseña
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordCorrecta) {
      return errorRes(res, 401, 'Correo o contraseña incorrectos.');
    }

    console.log(`[LOGIN] Usuario #${usuario.id} – ${usuario.email}`);

    return okRes(res, {
      mensaje: 'Inicio de sesión correcto.',
      usuario: {
        id:       usuario.id,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
        email:    usuario.email,
        telefono: usuario.telefono,
        rol:      usuario.rol,
      },
    });

  } catch (err) {
    console.error('[LOGIN] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor. Inténtalo de nuevo.');
  }
});


// ============================================================
//  POST /api/registro-profesional  – Alta de profesional con código
// ============================================================
app.post('/api/registro-profesional', async (req, res) => {
  const { nombre, email, telefono, password, codigoAcceso } = req.body;

  if (!nombre || !email || !telefono || !password || !codigoAcceso) {
    return errorRes(res, 400, 'Todos los campos son obligatorios.');
  }
  if (codigoAcceso !== (process.env.CODIGO_PROFESIONAL || 'CIS-PRO-2026')) {
    return errorRes(res, 403, 'Código de acceso incorrecto. Contacta con la dirección del centro.');
  }
  if (!emailValido(email)) {
    return errorRes(res, 400, 'El correo electrónico no tiene un formato válido.');
  }
  if (!telefonoValido(telefono)) {
    return errorRes(res, 400, 'El teléfono no tiene un formato español válido (ej: 612345678 o 912345678).');
  }
  if (password.length < 8) {
    return errorRes(res, 400, 'La contraseña debe tener al menos 8 caracteres.');
  }

  let tlfNorm = telefono.replace(/\s+/g, '');
  if (!tlfNorm.startsWith('+')) tlfNorm = '+34' + tlfNorm;

  try {
    const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase()]);
    if (existe.length > 0) {
      return errorRes(res, 409, 'Ya existe una cuenta con ese correo electrónico.');
    }

    const hash = await bcrypt.hash(password, 12);
    const [resultado] = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol) VALUES (?, '', ?, ?, ?, 'profesional')`,
      [nombre.trim(), email.toLowerCase(), tlfNorm, hash]
    );

    console.log(`[REGISTRO-PRO] Nuevo profesional #${resultado.insertId} – ${email}`);
    return okRes(res, {
      mensaje: 'Cuenta de profesional creada correctamente.',
      usuario: { id: resultado.insertId, nombre: nombre.trim(), email: email.toLowerCase(), telefono: tlfNorm, rol: 'profesional' },
    });
  } catch (err) {
    console.error('[REGISTRO-PRO] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  POST /api/login-profesional  – Login exclusivo para profesionales
// ============================================================
app.post('/api/login-profesional', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return errorRes(res, 400, 'El correo y la contraseña son obligatorios.');
  if (!emailValido(email)) return errorRes(res, 400, 'Correo no válido.');

  try {
    const [filas] = await pool.query(
      'SELECT id, nombre, email, telefono, password_hash, rol, activo FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );
    if (filas.length === 0) return errorRes(res, 401, 'Correo o contraseña incorrectos.');

    const u = filas[0];
    if (!u.activo) return errorRes(res, 403, 'Tu cuenta está desactivada. Contacta con la dirección.');
    if (u.rol !== 'profesional') return errorRes(res, 403, 'Este acceso es exclusivo para profesionales del centro.');

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return errorRes(res, 401, 'Correo o contraseña incorrectos.');

    console.log(`[LOGIN-PRO] Profesional #${u.id} – ${u.email}`);
    return okRes(res, {
      mensaje: 'Acceso correcto.',
      usuario: { id: u.id, nombre: u.nombre, email: u.email, telefono: u.telefono, rol: u.rol },
    });
  } catch (err) {
    console.error('[LOGIN-PRO] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  POST /api/pacientes  – Crear perfil de niño (profesional)
// ============================================================
app.post('/api/pacientes', async (req, res) => {
  const { usuarioId, rol, nombre, fechaNacimiento, genero, diagnostico, observaciones, emailTutor, nombreTutor } = req.body;

  if (rol === 'familia') {
    if (!nombre) return errorRes(res, 400, 'El nombre del paciente es obligatorio.');
    try {
      const [pacResult] = await pool.query(
        `INSERT INTO pacientes (nombre, fecha_nacimiento, genero, diagnostico_principal, tutor_usuario_id)
         VALUES (?, ?, ?, ?, ?)`,
        [nombre.trim(), fechaNacimiento || null, genero || null, diagnostico || null, usuarioId]
      );
      return okRes(res, { mensaje: 'Paciente creado correctamente', pacienteId: pacResult.insertId });
    } catch (err) {
      console.error(err);
      return errorRes(res, 500, 'Error al crear el perfil del paciente');
    }
  }

  if (rol !== 'profesional') return errorRes(res, 403, 'Rol no autorizado para crear perfiles de pacientes.');
  if (!nombre || !emailTutor) return errorRes(res, 400, 'El nombre del niño y el email del tutor son obligatorios.');
  if (!emailValido(emailTutor)) return errorRes(res, 400, 'El email del tutor no tiene un formato válido.');

  try {
    // Crear el paciente
    const [pacResult] = await pool.query(
      `INSERT INTO pacientes (nombre, fecha_nacimiento, genero, diagnostico_principal, observaciones, profesional_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre.trim(), fechaNacimiento || null, genero || null, diagnostico || null, observaciones || null, usuarioId]
    );
    const pacienteId = pacResult.insertId;

    // Generar token de consentimiento
    const token = crypto.randomBytes(32).toString('hex');

    // Crear solicitud de consentimiento
    await pool.query(
      `INSERT INTO consentimientos (paciente_id, email_tutor, nombre_tutor, token) VALUES (?, ?, ?, ?)`,
      [pacienteId, emailTutor.toLowerCase(), nombreTutor || null, token]
    );

    // Si el tutor ya tiene cuenta, vincular visualmente (el token queda pendiente hasta que acepte)
    const [tutorExiste] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [emailTutor.toLowerCase()]);

    console.log(`[PACIENTE] Creado #${pacienteId} por profesional #${usuarioId}. Token: ${token}`);

    // ── Enviar email de consentimiento al tutor ──────────────
    try {
      // Obtener el nombre del profesional
      const [proRows] = await pool.query('SELECT nombre FROM usuarios WHERE id = ?', [usuarioId]);
      const nombreProfesional = proRows.length > 0 ? proRows[0].nombre : 'Un profesional del centro';

      await sendConsentEmail({
        emailTutor:         emailTutor.toLowerCase(),
        nombreTutor:        nombreTutor || '',
        nombrePaciente:     nombre.trim(),
        nombreProfesional,
        token,
      });
    } catch (mailErr) {
      // El email falla silenciosamente — el paciente ya quedó creado en BD
      console.warn('[EMAIL] Error al enviar consentimiento:', mailErr.message);
    }

    return okRes(res, {
      mensaje: tutorExiste.length > 0
        ? 'Perfil creado. El tutor verá la solicitud en su portal.'
        : 'Perfil creado. La solicitud quedará pendiente hasta que el tutor se registre.',
      pacienteId,
      token,
    });
  } catch (err) {
    console.error('[PACIENTES] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/pacientes  – Listar pacientes del profesional
// ============================================================
app.get('/api/pacientes', async (req, res) => {
  const { usuarioId, rol } = req.query;
  if (rol !== 'profesional') return errorRes(res, 403, 'Acceso denegado.');

  try {
    const [pacientes] = await pool.query(
      `SELECT p.id, p.nombre, p.fecha_nacimiento, p.genero, p.diagnostico_principal,
              p.created_at, u.nombre AS tutor_nombre, u.email AS tutor_email,
              c.estado AS consentimiento_estado
       FROM pacientes p
       LEFT JOIN consentimientos c ON c.paciente_id = p.id
       LEFT JOIN usuarios u ON u.id = p.tutor_usuario_id
       WHERE p.profesional_id = ? AND p.activo = 1
       ORDER BY p.created_at DESC`,
      [usuarioId]
    );
    return okRes(res, { pacientes });
  } catch (err) {
    console.error('[PACIENTES-LIST] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/consentimientos/pendientes  – Para el portal de familias
// ============================================================
app.get('/api/consentimientos/pendientes', async (req, res) => {
  const { usuarioId } = req.query;
  if (!usuarioId) return errorRes(res, 400, 'usuarioId requerido.');

  try {
    // Obtener email del usuario
    const [uRows] = await pool.query('SELECT email FROM usuarios WHERE id = ?', [usuarioId]);
    if (uRows.length === 0) return errorRes(res, 404, 'Usuario no encontrado.');

    const email = uRows[0].email;

    const [solicitudes] = await pool.query(
      `SELECT c.id, c.token, c.estado, c.fecha_envio,
              p.nombre AS paciente_nombre, p.fecha_nacimiento, p.diagnostico_principal,
              u.nombre AS profesional_nombre
       FROM consentimientos c
       JOIN pacientes p ON p.id = c.paciente_id
       JOIN usuarios u ON u.id = p.profesional_id
       WHERE c.email_tutor = ? AND c.estado = 'pendiente'
       ORDER BY c.fecha_envio DESC`,
      [email]
    );
    return okRes(res, { solicitudes });
  } catch (err) {
    console.error('[CONSENT-PEND] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  POST /api/consentimientos/:token/responder  – Aceptar o rechazar
// ============================================================
app.post('/api/consentimientos/:token/responder', async (req, res) => {
  const { token } = req.params;
  const { usuarioId, respuesta } = req.body; // respuesta: 'aceptado' | 'rechazado'

  if (!['aceptado', 'rechazado'].includes(respuesta)) {
    return errorRes(res, 400, 'La respuesta debe ser "aceptado" o "rechazado".');
  }

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.paciente_id, c.estado FROM consentimientos c WHERE c.token = ?`,
      [token]
    );
    if (rows.length === 0) return errorRes(res, 404, 'Solicitud no encontrada.');
    if (rows[0].estado !== 'pendiente') return errorRes(res, 409, 'Esta solicitud ya fue respondida.');

    const consentimientoId = rows[0].id;
    const pacienteId = rows[0].paciente_id;

    // Actualizar el consentimiento
    await pool.query(
      `UPDATE consentimientos SET estado = ?, fecha_respuesta = NOW() WHERE id = ?`,
      [respuesta, consentimientoId]
    );

    // Si acepta, vincular el paciente al tutor
    if (respuesta === 'aceptado') {
      await pool.query(
        `UPDATE pacientes SET tutor_usuario_id = ? WHERE id = ?`,
        [usuarioId, pacienteId]
      );
    }

    console.log(`[CONSENT] Token ${token.slice(0, 8)}... → ${respuesta} por usuario #${usuarioId}`);
    return okRes(res, {
      mensaje: respuesta === 'aceptado'
        ? 'Consentimiento aceptado. El perfil ya está vinculado a tu cuenta.'
        : 'Has rechazado la solicitud.',
    });
  } catch (err) {
    console.error('[CONSENT-RESP] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/mis-pacientes  – Pacientes vinculados al tutor
// ============================================================
app.get('/api/mis-pacientes', async (req, res) => {
  const { usuarioId } = req.query;
  if (!usuarioId) return errorRes(res, 400, 'usuarioId requerido.');

  try {
    const [pacientes] = await pool.query(
      `SELECT p.id, p.nombre, p.fecha_nacimiento, p.genero, p.diagnostico_principal,
              u.nombre AS profesional_nombre, u.id AS profesional_id
       FROM pacientes p
       LEFT JOIN usuarios u ON u.id = p.profesional_id
       WHERE p.tutor_usuario_id = ? AND p.activo = 1
       ORDER BY p.nombre ASC`,
      [usuarioId]
    );
    return okRes(res, { pacientes });
  } catch (err) {
    console.error('[MIS-PACIENTES] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/profesionales-activos  – Listar profesionales del centro
// ============================================================
app.get('/api/profesionales-activos', async (req, res) => {
  try {
    const [profesionales] = await pool.query(
      `SELECT id, nombre, apellido FROM usuarios WHERE rol = 'profesional' AND activo = 1 ORDER BY nombre ASC`
    );
    return okRes(res, { profesionales });
  } catch (err) {
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  POST /api/pacientes/:id/asignar-profesional  – Dar consentimiento (Familia)
// ============================================================
app.post('/api/pacientes/:id/asignar-profesional', async (req, res) => {
  const { id } = req.params;
  const { usuarioId, profesionalId } = req.body;

  if (!usuarioId || !profesionalId) return errorRes(res, 400, 'Faltan parámetros.');

  try {
    // Verificar que el paciente pertenece al tutor
    const [rows] = await pool.query('SELECT tutor_usuario_id FROM pacientes WHERE id = ?', [id]);
    if (rows.length === 0) return errorRes(res, 404, 'Paciente no encontrado.');
    if (rows[0].tutor_usuario_id != usuarioId) return errorRes(res, 403, 'No tienes permiso para modificar este paciente.');

    // Verificar que el profesional existe y es profesional
    const [pro] = await pool.query('SELECT id FROM usuarios WHERE id = ? AND rol = "profesional" AND activo = 1', [profesionalId]);
    if (pro.length === 0) return errorRes(res, 404, 'Profesional no encontrado.');

    // Asignar el profesional
    await pool.query('UPDATE pacientes SET profesional_id = ? WHERE id = ?', [profesionalId, id]);

    return okRes(res, { mensaje: 'Profesional asignado y consentimiento otorgado correctamente.' });
  } catch (err) {
    console.error('[ASIGNAR-PROF] Error:', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  PUT /api/pacientes/:id  – Editar datos del paciente (Familia)
// ============================================================
app.put('/api/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, fechaNacimiento, diagnostico } = req.body;
  if (!nombre) return errorRes(res, 400, 'El nombre es obligatorio.');
  try {
    await pool.query(
      'UPDATE pacientes SET nombre = ?, fecha_nacimiento = ?, diagnostico_principal = ? WHERE id = ?',
      [nombre.trim(), fechaNacimiento || null, diagnostico ? diagnostico.trim() : null, id]
    );
    return okRes(res, { mensaje: 'Paciente actualizado correctamente.' });
  } catch (err) {
    console.error('[EDITAR-PACIENTE] Error:', err.message);
    return errorRes(res, 500, 'Error al actualizar paciente.');
  }
});

// ============================================================
//  POST /api/citas  – Crear nueva solicitud de cita / curso
// ============================================================
app.post('/api/citas', async (req, res) => {
  try {
    const { nombre, telefono, email, profesional, fecha, hora, curso, motivo } = req.body;
    if (!nombre || !telefono || !email || !profesional || !fecha || !hora) {
      return errorRes(res, 400, 'Faltan campos obligatorios para la solicitud.');
    }

    // Buscar ID del profesional mediante slug
    const [profRows] = await pool.query('SELECT id, nombre FROM profesionales WHERE slug = ?', [profesional]);
    if (profRows.length === 0) {
      return errorRes(res, 404, 'Profesional no encontrado.');
    }
    const profesionalId = profRows[0].id;
    const profesionalNombre = profRows[0].nombre;

    const motivoFinal = curso || motivo || 'Sin especificar';

    const [result] = await pool.query(
      'INSERT INTO citas (nombre, telefono, email, profesional_id, fecha, hora, motivo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, telefono, email, profesionalId, fecha, hora, motivoFinal, 'pendiente']
    );

    // Enviar correo de confirmación
    try {
      await transport.sendMail({
        from: process.env.EMAIL_FROM || 'CIS Madrid <cismadrid23@gmail.com>',
        to: email,
        subject: `✅ Confirmación de solicitud – CIS Madrid`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2e7d32; margin: 0;">CIS Madrid</h1>
              <p style="color: #666; font-size: 14px; margin-top: 5px;">Centro de Intervención Psicoeducativa</p>
            </div>
            
            <p>¡Hola <strong>${nombre}</strong>!</p>
            <p>Hemos recibido tu solicitud correctamente. Nuestro equipo revisará la disponibilidad y se pondrá en contacto contigo muy pronto al teléfono <strong>${telefono}</strong> para confirmar tu plaza de forma definitiva.</p>
            
            <div style="background: #f1f8e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">Detalles de tu solicitud:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 8px;">👤 <strong>Profesional asignado:</strong> ${profesionalNombre}</li>
                <li style="margin-bottom: 8px;">📅 <strong>Fecha solicitada:</strong> ${fecha}</li>
                <li style="margin-bottom: 8px;">🕒 <strong>Hora solicitada:</strong> ${hora}</li>
                <li style="margin-bottom: 8px;">📝 <strong>Curso seleccionado:</strong> ${motivoFinal}</li>
              </ul>
            </div>
            
            <p>Si necesitas modificar algún dato o tienes alguna duda, no dudes en enviarnos un correo respondiendo a este mensaje.</p>
            <p>¡Gracias por confiar en el equipo de CIS Madrid!</p>
          </div>
        `
      });
      console.log(`[EMAIL] Correo de confirmación enviado a ${email} para la cita ${result.insertId}`);
    } catch (mailErr) {
      console.error('[EMAIL] Error al enviar el correo de confirmación de cita:', mailErr);
      // No hacemos throw aquí para no bloquear la respuesta si solo falla el correo
    }

    return okRes(res, { citaId: result.insertId, message: 'Solicitud creada y correo enviado.' });
  } catch (err) {
    console.error('[POST CITA]', err.message);
    return errorRes(res, 500, 'Error al registrar la solicitud de cita.');
  }
});

// ============================================================
//  ÁREA DE ADMINISTRACIÓN
// ============================================================

/** Middleware: verifica que el usuarioId es administrador */
async function requireAdmin(req, res, next) {
  const id = req.body?.adminId || req.query?.adminId;
  if (!id) return errorRes(res, 401, 'Se requiere identificación de administrador.');
  try {
    const [rows] = await pool.query(
      'SELECT rol FROM usuarios WHERE id = ? AND activo = 1', [id]
    );
    if (rows.length === 0 || rows[0].rol !== 'admin') {
      return errorRes(res, 403, 'Acceso denegado. Área exclusiva de administración.');
    }
    next();
  } catch (err) {
    return errorRes(res, 500, 'Error interno del servidor.');
  }
}

// ============================================================
//  POST /api/login-admin  – Login exclusivo de administrador
// ============================================================
app.post('/api/login-admin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return errorRes(res, 400, 'El correo y la contraseña son obligatorios.');
  if (!emailValido(email)) return errorRes(res, 400, 'Correo no válido.');

  try {
    const [filas] = await pool.query(
      'SELECT id, nombre, email, telefono, password_hash, rol, activo FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );
    if (filas.length === 0) return errorRes(res, 401, 'Correo o contraseña incorrectos.');

    const u = filas[0];
    if (!u.activo) return errorRes(res, 403, 'Cuenta desactivada.');
    if (u.rol !== 'admin') {
      return errorRes(res, 403, 'Acceso exclusivo para el administrador del sitio.');
    }
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return errorRes(res, 401, 'Correo o contraseña incorrectos.');

    console.log(`[LOGIN-ADMIN] Admin #${u.id} – ${u.email}`);
    return okRes(res, {
      mensaje: 'Acceso concedido.',
      usuario: { id: u.id, nombre: u.nombre, email: u.email, telefono: u.telefono, rol: u.rol },
    });
  } catch (err) {
    console.error('[LOGIN-ADMIN]', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/admin/stats  – Estadísticas globales
// ============================================================
app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
  try {
    const [[{ totalUsuarios }]]       = await pool.query("SELECT COUNT(*) AS totalUsuarios FROM usuarios WHERE rol != 'admin'");
    const [[{ totalFamilias }]]       = await pool.query("SELECT COUNT(*) AS totalFamilias FROM usuarios WHERE rol = 'familia'");
    const [[{ totalProfesionales }]]  = await pool.query("SELECT COUNT(*) AS totalProfesionales FROM usuarios WHERE rol = 'profesional'");
    const [[{ totalPacientes }]]      = await pool.query('SELECT COUNT(*) AS totalPacientes FROM pacientes WHERE activo = 1');
    const [[{ totalCitas }]]          = await pool.query('SELECT COUNT(*) AS totalCitas FROM citas');
    const [[{ citasPendientes }]]     = await pool.query("SELECT COUNT(*) AS citasPendientes FROM citas WHERE estado = 'pendiente'");
    const [[{ consentPendientes }]]   = await pool.query("SELECT COUNT(*) AS consentPendientes FROM consentimientos WHERE estado = 'pendiente'");
    const [[{ consentAceptados }]]    = await pool.query("SELECT COUNT(*) AS consentAceptados FROM consentimientos WHERE estado = 'aceptado'");

    return okRes(res, {
      totalUsuarios, totalFamilias, totalProfesionales,
      totalPacientes, totalCitas, citasPendientes,
      consentPendientes, consentAceptados,
    });
  } catch (err) {
    console.error('[ADMIN-STATS]', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/admin/usuarios  – Listar todos los usuarios
// ============================================================
app.get('/api/admin/usuarios', requireAdmin, async (_req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT id, nombre, email, telefono, rol, activo, created_at
       FROM usuarios WHERE rol != 'admin' ORDER BY created_at DESC`
    );
    return okRes(res, { usuarios });
  } catch (err) {
    console.error('[ADMIN-USUARIOS]', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  PATCH /api/admin/usuarios/:id/toggle  – Activar / Desactivar
// ============================================================
app.patch('/api/admin/usuarios/:id/toggle', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT activo, rol FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return errorRes(res, 404, 'Usuario no encontrado.');
    if (rows[0].rol === 'admin') return errorRes(res, 403, 'No puedes modificar cuentas de administrador.');

    const nuevoEstado = rows[0].activo ? 0 : 1;
    await pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [nuevoEstado, id]);

    console.log(`[ADMIN] Usuario #${id} → activo=${nuevoEstado}`);
    return okRes(res, { mensaje: nuevoEstado ? 'Cuenta activada.' : 'Cuenta desactivada.', activo: nuevoEstado });
  } catch (err) {
    console.error('[ADMIN-TOGGLE]', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/admin/pacientes  – Listar todos los pacientes
// ============================================================
app.get('/api/admin/pacientes', requireAdmin, async (_req, res) => {
  try {
    const [pacientes] = await pool.query(
      `SELECT p.id, p.nombre, p.fecha_nacimiento, p.genero, p.diagnostico_principal,
              p.activo, p.created_at,
              pro.nombre AS profesional_nombre, pro.email AS profesional_email,
              tut.nombre AS tutor_nombre,        tut.email AS tutor_email,
              c.estado   AS consentimiento_estado
       FROM pacientes p
       JOIN  usuarios pro ON pro.id = p.profesional_id
       LEFT JOIN usuarios tut ON tut.id = p.tutor_usuario_id
       LEFT JOIN consentimientos c ON c.paciente_id = p.id
       ORDER BY p.created_at DESC`
    );
    return okRes(res, { pacientes });
  } catch (err) {
    console.error('[ADMIN-PACIENTES]', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/admin/citas  – Listar todas las citas
// ============================================================
app.get('/api/admin/citas', requireAdmin, async (_req, res) => {
  try {
    const [citas] = await pool.query(
      `SELECT c.id, c.nombre, c.telefono, c.email, c.fecha, c.hora,
              c.estado, c.motivo, c.created_at,
              p.nombre AS profesional_nombre
       FROM citas c
       JOIN profesionales p ON p.id = c.profesional_id
       ORDER BY c.fecha DESC, c.hora DESC`
    );
    return okRes(res, { citas });
  } catch (err) {
    console.error('[ADMIN-CITAS]', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  PATCH /api/admin/citas/:id/estado  – Cambiar estado de cita
// ============================================================
app.patch('/api/admin/citas/:id/estado', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['pendiente', 'confirmada', 'cancelada'].includes(estado)) {
    return errorRes(res, 400, 'Estado no válido. Use: pendiente, confirmada o cancelada.');
  }
  try {
    const [rows] = await pool.query('SELECT id FROM citas WHERE id = ?', [id]);
    if (rows.length === 0) return errorRes(res, 404, 'Cita no encontrada.');

    await pool.query('UPDATE citas SET estado = ? WHERE id = ?', [estado, id]);
    console.log(`[ADMIN] Cita #${id} → ${estado}`);
    return okRes(res, { mensaje: `Cita actualizada a "${estado}".`, estado });
  } catch (err) {
    console.error('[ADMIN-CITA-ESTADO]', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ============================================================
//  GET /api/admin/consentimientos  – Listar todos
// ============================================================
app.get('/api/admin/consentimientos', requireAdmin, async (_req, res) => {
  try {
    const [consentimientos] = await pool.query(
      `SELECT c.id, c.email_tutor, c.nombre_tutor, c.estado,
              c.fecha_envio, c.fecha_respuesta,
              p.nombre AS paciente_nombre,
              pro.nombre AS profesional_nombre
       FROM consentimientos c
       JOIN pacientes p  ON p.id  = c.paciente_id
       JOIN usuarios pro ON pro.id = p.profesional_id
       ORDER BY c.fecha_envio DESC`
    );
    return okRes(res, { consentimientos });
  } catch (err) {
    console.error('[ADMIN-CONSENT]', err.message);
    return errorRes(res, 500, 'Error interno del servidor.');
  }
});

// ------------------------------------------------------------
//  Ruta no encontrada
// ------------------------------------------------------------
app.use((_req, res) => {
  errorRes(res, 404, 'Endpoint no encontrado.');
});

// ------------------------------------------------------------
//  Arrancar servidor
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   CIS API – Centro de Intervención       ║');
  console.log(`║   http://localhost:${PORT}                   ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('  Endpoints disponibles:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/registro`);
  console.log(`  POST http://localhost:${PORT}/api/login`);
  console.log(`  POST http://localhost:${PORT}/api/registro-profesional`);
  console.log(`  POST http://localhost:${PORT}/api/login-profesional`);
  console.log(`  POST http://localhost:${PORT}/api/pacientes`);
  console.log(`  GET  http://localhost:${PORT}/api/pacientes`);
  console.log(`  GET  http://localhost:${PORT}/api/consentimientos/pendientes`);
  console.log(`  POST http://localhost:${PORT}/api/consentimientos/:token/responder`);
  console.log(`  GET  http://localhost:${PORT}/api/mis-pacientes`);
  console.log('');
});
