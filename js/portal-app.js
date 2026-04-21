// ==========================================================
//  CIS – Portal de Familias
//  Lógica de renderizado dinámico
// ==========================================================

(function () {
  'use strict';

  /* ----------------------------------------------------------
     UTILIDADES
  ---------------------------------------------------------- */

  /** Formatea una fecha ISO "YYYY-MM-DD" como objeto con día y mes corto */
  function parseFecha(iso) {
    const base = String(iso || '').slice(0, 10);
    const [y, m, d] = base.split('-').map(Number);
    if (!y || !m || !d) {
      return {
        dia: '--',
        mes: '---',
        diaSem: 'fecha',
        texto: 'Fecha no disponible',
        obj: new Date(),
      };
    }
    const date = new Date(y, m - 1, d);
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const diasSem = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    return {
      dia:    String(d).padStart(2, '0'),
      mes:    meses[m - 1],
      diaSem: diasSem[date.getDay()],
      texto:  `${d} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m-1]} de ${y}`,
      obj:    date,
    };
  }

  /** Comprueba si una fecha ISO es hoy o en el futuro */
  function esFutura(iso) {
    const base = String(iso || '').slice(0, 10);
    const [y, m, d] = base.split('-').map(Number);
    if (!y || !m || !d) return false;
    const fecha = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha >= hoy;
  }

  /** Escapar HTML básico para evitar XSS */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizarEstadoCita(cita) {
    const raw = String(cita?.estado || '').trim().toLowerCase();

    if (raw === 'proxima' || raw === 'pendiente' || raw === 'confirmada') return raw;
    if (raw === 'programada' || raw === 'scheduled') return 'pendiente';
    if (raw === 'confirmed') return 'confirmada';
    if (raw === 'realizada' || raw === 'completada' || raw === 'done') return 'realizada';
    if (raw === 'cancelada' || raw === 'cancelado') return 'cancelada';

    // Fallback por fecha cuando el estado viene vacío o inesperado.
    return esFutura(cita?.fecha) ? 'pendiente' : 'realizada';
  }

  /* ----------------------------------------------------------
     PERFIL DE USUARIO
  ---------------------------------------------------------- */
  function renderPerfil(u) {
    const avatar = document.getElementById('portalAvatar');
    const nombre = document.getElementById('portalNombre');
    const rol    = document.getElementById('portalRol');
    const tel    = document.getElementById('portalTel');
    const email  = document.getElementById('portalEmail');
    const pac    = document.getElementById('portalPaciente');
    const ref    = document.getElementById('portalRef');

    const initials = u.nombre.split(' ').slice(0, 2).map(n => n[0]).join('+');
    if (avatar) avatar.src = `https://ui-avatars.com/api/?name=${initials}&background=4A90A4&color=fff&size=150`;
    if (nombre) nombre.textContent = u.nombre;
    if (rol)    rol.textContent    = u.rol;
    if (tel)    tel.textContent    = `📞 ${u.telefono}`;
    if (email)  email.textContent  = `✉️ ${u.email}`;
  }

  /* ----------------------------------------------------------
     CITAS
  ---------------------------------------------------------- */
  function renderCitas(citas) {
    const container    = document.getElementById('appointmentList');
    const tabProximas  = document.getElementById('tabProximas');
    const tabPasadas   = document.getElementById('tabPasadas');
    const counterBadge = document.getElementById('citasProximasBadge');
    if (!container) return;

    const citasNormalizadas = (citas || []).map((c) => ({
      ...c,
      estado: normalizarEstadoCita(c),
    }));

    // Ordenar: próximas ascendente, pasadas descendente
    const proximas = citasNormalizadas
      .filter(c => c.estado === 'proxima' || c.estado === 'pendiente' || c.estado === 'confirmada')
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const pasadas = citasNormalizadas
      .filter(c => c.estado === 'realizada' || c.estado === 'cancelada')
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    // Badge contador de citas próximas
    if (counterBadge) {
      counterBadge.textContent = proximas.length;
      counterBadge.style.display = proximas.length > 0 ? '' : 'none';
    }

    let vistaActual = 'proximas';

    function buildCard(c) {
      const f = parseFecha(c.fecha);
      const esProxima = c.estado === 'proxima';
      const esCancelada = c.estado === 'cancelada';

      let estadoLabel  = '';
      let estadoClass  = '';
      if (c.estado === 'proxima')   { estadoLabel = 'ESTA SEMANA'; estadoClass = ''; }
      if (c.estado === 'pendiente') { estadoLabel = 'PROGRAMADA';  estadoClass = 'pending'; }
      if (c.estado === 'confirmada') { estadoLabel = 'CONFIRMADA'; estadoClass = 'pending'; }
      if (c.estado === 'realizada') { estadoLabel = 'REALIZADA';   estadoClass = 'apt-status--done'; }
      if (c.estado === 'cancelada') { estadoLabel = 'CANCELADA';   estadoClass = 'apt-status--cancelled'; }

      const dateClass = (c.estado === 'realizada' || c.estado === 'cancelada') ? 'apt-date apt-date--past' : 'apt-date';
      const titleClass = (c.estado === 'realizada' || c.estado === 'cancelada') ? 'apt-title--past' : '';

      return `
        <div class="apt-card${esProxima ? ' next' : ''}">
          <div class="${dateClass}">
            <span class="day">${f.dia}</span>
            <span class="month">${f.mes}</span>
          </div>
          <div class="apt-details">
            <h4 class="${titleClass}">${esc(c.especialidad)} – ${esc(c.profesional)}</h4>
            <p>🕒 ${f.diaSem.charAt(0).toUpperCase() + f.diaSem.slice(1)}, ${esc(c.hora)}h (${esc(c.duracion)}) | ${esc(c.consulta)}</p>
          </div>
          <div class="apt-status ${estadoClass}">${estadoLabel}</div>
        </div>`;
    }

    function renderVista(lista, vacia) {
      if (lista.length === 0) {
        container.innerHTML = `<p class="portal-empty">${vacia}</p>`;
        return;
      }
      container.innerHTML = lista.map(buildCard).join('');
    }

    function setTab(tab) {
      vistaActual = tab;
      if (tabProximas) tabProximas.classList.toggle('active', tab === 'proximas');
      if (tabPasadas)  tabPasadas.classList.toggle('active',  tab === 'pasadas');
      if (tab === 'proximas') {
        renderVista(proximas, 'No tienes citas programadas próximamente. <a href="index.html#servicios" class="link-primary">Solicita una →</a>');
      } else {
        renderVista(pasadas, 'No hay citas pasadas registradas.');
      }
    }

    if (tabProximas) tabProximas.addEventListener('click', () => setTab('proximas'));
    if (tabPasadas)  tabPasadas.addEventListener('click',  () => setTab('pasadas'));

    // Vista inicial
    setTab('proximas');
  }

  /* ----------------------------------------------------------
     DIARIO DE SESIONES
  ---------------------------------------------------------- */
  function renderSesiones(sesiones) {
    const container = document.getElementById('sessionList');
    if (!container) return;

    if (sesiones.length === 0) {
      container.innerHTML = '<p class="portal-empty">No hay sesiones registradas todavía.</p>';
      return;
    }

    // Ordenar descendente por fecha
    const ordenadas = [...sesiones].sort((a, b) => b.fecha.localeCompare(a.fecha));

    container.innerHTML = ordenadas.map(s => {
      const f = parseFecha(s.fecha);
      return `
        <div class="session-card">
          <div class="session-date">${f.texto}</div>
          <div class="session-content">
            <strong class="session-title">${esc(s.titulo)}</strong>
            <p>${esc(s.contenido)}</p>
            <div class="prof">Evaluado por: ${esc(s.evaluador)}</div>
          </div>
        </div>`;
    }).join('');
  }

  /* ----------------------------------------------------------
     FACTURACIÓN
  ---------------------------------------------------------- */
  function renderFacturacion(items) {
    const container = document.getElementById('billingList');
    const totalEl   = document.getElementById('billingTotal');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<p class="portal-empty">No hay movimientos registrados.</p>';
      return;
    }

    const ordenados = [...items].sort((a, b) => b.fecha.localeCompare(a.fecha));
    const total    = ordenados.reduce((sum, i) => sum + i.importe, 0);

    container.innerHTML = ordenados.map(i => {
      const f = parseFecha(i.fecha);
      const badgeHTML = i.estado === 'pagado'
        ? '<span class="badge-paid">PAGADO</span>'
        : '<span class="badge-pending">PENDIENTE</span>';
      return `
        <div class="billing-item">
          <div class="b-info">
            <h5>${esc(i.descripcion)}</h5>
            <p>Ref: ${esc(i.ref)} &bull; ${f.texto} &bull; ${esc(i.metodo)}</p>
          </div>
          <div class="b-amount ${i.estado === 'pagado' ? 'paid' : 'unpaid'}">
            ${i.importe} € ${badgeHTML}
          </div>
        </div>`;
    }).join('');

    if (totalEl) totalEl.textContent = `Total abonado: ${total} €`;
  }

  /* ----------------------------------------------------------
     CANCELAR CITA (simulado)
  ---------------------------------------------------------- */
  function initCancelarCita() {
    // Usando delegación de eventos por si hay botones dinámicos futuros
    document.addEventListener('click', function (e) {
      if (e.target.closest('.btn-cancelar-cita')) {
        const id = e.target.closest('.btn-cancelar-cita').dataset.id;
        if (confirm('¿Confirmas que deseas cancelar esta cita?')) {
          const cita = CIS_DATA.citas.find(c => String(c.id) === String(id));
          if (cita) {
            cita.estado = 'cancelada';
            renderCitas(CIS_DATA.citas);
            alert('✅ Cita cancelada correctamente. Recibirás confirmación por email.');
          }
        }
      }
    });
  }

  /* ----------------------------------------------------------
     EXPORTAR EXTRACTO (simulado)
  ---------------------------------------------------------- */
  function initExportarExtracto(email) {
    const btn = document.getElementById('btnExtracto');
    if (!btn) return;
    btn.addEventListener('click', () => {
      alert('📄 El extracto de facturación se enviará a ' + email + ' en los próximos minutos.');
    });
  }

  /* ----------------------------------------------------------
     RESUMEN RÁPIDO (panel superior)
  ---------------------------------------------------------- */
  function renderResumen(citas, sesiones, facturacion) {
    const elProximas = document.getElementById('resumenProximas');
    const elSesiones = document.getElementById('resumenSesiones');
    const elTotal    = document.getElementById('resumenTotal');

    const citasNormalizadas = (citas || []).map((c) => ({
      ...c,
      estado: normalizarEstadoCita(c),
    }));

    const proximas     = citasNormalizadas.filter(c => c.estado === 'proxima' || c.estado === 'pendiente' || c.estado === 'confirmada').length;
    const sesionesCont = sesiones.length;
    const totalAbonado = (facturacion || []).reduce((s, i) => s + i.importe, 0);

    if (elProximas) elProximas.textContent = proximas;
    if (elSesiones) elSesiones.textContent = sesionesCont;
    if (elTotal)    elTotal.textContent    = totalAbonado > 0 ? `${totalAbonado} €` : '0 €';
  }

  /* ----------------------------------------------------------
     INTEGRACIÓN API: GESTIÓN DE PACIENTES (HIJOS)
  ---------------------------------------------------------- */
  async function cargarPacientes(usuarioId) {
    const listEl = document.getElementById('misPacientesList');
    if (!listEl) return;
    try {
      const res = await fetch(`${window.API_BASE}/api/mis-pacientes?usuarioId=${usuarioId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.mensaje || 'Error al cargar pacientes');
      
      const pacientes = data.pacientes || [];
      
      if (pacientes.length === 0) {
        listEl.innerHTML = '<p class="portal-empty">No tienes hijos registrados todavía.</p>';
        const sidebarInfo = document.querySelector('.patient-info');
        if (sidebarInfo) {
          sidebarInfo.innerHTML = `<h4>Datos del Menor</h4><div class="patient-item" style="color:#888;">Sin pacientes registrados. Usa el botón superior para añadir uno.</div>`;
        }
        return;
      }

      listEl.innerHTML = pacientes.map(p => `
        <div class="apt-card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="margin:0 0 4px 0;">${esc(p.nombre)}</h4>
            <p style="margin:0; font-size:0.9rem; color:#666;">
              Profesional: ${p.profesional_nombre ? `<strong>${esc(p.profesional_nombre)}</strong>` : '<span style="color:#d9534f;">Sin asignar</span>'}
            </p>
          </div>
          <div>
            ${!p.profesional_nombre ? `<button class="btn btn-outline btn-sm btn-asignar" data-id="${p.id}" data-nombre="${esc(p.nombre)}">Dar acceso a profesional</button>` : ''}
          </div>
        </div>
      `).join('');

      // Actualizar menú lateral izquierdo de Datos del Paciente
      const sidebarInfo = document.querySelector('.patient-info');
      if (sidebarInfo) {
        sidebarInfo.innerHTML = `<h4>Datos del Menor</h4>` + pacientes.map(p => {
          // Extraer YYYY-MM-DD
          let f = '';
          if (p.fecha_nacimiento) {
             const d = new Date(p.fecha_nacimiento);
             f = d.toISOString().split('T')[0];
          }
          return `
          <div style="border-bottom:1px solid #eee; padding-bottom:8px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color: #4A90A4;">👤 ${esc(p.nombre)}</strong>
              <span class="icon-edit btn-editar-paciente" data-id="${p.id}" data-nombre="${esc(p.nombre)}" data-fecha="${f}" data-diag="${esc(p.diagnostico_principal || '')}" style="cursor:pointer;" title="Editar datos">⚙️</span>
            </div>
            <div class="patient-item" style="margin-top:4px;">🎂 ${f ? parseFecha(f).texto : 'Sin fecha de nacimiento'}</div>
            <div class="patient-item" style="font-size:0.85em; color:#666;">🩺 ${esc(p.diagnostico_principal || 'Sin especificar motivo')}</div>
          </div>
        `}).join('');
      }

    } catch (err) {
      listEl.innerHTML = `<p class="portal-empty" style="color:red;">Error: ${err.message}</p>`;
      const sidebarInfo = document.querySelector('.patient-info');
      if (sidebarInfo) {
        sidebarInfo.innerHTML = `<h4>Datos del Menor</h4><div class="patient-item" style="color:red;">Error al cargar información</div>`;
      }
    }
  }

  function initGestionPacientes(usuario) {
    const modalNuevo   = document.getElementById('modalNuevoPaciente');
    const modalAsignar = document.getElementById('modalAsignarProfesional');
    const btnNuevo     = document.getElementById('btnNuevoPaciente');
    const listEl       = document.getElementById('misPacientesList');

    if (!modalNuevo || !usuario || !usuario.id) return;

    cargarPacientes(usuario.id);

    // Modal Nuevo Paciente
    if (btnNuevo) btnNuevo.addEventListener('click', () => modalNuevo.showModal());
    const btnCerrarNP = document.getElementById('cerrarModalNuevoPaciente');
    if (btnCerrarNP) btnCerrarNP.addEventListener('click', () => modalNuevo.close());
    
    const formNP = document.getElementById('formNuevoPaciente');
    if (formNP) {
      formNP.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombreBtn = formNP.querySelector('[type="submit"]');
        const nombre = document.getElementById('nuevoPacienteNombre').value;
        const fecha = document.getElementById('nuevoPacienteFecha').value;
        
        nombreBtn.disabled = true;
        nombreBtn.textContent = 'Guardando...';

        try {
          const res = await fetch(`${window.API_BASE}/api/pacientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuarioId: usuario.id,
              rol: 'familia', // Nuevo rol permitido gracias a los cambios en BD
              nombre: nombre,
              fechaNacimiento: fecha || null
            })
          });
          const resp = await res.json();
          if(res.ok) {
            alert('Hijo/a registrado exitosamente.');
            modalNuevo.close();
            formNP.reset();
            cargarPacientes(usuario.id);
          } else {
            alert('Error: ' + resp.mensaje);
          }
        } catch (err) {
          alert('Error conectando a la API.');
        } finally {
          nombreBtn.disabled = false;
          nombreBtn.textContent = 'Guardar Registro';
        }
      });
    }

    // Modal Asignar Profesional
    if (listEl) {
      listEl.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-asignar')) {
          const id = e.target.getAttribute('data-id');
          const nombre = e.target.getAttribute('data-nombre');
          
          document.getElementById('asignarIdPaciente').value = id;
          document.getElementById('asignarNombrePaciente').textContent = nombre;
          
          try {
            const res = await fetch(`${window.API_BASE}/api/profesionales-activos`);
            const data = await res.json();
            const select = document.getElementById('selectProfesional');
            if (res.ok && data.profesionales) {
              select.innerHTML = '<option value="">Selecciona profesional...</option>' + 
                data.profesionales.map(pr => `<option value="${pr.id}">${pr.nombre} ${pr.apellido}</option>`).join('');
            }
          } catch (error) {
            console.error("Error cargando profesionales", error);
          }
          
          modalAsignar.showModal();
        }
      });
    }

    const btnCerrarAP = document.getElementById('cerrarModalAsignarProfesional');
    if (btnCerrarAP) btnCerrarAP.addEventListener('click', () => modalAsignar.close());

    const formAP = document.getElementById('formAsignarProfesional');
    if (formAP) {
      formAP.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idPaciente = document.getElementById('asignarIdPaciente').value;
        const idProf = document.getElementById('selectProfesional').value;
        const submitBtn = formAP.querySelector('[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Asignando...';

        try {
          const res = await fetch(`${window.API_BASE}/api/pacientes/${idPaciente}/asignar-profesional`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId: usuario.id, profesionalId: idProf })
          });
          const resp = await res.json();
          if (res.ok) {
            alert('¡Consentimiento otorgado y profesional asignado correctamente!');
            modalAsignar.close();
            cargarPacientes(usuario.id);
          } else {
            alert('Error: ' + resp.mensaje);
          }
        } catch (err) {
          alert('Error conectando a la API.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirmar Asignación';
        }
      });
    }

    // Modal Editar Paciente (Delegación en sidebar)
    const sidebarInfo = document.querySelector('.patient-info');
    const modalEditar = document.getElementById('modalEditarPaciente');
    const formEP = document.getElementById('formEditarPaciente');
    const btnCerrarEP = document.getElementById('cerrarModalEditarPaciente');

    if (sidebarInfo && modalEditar) {
      sidebarInfo.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-editar-paciente');
        if (btn) {
          document.getElementById('editarPacienteId').value = btn.getAttribute('data-id');
          document.getElementById('editarPacienteNombre').value = btn.getAttribute('data-nombre');
          document.getElementById('editarPacienteFecha').value = btn.getAttribute('data-fecha');
          document.getElementById('editarPacienteDiagnostico').value = btn.getAttribute('data-diag') || '';
          modalEditar.showModal();
        }
      });
    }

    if (btnCerrarEP) btnCerrarEP.addEventListener('click', () => modalEditar.close());

    if (formEP) {
      formEP.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editarPacienteId').value;
        const nombre = document.getElementById('editarPacienteNombre').value;
        const fecha = document.getElementById('editarPacienteFecha').value;
        const diag = document.getElementById('editarPacienteDiagnostico').value;
        const submitBtn = formEP.querySelector('[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        try {
          const res = await fetch(`${window.API_BASE}/api/pacientes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, fechaNacimiento: fecha, diagnostico: diag })
          });
          const resp = await res.json();
          if (res.ok) {
            alert('Datos guardados correctamente.');
            modalEditar.close();
            cargarPacientes(usuario.id);
          } else {
            alert('Error: ' + resp.mensaje);
          }
        } catch (err) {
          alert('Error de conexión.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Guardar Cambios';
        }
      });
    }
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  function cargarDatos() {
    const raw = sessionStorage.getItem('cis_usuario');

    if (raw) {
      // ── Usuario que acaba de registrarse ──
      const u = JSON.parse(raw);
      return {
        usuario: {          id:       u.id,          nombre:   u.nombre,
          rol:      u.rol || 'Tutor Legal',
          telefono: u.telefono,
          email:    u.email,
          paciente: {
            nombre: '–',
            edad:   '–',
            ref:    'Aún sin registrar',
          },
        },
        citas:       [],
        sesiones:    [],
        facturacion: [],
      };
    }

    // ── Sin sesión activa → datos demo ──
    return CIS_DATA;
  }

  async function cargarCitasUsuario(email) {
    if ((window.API_BASE === null || typeof window.API_BASE === 'undefined') || !email) return [];

    try {
      const res = await fetch(`${window.API_BASE}/api/mis-citas?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudieron cargar las citas');

      const citas = (data.citas || []).map((c) => ({
        id: c.id,
        fecha: c.fecha,
        hora: c.hora,
        duracion: '50 min',
        profesional: c.profesional_nombre || 'Profesional',
        especialidad: c.profesional_especialidad || 'Consulta',
        consulta: c.motivo || 'Consulta',
        estado: c.estado || 'pendiente',
      }));

      return citas;
    } catch (err) {
      console.error('[PORTAL-CITAS]', err.message);
      return [];
    }
  }

  async function init() {
    if (!document.getElementById('portalApp')) return;

    const datos = cargarDatos();
    if (sessionStorage.getItem('cis_usuario') && datos?.usuario?.email) {
      datos.citas = await cargarCitasUsuario(datos.usuario.email);
    }

    renderPerfil(datos.usuario);
    renderResumen(datos.citas, datos.sesiones, datos.facturacion);
    renderCitas(datos.citas);
    renderSesiones(datos.sesiones);
    renderFacturacion(datos.facturacion);
    initCancelarCita();
    initExportarExtracto(datos.usuario.email);
    
    // Inicializar gestión dinámica de pacientes
    if (datos.usuario && datos.usuario.id) {
      initGestionPacientes(datos.usuario);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
