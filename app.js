// Base de datos simulada (Mock DB)
const mockDB = {
    users: [
        { role: 'mmo', user: 'T-1234', pass: '1234', name: 'Arquitecto Juan Pérez' },
        { role: 'comitente', user: '20345678', pass: '4589', name: 'María Gómez', legajo: '4589/2026' }
    ],
    expedientes: [
        {
            legajo: '4589/2026',
            ingreso: '12/05/2026',
            lote: 'Lote 45, Mza 12 - Centro',
            avance: 75,
            pasos: [
                { titulo: '1. Ingreso de Anteproyecto', desc: 'Documentación inicial subida y revisada.', estado: 'completado', icono: 'fa-check', doc: 'Planos_Preliminares.pdf' },
                { titulo: '2. Visado del Colegio de Técnicos', desc: 'Aportes jubilatorios y visado colegial aprobados.', estado: 'completado', icono: 'fa-check', doc: 'Certificado_Visado_4421.pdf' },
                { titulo: '3. Aprobación Municipal', desc: 'En revisión por el municipio. Esperando firmas finales.', estado: 'en-proceso', icono: 'fa-spinner' },
                { titulo: '4. Permiso de Obra Emitido', desc: 'Cartón de obra listo para imprimir.', estado: 'pendiente', icono: 'fa-print' }
            ]
        },
        {
            legajo: '1024/2026',
            ingreso: '01/03/2026',
            lote: 'Lote 12, Barrio Sur',
            avance: 100,
            pasos: [
                { titulo: '1. Ingreso de Anteproyecto', desc: 'Documentación inicial subida.', estado: 'completado', icono: 'fa-check', doc: 'Planos_V1.pdf' },
                { titulo: '2. Visado del Colegio de Técnicos', desc: 'Visado colegial aprobado.', estado: 'completado', icono: 'fa-check', doc: 'Certificado.pdf' },
                { titulo: '3. Aprobación Municipal', desc: 'Aprobado por municipio.', estado: 'completado', icono: 'fa-check' },
                { titulo: '4. Permiso de Obra Emitido', desc: 'Permiso otorgado y entregado.', estado: 'completado', icono: 'fa-check', doc: 'Permiso_Obra.pdf' }
            ]
        }
    ],
    contratos: []
};

// Estado Global
let currentRole = 'mmo'; // rol seleccionado en el formulario de login
let loggedUser = null; // usuario autenticado

// Referencias al DOM
const btnRoleMMO = document.getElementById('btn-role-mmo');
const btnRoleComitente = document.getElementById('btn-role-comitente');
const formLogin = document.getElementById('form-login');
const inputUser = document.getElementById('matricula');
const inputPass = document.getElementById('password');

const sections = {
    autenticacion: document.getElementById('autenticacion'),
    expedientes: document.getElementById('expedientes'),
    contratos: document.getElementById('contratos'),
    marcoLegal: document.getElementById('marco-legal'),
    nuevoLegajo: document.getElementById('nuevo-legajo'),
    dashboardLegajo: document.getElementById('dashboard-legajo')
};

const navLinks = {
    autenticacion: document.getElementById('nav-autenticacion'),
    expedientes: document.getElementById('nav-expedientes'),
    contratos: document.getElementById('nav-contratos'),
    marcoLegal: document.getElementById('nav-marco-legal')
};

const expedientesContainer = document.getElementById('expedientes-container');
const formContratos = document.getElementById('form-contratos');

