const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'CIS Madrid';
pptx.company = 'CIS Madrid';
pptx.subject = 'Deploy a produccion';
pptx.title = 'Despliegue a Produccion del Portal CIS';
pptx.lang = 'es-ES';

const colors = {
  primary: '4A90A4',
  primaryDark: '2D6D80',
  accent: '7EC8A4',
  soft: 'F0F7F9',
  text: '1F2937',
  muted: '6B7280',
  bg: 'FFFFFF',
  white: 'FFFFFF'
};

const fonts = {
  body: 'Lexend',
  title: 'Lora'
};

const logoPath = path.join(__dirname, '..', 'imagenes', 'logo.svg');

function addLogo(slide) {
  slide.addImage({
    path: logoPath,
    x: 0.28,
    y: 0.07,
    w: 0.76,
    h: 0.76
  });
}

function addHeader(slide, title) {
  slide.background = { color: colors.white };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.9,
    fill: { color: colors.white },
    line: { color: 'DDE3E8', pt: 0.5 }
  });

  addLogo(slide);

  slide.addText(title, {
    x: 1.2,
    y: 0.2,
    w: 11.5,
    h: 0.48,
    color: colors.primaryDark,
    fontSize: 22,
    bold: true,
    fontFace: fonts.title
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 0,
    y: 0.9,
    w: 13.33,
    h: 0,
    line: { color: colors.accent, pt: 1.5 }
  });
}

function addBullets(slide, items) {
  const runs = [];
  items.forEach((t) => {
    runs.push({ text: t, options: { bullet: { indent: 18 } } });
  });
  slide.addText(runs, {
    x: 1.0,
    y: 1.35,
    w: 11.4,
    h: 5.55,
    color: '2C3E50',
    fontSize: 22,
    breakLine: true,
    paraSpaceAfterPt: 14,
    valign: 'top',
    fontFace: fonts.body
  });
}

// 1. Portada
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.white };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.9,
    fill: { color: colors.white },
    line: { color: 'DDE3E8', pt: 0.5 }
  });

  addLogo(slide);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.2,
    w: 11.8,
    h: 5.0,
    fill: { color: colors.white },
    line: { color: 'E5E7EB', pt: 1 }
  });
  slide.addText('Despliegue a Produccion del Portal CIS', {
    x: 1.2,
    y: 1.95,
    w: 11,
    h: 0.8,
    color: colors.primaryDark,
    fontSize: 38,
    bold: true,
    align: 'center',
    fontFace: fonts.title
  });
  slide.addText('De desarrollo local a plataforma online en Railway', {
    x: 1.2,
    y: 2.95,
    w: 11,
    h: 0.6,
    color: colors.muted,
    fontSize: 23,
    align: 'center',
    fontFace: fonts.body
  });
  slide.addText('Proyecto CIS Madrid\nCurso 2025-2026', {
    x: 1.2,
    y: 4.0,
    w: 11,
    h: 1,
    color: '2C3E50',
    fontSize: 20,
    align: 'center',
    fontFace: fonts.body
  });
}

// 2. Objetivo
{
  const slide = pptx.addSlide();
  addHeader(slide, '1. Objetivo del Proyecto');
  addBullets(slide, [
    'Construir una plataforma web para familias, profesionales y administracion.',
    'Pasar de entorno local a produccion accesible por Internet.',
    'Asegurar funcionamiento estable, persistencia de datos y seguridad basica.',
    'Demostrar un flujo real de despliegue end-to-end.'
  ]);
}

// 3. Tecnologias
{
  const slide = pptx.addSlide();
  addHeader(slide, '2. Tecnologias Utilizadas');
  addBullets(slide, [
    'Frontend: HTML5, CSS3 y JavaScript (Vanilla JS).',
    'Backend: Node.js con Express (API REST).',
    'Base de datos: MySQL relacional.',
    'Email transaccional: Brevo API (HTTP).',
    'Control de versiones: Git y GitHub.',
    'Despliegue: Railway (servicio web + MySQL gestionado).'
  ]);
}

// 4. Arquitectura
{
  const slide = pptx.addSlide();
  addHeader(slide, '3. Arquitectura de la Solucion');
  addBullets(slide, [
    'Cliente web consume endpoints de la API mediante peticiones HTTP.',
    'Express concentra logica de negocio, autenticacion y validaciones.',
    'MySQL persiste usuarios, pacientes, citas y consentimientos.',
    'Brevo envia correos automaticos de consentimiento y confirmacion.',
    'Flujo: Usuario -> Frontend -> API -> Base de datos / Email -> Respuesta.'
  ]);
}

