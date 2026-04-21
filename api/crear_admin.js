// Script para crear / actualizar el usuario administrador
// Uso: node crear_admin.js
// ================================================================

'use strict';
require('dotenv').config();

const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

const ADMIN_EMAIL    = 'a.lafuente.defrutos@gmail.com';
const ADMIN_PASSWORD = 'CIS2026admin';
const ADMIN_NOMBRE   = 'Ana Sara Lafuente';
const ADMIN_TEL      = '+34605426298';

(async () => {
  const conn = await mysql.createConnection({
    host:     process.env.MYSQLHOST     || process.env.MYSQL_HOST     || process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT) || 3306,
    user:     process.env.MYSQLUSER     || process.env.MYSQL_USER     || process.env.DB_USER     || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME     || 'cis_madrid',
    charset:  'utf8mb4',
  });

  console.log('✅ Conectado a MySQL');

  // Verificar antes
  const [antes] = await conn.query("SELECT id, email, rol FROM usuarios WHERE rol='admin'");
  console.log('Admins antes:', antes.length ? JSON.stringify(antes) : 'ninguno');

  // Generar hash
  console.log('Generando hash para:', ADMIN_PASSWORD);
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  console.log('Hash generado:', hash);

  // Verificar que el hash funciona
  const ok = await bcrypt.compare(ADMIN_PASSWORD, hash);
  console.log('Verificación inmediata del hash:', ok);

  // Eliminar admins anteriores e insertar
  await conn.query("DELETE FROM usuarios WHERE rol = 'admin'");
  const [result] = await conn.query(
    "INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, activo) VALUES (?, '', ?, ?, ?, 'admin', 1)",
    [ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_TEL, hash]
  );
  console.log(`✅ Admin creado con ID: ${result.insertId}`);

  // Leer y verificar desde la BD
  const [fila] = await conn.query('SELECT id, nombre, email, rol, activo, password_hash FROM usuarios WHERE id = ?', [result.insertId]);
  if (fila.length > 0) {
    const usuario = fila[0];
    console.log('Usuario leído de BD:', { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, activo: usuario.activo });
    const verificacion = await bcrypt.compare(ADMIN_PASSWORD, usuario.password_hash);
    console.log('✅ Verificación de contraseña desde BD:', verificacion);
  }

  await conn.end();
  console.log('\n🎉 Proceso completado. Prueba el login en login-admin.html');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
})().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