// Funciones de utilidad para UI
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Inicialización de la Interfaz
function initApp() {
    // Esconder todas las secciones excepto autenticacion al inicio
    hideAllSections();
    // Ocultar elementos del layout principal en login
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('header-right').style.display = 'none';

    sections.autenticacion.style.display = 'block';

    // Manejo de botones de rol en login
    document.querySelectorAll('.btn-perfil').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.btn-perfil').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentRole = this.dataset.role;
            if (currentRole === 'comitente') {
                inputUser.placeholder = "Ej: DNI (20345678)";
                inputPass.placeholder = "Nº de Legajo (Ej: 4589)";
            } else {
                inputUser.placeholder = "Ej: T-45321";
                inputPass.placeholder = "••••••••";
            }
        });
    });

    // Envío del formulario de Login
    formLogin.addEventListener('submit', handleLogin);

    // Envío del formulario de Contratos
    formContratos.addEventListener('submit', handleContratoSubmit);

    // Eventos de Navegación del Sidebar
    document.querySelectorAll('.sidebar-subitem, .sidebar-item:not(.group-title)').forEach(nav => {
        nav.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const targetId = href.substring(1);
                // Casos especiales (home, perfil, cuenta) que no tienen sección todavía
                if (sections[targetId]) {
                    showSection(targetId);
                } else if (targetId === 'home') {
                    showSection('expedientes'); // fallback
                }

                // Actualizar active state
                document.querySelectorAll('.sidebar-subitem, .sidebar-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
                // Si es un subitem, activar también su padre
                if (this.classList.contains('sidebar-subitem')) {
                    this.closest('.sidebar-group').querySelector('.group-title').classList.add('active');
                }
            }
        });
    });

    // Eventos Toggle Sidebar
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if (btnToggleSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (window.innerWidth <= 767) {
                sidebar.classList.toggle('open');
            }
        });
    }

    // Toggle de Submenus
    document.querySelectorAll('.group-title').forEach(title => {
        title.addEventListener('click', function (e) {
            e.preventDefault();
            const submenu = this.nextElementSibling;
            if (submenu && submenu.classList.contains('sidebar-submenu')) {
                if (submenu.style.display === 'none' || submenu.style.display === '') {
                    submenu.style.display = 'block';
                    this.querySelector('.arrow').classList.replace('fa-chevron-right', 'fa-chevron-down');
                } else {
                    submenu.style.display = 'none';
                    this.querySelector('.arrow').classList.replace('fa-chevron-down', 'fa-chevron-right');
                }
            }
        });
    });

    // Navegación Vistas Especiales
    const btnNuevoLegajo = document.getElementById('btn-nuevo-legajo');
    if (btnNuevoLegajo) {
        btnNuevoLegajo.addEventListener('click', () => {
            showSection('nuevoLegajo');
        });
    }

    const btnVolverEjercicio = document.getElementById('btn-volver-ejercicio');
    if (btnVolverEjercicio) {
        btnVolverEjercicio.addEventListener('click', () => {
            showSection('expedientes');
        });
    }

    const btnVolverDashboard = document.getElementById('btn-volver-dashboard');
    if (btnVolverDashboard) {
        btnVolverDashboard.addEventListener('click', () => {
            showSection('expedientes');
        });
    }

    // Modal Events
    const modal = document.getElementById('modal-tramite');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const btnSaveModal = document.getElementById('btn-save-modal');

    // Delegación para los botones de actualizar trámite en el dashboard
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-actualizar-tramite')) {
            modal.style.display = 'flex';
        }

        // Simular ir al dashboard al hacer click en un legajo renderizado dinámicamente
        if (e.target.closest('.progreso-legal-wrapper') || e.target.closest('.meta-expediente')) {
            showSection('dashboardLegajo');
        }
    });

    if (btnCloseModal) btnCloseModal.addEventListener('click', () => modal.style.display = 'none');
    if (btnCancelModal) btnCancelModal.addEventListener('click', () => modal.style.display = 'none');
    if (btnSaveModal) btnSaveModal.addEventListener('click', () => {
        modal.style.display = 'none';
        showToast("Trámite actualizado correctamente", "success");
    });
}

// Ocultar todas las secciones
function hideAllSections() {
    Object.values(sections).forEach(sec => {
        if (sec) sec.style.display = 'none';
    });
}

// Mostrar una sección específica
function showSection(id) {
    hideAllSections();
    if (sections[id]) {
        sections[id].style.display = 'block';
    }
}

// Lógica de Autenticación
function handleLogin(e) {
    e.preventDefault();
    const userVal = inputUser.value.trim();
    const passVal = inputPass.value.trim();

    // Aceptar cualquier usuario y contraseña para propósitos de demostración
    if (currentRole === 'mmo') {
        loggedUser = { role: 'mmo', user: userVal, pass: passVal, name: 'Rodrigo Aguirre' };
    } else {
        loggedUser = { role: 'comitente', user: userVal, pass: passVal, name: 'Cliente Demo', legajo: '4589/2026' };
    }

    showToast(`¡Bienvenido ${loggedUser.name}! Sesión iniciada como ${loggedUser.role.toUpperCase()}`, "success");
    setupDashboard();
}