// 5. Base de datos
{
  const slide = pptx.addSlide();
  addHeader(slide, '4. Base de Datos y Modelo');
  addBullets(slide, [
    'Modelo principal en tabla usuarios con roles: familia, profesional y admin.',
    'Entidades del dominio: pacientes, citas y consentimientos.',
    'Relaciones para trazabilidad del flujo clinico y administrativo.',
    'Consultas preparadas y validacion de datos para robustez en produccion.'
  ]);
}

// 6. Seguridad
{
  const slide = pptx.addSlide();
  addHeader(slide, '5. Seguridad Aplicada');
  addBullets(slide, [
    'Hash de contrasenas con bcrypt.',
    'Control de acceso por rol en rutas protegidas.',
    'Validacion de entrada en frontend y backend.',
    'Variables de entorno para claves y credenciales.',
    'Rotacion de secretos y proteccion del repositorio en GitHub.'
  ]);
}

// 7. Plataformas
{
  const slide = pptx.addSlide();
  addHeader(slide, '6. Plataformas Utilizadas');
  addBullets(slide, [
    'GitHub: repositorio, versionado y colaboracion.',
    'Railway: hosting del backend Node.js y servicio de MySQL.',
    'Brevo: envio de emails transaccionales.',
    'Brave/Chrome DevTools: validacion de peticiones y errores en produccion.'
  ]);
}

// 8. Paso a produccion
{
  const slide = pptx.addSlide();
  addHeader(slide, '7. Paso a Produccion: Proceso de Despliegue');
  addBullets(slide, [
    'Subida del codigo a GitHub (rama main).',
    'Conexion del repositorio al servicio web en Railway.',
    'Configuracion de variables de entorno.',
    'Deploy del ultimo commit y verificacion de logs.',
    'Pruebas funcionales desde la URL publica.'
  ]);
}

// 9. Variables
{
  const slide = pptx.addSlide();
  addHeader(slide, '8. Variables de Entorno Clave');
  addBullets(slide, [
    'Base de datos: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE.',
    'Admin: ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_RESET_PASSWORD (temporal).',
    'Acceso profesional: CODIGO_PROFESIONAL.',
    'Email: BREVO_API_KEY y EMAIL_FROM.',
    'Aplicacion: APP_URL y CORS_ORIGIN.'
  ]);
}

// 10. Incidencias
{
  const slide = pptx.addSlide();
  addHeader(slide, '9. Incidencias Reales y Resolucion');
  addBullets(slide, [
    'Error 401 en login admin por diferencias de datos y despliegue.',
    'Desfase de commits entre local, remoto y servicio desplegado.',
    'Push bloqueado por secretos detectados en GitHub.',
    'Correccion: limpieza de secretos, ajuste de variables y redeploy final.'
  ]);
}

// 11. Validacion
{
  const slide = pptx.addSlide();
  addHeader(slide, '10. Validacion Final en Produccion');
  addBullets(slide, [
    'Acceso admin operativo.',
    'Registro y login profesional funcionando.',
    'Panel y estadisticas cargando correctamente.',
    'Conexion estable con MySQL en Railway.',
    'Flujos de correo transaccional operativos con Brevo.'
  ]);
}

// 12. Cierre
{
  const slide = pptx.addSlide();
  addHeader(slide, '11. Conclusiones y Siguientes Pasos');
  addBullets(slide, [
    'El despliegue a produccion se completo con exito.',
    'La plataforma quedo accesible online con arquitectura estable.',
    'Proximos pasos: pruebas automatizadas y CI/CD con checks obligatorios.',
    'Refuerzo continuo de seguridad: rotacion periodica de claves y monitoreo.'
  ]);

}

// 13. Gracias
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.white };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.9,
    fill: { color: colors.white },
    line: { color: 'DDE3E8', pt: 0.5 }
  });

  addLogo(slide);

  slide.addText('Gracias', {
    x: 0,
    y: 2.8,
    w: 13.33,
    h: 1,
    align: 'center',
    fontSize: 62,
    bold: false,
    color: colors.accent,
    fontFace: fonts.body
  });
}

pptx.writeFile({ fileName: 'Presentacion_Deploy_CIS_v2.pptx' })
  .then(() => console.log('PPTX generado: Presentacion_Deploy_CIS_v2.pptx'))
  .catch((err) => {
    console.error('Error al generar PPTX:', err.message);
    process.exit(1);
  });