// Configurar el entorno post-login según el rol
function setupDashboard() {
    // Mostrar layout principal
    document.getElementById('sidebar').style.display = 'block';
    document.getElementById('header-right').style.display = 'flex';
    
    // Configurar nombre y avatar de usuario
    document.getElementById('header-user-name').textContent = loggedUser.name.toUpperCase();
    document.getElementById('header-profile-pic').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedUser.name)}&background=0284c7&color=fff&rounded=true`;

    if (loggedUser.role === 'mmo') {
        document.getElementById('nav-contratos').style.display = 'block';
        document.getElementById('nav-marco-legal').style.display = 'flex';
    } else {
        document.getElementById('nav-contratos').style.display = 'none';
        document.getElementById('nav-marco-legal').style.display = 'none';
        // Ocultar botón nuevo legajo
        const btnNuevoLegajo = document.getElementById('btn-nuevo-legajo');
        if (btnNuevoLegajo) btnNuevoLegajo.style.display = 'none';
    }

    // Activar la vista de expedientes por defecto
    showSection('expedientes');

    // Renderizar los expedientes
    renderExpedientes();
}

// Renderizar Expedientes dinámicamente
function renderExpedientes() {
    expedientesContainer.innerHTML = '';

    // Filtrar expedientes: El MMO ve todos, el comitente solo el suyo.
    let expToShow = [];
    if (loggedUser.role === 'mmo') {
        expToShow = mockDB.expedientes;
    } else {
        // Asume que la clave (pass) del comitente en el mockDB coincide o se puede buscar por el legajo del usuario
        expToShow = mockDB.expedientes.filter(e => e.legajo === loggedUser.pass || e.legajo === loggedUser.legajo);
    }

    if (expToShow.length === 0) {
        expedientesContainer.innerHTML = '<p style="text-align:center; padding: 20px; color: #64748b;">No se encontraron legajos asociados.</p>';
        return;
    }

    expToShow.forEach(exp => {
        // Crear wrapper del expediente
        const divExp = document.createElement('div');
        divExp.style.marginBottom = "40px";
        divExp.style.paddingBottom = "20px";
        divExp.style.borderBottom = "1px solid var(--border-light)";

        // Wrapper div expedientes
        divExp.style.cursor = 'pointer'; // Para indicar que es clickeable

        // Encabezado Meta
        const metaDiv = document.createElement('div');
        metaDiv.className = "meta-expediente";
        metaDiv.innerHTML = `
            <span class="badge badge-success"><i class="fa-solid fa-hashtag"></i> Expediente Nº ${exp.legajo}</span>
            <span class="badge"><i class="fa-regular fa-calendar"></i> Ingreso: ${exp.ingreso}</span>
            <span class="badge"><i class="fa-solid fa-map-location-dot"></i> ${exp.lote}</span>
        `;
        divExp.appendChild(metaDiv);

        // Barra de progreso
        const progDiv = document.createElement('div');
        progDiv.className = "progreso-legal-wrapper";
        progDiv.innerHTML = `
            <div class="progreso-legal-header">
                <strong>Avance del Trámite</strong>
                <span>${exp.avance}% Completado</span>
            </div>
            <div class="bar-background">
                <div class="bar-fill" style="width: ${exp.avance}%;"></div>
            </div>
        `;
        divExp.appendChild(progDiv);

        // Pasos (Workflow)
        const wfDiv = document.createElement('div');
        wfDiv.className = "workflow";

        exp.pasos.forEach(paso => {
            let badgeHtml = '';
            if (paso.doc) {
                badgeHtml = `
                    <div class="document-badge txt-success">
                        <i class="fa-solid fa-file-pdf"></i> ${paso.doc}
                    </div>
                `;
            }

            wfDiv.innerHTML += `
                <div class="workflow-step ${paso.estado}">
                    <div class="step-icon"><i class="fa-solid ${paso.icono}"></i></div>
                    <div class="step-content">
                        <h3>${paso.titulo}</h3>
                        <p>${paso.desc}</p>
                        ${badgeHtml}
                    </div>
                </div>
            `;
        });

        divExp.appendChild(wfDiv);
        expedientesContainer.appendChild(divExp);
    });
}

// Lógica de Creación de Contratos
async function handleContratoSubmit(e) {
    e.preventDefault();

    const btnSubmit = e.target.querySelector('.btn-submit');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando...';
    btnSubmit.disabled = true;

    try {
        const nombreComitente = document.getElementById('nombre-comitente').value;
        const dni = document.getElementById('dni-comitente-contrato').value;
        const domicilioComitente = document.getElementById('domicilio-comitente').value;

        const objetoConstruccion = document.getElementById('objeto-construccion').value;
        const ubicacionTerreno = document.getElementById('ubicacion-terreno').value;

        const nombreConstructor = document.getElementById('nombre-constructor').value;
        const domicilioConstructor = document.getElementById('domicilio-constructor').value;

        const nombreProfesional = document.getElementById('nombre-profesional').value;
        const domicilioProfesional = document.getElementById('domicilio-profesional').value;

        const tipo = document.getElementById('tipo-contrato').value;
        const plazo = document.getElementById('plazo-ejecucion').value;
        const formaPago = document.getElementById('forma-pago').value;

        const seguroRC = document.getElementById('seguro-rc').checked;
        const seguroTR = document.getElementById('seguro-tr').checked;

        let seguros = [];
        if (seguroRC) seguros.push("Responsabilidad Civil");
        if (seguroTR) seguros.push("Todo Riesgo Construcción");

        const nuevoContrato = {
            id: Date.now(),
            fecha: new Date().toLocaleDateString(),
            nombreComitente: nombreComitente,
            dniComitente: dni,
            tipoContrato: tipo,
            plazoMeses: plazo,
            formaPago: formaPago,
            seguros: seguros
        };

        mockDB.contratos.push(nuevoContrato);

        // Generar PDF limpio y profesional con jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Colores y Fuentes
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(30, 58, 138); // primary-color

        // Cabecera
        doc.text("SIGIL-MMO", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Sistema de Gestión Integral Legal", 105, 27, { align: "center" });

        // Línea separadora
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 32, 190, 32);

        if (tipo === "Ajuste Alzado") {
            // Título del Documento Especial
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("MODELO DE CLÁUSULAS GENERALES", 105, 45, { align: "center" });
            doc.text("PARA UN CONTRATO POR AJUSTE ALZADO", 105, 52, { align: "center" });

            doc.setFontSize(11);
            let y = 65;

            doc.setFont("helvetica", "bold");
            doc.text("I. Objeto del Contrato y Condiciones de su Ejecución", 20, y);

            y += 10;
            doc.text("1. Enunciado.", 20, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            const segurosText = seguros.length > 0 ? seguros.join(" y ") : "ningún seguro adicional";
            const p1 = `El presente contrato, celebrado entre ${nombreComitente} con domicilio en ${domicilioComitente}, en adelante "el Comitente", por una parte, y por la otra ${nombreConstructor} con domicilio en ${domicilioConstructor}, en adelante "el Contratista", tiene por objeto la construcción de ${objetoConstruccion}, en el terreno sito en ${ubicacionTerreno} de acuerdo a planos y demás elementos preparados por ${nombreProfesional}, con domicilio en ${domicilioProfesional}, en adelante "el Profesional", y que, firmados o rubricados por ambas partes contratantes integran este contrato. El plazo de ejecución será de ${plazo} meses y la forma de pago será: ${formaPago}. Seguros requeridos: ${segurosText}.`;
            const lines1 = doc.splitTextToSize(p1, 170);
            doc.text(lines1, 20, y);
            y += lines1.length * 5 + 5;

            doc.setFont("helvetica", "bold");
            doc.text("2. Cargos del contratista.", 20, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            const p2 = "Estarán a cargo del Contratista, hasta la completa terminación de las obras, de acuerdo a las indicaciones y fines que los planes y especificaciones señalan: a) todos los gastos que origine la obra: materiales, salarios, enseres, luz, fuerza motriz, etc.; b) todas las tramitaciones, permisos, planos y documentos relacionados con la obra, que deban tramitarse ante las autoridades correspondientes.";
            const lines2 = doc.splitTextToSize(p2, 170);
            doc.text(lines2, 20, y);
            y += lines2.length * 5 + 5;

            doc.setFont("helvetica", "bold");
            doc.text("3. Declaración del Contratista.", 20, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            const p3 = "El Contratista manifiesta haber estudiado y analizado los planos y especificaciones de este contrato.";
            const lines3 = doc.splitTextToSize(p3, 170);
            doc.text(lines3, 20, y);
            y += lines3.length * 5 + 5;

            doc.setFont("helvetica", "bold");
            doc.text("II. Dirección y vigilancia de las obras", 20, y);
            y += 10;

            doc.text("5. Superintendencia de los trabajos. Policía de obra.", 20, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            const p5 = "La superintendencia será ejercida por el profesional; en consecuencia, éste dará al Contratista las instrucciones que entienda pertinentes para el adelanto de la obra y la correcta ejecución de los trabajos; trasmitirá las órdenes para modificaciones o trabajos adicionales; podrá rechazar los materiales que juzgare defectuosos.";
            const lines5 = doc.splitTextToSize(p5, 170);
            doc.text(lines5, 20, y);
            y += lines5.length * 5 + 15;

            // Firmas
            if (y > 250) {
                doc.addPage();
                y = 30;
            }
            doc.setDrawColor(0, 0, 0);
            doc.line(30, y, 90, y);
            doc.line(120, y, 180, y);

            y += 5;
            doc.text("Firma Profesional (MMO)", 40, y);
            doc.text("Firma Comitente", 135, y);

        } else {
            // Título del Documento Estándar
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("CONTRATO DE SERVICIOS PROFESIONALES", 105, 45, { align: "center" });

            // Cuerpo del Contrato
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            const margenIzq = 20;
            let y = 60;

            doc.text(`En la fecha ${nuevoContrato.fecha}, se celebra el presente contrato entre el Profesional`, margenIzq, y);
            y += 7;
            doc.text(`Matriculado (${nombreProfesional}) y el Comitente ${nombreComitente} (DNI/CUIT Nº ${dni}),`, margenIzq, y);
            y += 7;
            doc.text(`para la obra de ${objetoConstruccion} en ${ubicacionTerreno},`, margenIzq, y);
            y += 7;
            doc.text(`sujetándose a las siguientes cláusulas y condiciones:`, margenIzq, y);

            y += 15;
            doc.setFont("helvetica", "bold");
            doc.text("PRIMERA - Tipo de Contrato:", margenIzq, y);
            doc.setFont("helvetica", "normal");
            doc.text(`La encomienda se realizará bajo la modalidad de ${tipo}.`, margenIzq, y + 7);

            y += 20;
            doc.setFont("helvetica", "bold");
            doc.text("SEGUNDA - Plazo de Ejecución:", margenIzq, y);
            doc.setFont("helvetica", "normal");
            doc.text(`El plazo estimado para la finalización de las tareas es de ${plazo} meses.`, margenIzq, y + 7);

            y += 20;
            doc.setFont("helvetica", "bold");
            doc.text("TERCERA - Forma de Pago:", margenIzq, y);
            doc.setFont("helvetica", "normal");
            doc.text(`Los honorarios profesionales serán abonados mediante: ${formaPago}.`, margenIzq, y + 7);

            y += 20;
            doc.setFont("helvetica", "bold");
            doc.text("CUARTA - Seguros y Coberturas:", margenIzq, y);
            doc.setFont("helvetica", "normal");
            const segurosText = seguros.length > 0 ? seguros.join(" y ") : "Ningún seguro adicional especificado.";
            doc.text(`Para la presente obra se requerirán las pólizas de: ${segurosText}.`, margenIzq, y + 7);

            // Firmas
            y += 40;
            doc.setDrawColor(0, 0, 0);
            doc.line(30, y, 90, y);
            doc.line(120, y, 180, y);

            y += 5;
            doc.text("Firma Profesional (MMO)", 40, y);
            doc.text("Firma Comitente", 135, y);
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("Documento generado digitalmente a través de SIGIL-MMO.", 105, 280, { align: "center" });

        // Descargar
        doc.save(`Contrato_${dni}.pdf`);

        // Limpiar formulario
        formContratos.reset();
        showToast('Contrato redactado y exportado exitosamente con formato profesional.', 'success');

    } catch (error) {
        console.error("Error generando PDF:", error);
        showToast("Ocurrió un error al generar el PDF. Verifica la consola para más detalles.", "warning");
    } finally {
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
    }
}

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', initApp);
