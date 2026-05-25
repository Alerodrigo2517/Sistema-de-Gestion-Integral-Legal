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
    'marco-legal': document.getElementById('marco-legal'),
    nuevoLegajo: document.getElementById('nuevo-legajo'),
    dashboardLegajo: document.getElementById('dashboard-legajo'),
    perfil: document.getElementById('perfil'),
    configuracion: document.getElementById('configuracion')
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

    // Envío del formulario de Actas
    const formActas = document.getElementById('form-actas');
    if (formActas) {
        formActas.addEventListener('submit', handleActaSubmit);
    }
    
    const actaTipo = document.getElementById('acta-tipo');
    const actaOrdenExtra = document.getElementById('acta-orden-extra');
    if (actaTipo && actaOrdenExtra) {
        actaTipo.addEventListener('change', (e) => {
            if (e.target.value === 'ORDEN DE SERVICIO') {
                actaOrdenExtra.style.display = 'block';
            } else {
                actaOrdenExtra.style.display = 'none';
            }
        });
    }

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
                } else if (targetId === 'cuenta') {
                    showToast('La sección Cuenta se encuentra en desarrollo.', 'warning');
                }

                // Actualizar active state
                document.querySelectorAll('.sidebar-subitem, .sidebar-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
                // Si es un subitem, activar también su padre
                if (this.classList.contains('sidebar-subitem')) {
                    this.closest('.sidebar-group').querySelector('.group-title').classList.add('active');
                }

                // Cerrar sidebar en mobile al navegar
                if (window.innerWidth <= 767 && !this.classList.contains('group-title')) {
                    document.getElementById('sidebar').classList.remove('open');
                }
            }
        });
    });

    // Eventos Toggle Sidebar
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if (btnToggleSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            if (window.innerWidth <= 767) {
                sidebar.classList.toggle('open');
                sidebar.classList.remove('collapsed');
            } else {
                sidebar.classList.toggle('collapsed');
                sidebar.classList.remove('open');
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

    const btnNavConfiguracion = document.getElementById('btn-nav-configuracion');
    if (btnNavConfiguracion) {
        btnNavConfiguracion.addEventListener('click', () => {
            showSection('configuracion');
        });
    }

    const btnSavePerfil = document.getElementById('btn-save-perfil');
    if (btnSavePerfil) {
        btnSavePerfil.addEventListener('click', () => {
            showToast("Datos de perfil guardados correctamente.", "success");
        });
    }

    const btnChangePassword = document.getElementById('btn-change-password');
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', () => {
            showToast("La contraseña ha sido actualizada con éxito.", "success");
        });
    }

    const btnFirmarOrden = document.getElementById('btn-firmar-orden');
    const txtOrdenDigital = document.getElementById('texto-orden-digital');
    if (btnFirmarOrden && txtOrdenDigital) {
        btnFirmarOrden.addEventListener('click', () => {
            const val = txtOrdenDigital.value.trim();
            if (val === '') {
                showToast("Por favor, redacte la orden antes de firmar.", "warning");
                return;
            }
            showToast("Orden firmada y guardada en el Libro de Órdenes Digital.", "success");
            txtOrdenDigital.value = '';
        });
    }

    // Actas downloads mock
    document.querySelectorAll('.actas-downloads button').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast("Iniciando descarga del documento...", "success");
        });
    });

    // Theme toggle mock
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                showToast("Modo oscuro activado (Simulación)", "success");
            } else {
                showToast("Modo claro activado", "success");
            }
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
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedUser.name)}&background=0284c7&color=fff&rounded=true`;
    document.getElementById('header-user-name').textContent = loggedUser.name.toUpperCase();
    document.getElementById('header-profile-pic').src = avatarUrl;
    
    // Vista Perfil grande
    document.getElementById('perfil-img-large').src = avatarUrl;
    document.getElementById('perfil-nombre-large').textContent = loggedUser.name;
    document.getElementById('perfil-rol-large').textContent = loggedUser.role === 'mmo' ? 'Profesional Matriculado' : 'Comitente';
    document.getElementById('perfil-matricula').value = loggedUser.user;

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

// Lógica de Creación de Actas
async function handleActaSubmit(e) {
    e.preventDefault();

    const btnSubmit = document.getElementById('btn-submit-acta');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF...';
    btnSubmit.disabled = true;

    try {
        const tipoActa = document.getElementById('acta-tipo').value;
        const calle = document.getElementById('acta-calle').value;
        const localidad = document.getElementById('acta-localidad').value;
        const nomenclatura = document.getElementById('acta-nomenclatura').value || 'S/D';
        const parcela = document.getElementById('acta-parcela').value || 'S/D';
        const fechaContrato = document.getElementById('acta-fecha-contrato').value || 'S/D';
        const expMuni = document.getElementById('acta-exp-muni').value || 'S/D';
        const visado = document.getElementById('acta-visado').value || 'S/D';
        const textoOrden = document.getElementById('acta-texto-orden').value || '';

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPos = 20;
        
        // Título Principal
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(tipoActa, 105, yPos, { align: 'center' });
        yPos += 15;
        
        // Datos de Obra
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Obra de referencia:", 20, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.text(`Ubicación: ${calle}, ${localidad}`, 20, yPos);
        yPos += 8;
        doc.text(`Nomenclatura catastral: ${nomenclatura} - Manz/Parc: ${parcela}`, 20, yPos);
        yPos += 8;
        doc.text(`Expediente Municipal N°: ${expMuni} | Visado CAPBA N°: ${visado}`, 20, yPos);
        yPos += 8;
        doc.text(`Fecha De contrato: ${fechaContrato}`, 20, yPos);
        yPos += 15;

        // Texto Genérico y Exacto según DOC-2021
        doc.setFont("helvetica", "normal");
        const fechaHoy = new Date().toLocaleDateString('es-AR');
        
        let textoPrincipal = "";
        let lineasEspeciales = [];
        
        switch(tipoActa) {
            case "ACTA DE INICIO DE OBRA":
                textoPrincipal = `Por la presente y con el fin de establecer plazos y etapas de obra se define el día de la fecha como inicio de la obra de referencia.`;
                break;
            case "ACTA DE REPLANTEO":
                textoPrincipal = `Por la presente se certifica que el contratista ha comprobado que las medidas y ángulos del replanteo concuerdan con las de la documentación del proyecto.\n\nEl contratista partiendo de los puntos fijos de planimetría y nivel indicados ha procedido con las tareas de replanteo con el resultado detallado en los siguientes puntos.\n\nEl contratista ha procedido a trazar los ejes de replanteo de acuerdo con los planos de la documentación del proyecto quedando los mismos materializados en el lugar de la obra.\n\nEl contratista ha procedido a emplazar el nivel +-O.OO de acuerdo con lo indicado en la documentación de proyecto y su posición ha quedado materializada en la obra.\n\nEn prueba de conformidad se suscribe la presente acta.`;
                break;
            case "ACTA DE PARALIZACION DE OBRA":
                textoPrincipal = `Por la presente se acuerda y comunica la paralización de la obra de referencia, siendo el estado de avance de la misma el detallado en la planilla adjunta y comprometiéndose las partes a comunicarse en forma fehaciente el reinicio de los trabajos.\n\nLa determinación de esta decisión es por común acuerdo entre las partes y suspende los plazos del contrato hasta la reanudación de los trabajos.\n\nDe las tareas contratadas se ha realizado el .... % del proyecto y el .... % de la dirección de obra según planilla de estado de obra que se acompaña y que forma parte del presente documento.\n\nSe ha respetado la esencia de lo programado y no han surgido ni ocurrido ampliaciones, supresiones o modificaciones que alteren el contrato del caso.`;
                break;
            case "ACTA DE REINICIO DE OBRA":
                textoPrincipal = `Por la presente se acuerda el día de la fecha como el de reinicio de los trabajos de la obra de referencia.`;
                break;
            case "ACTA DE RECEPCION PROVISORIA":
                textoPrincipal = `En el dia de la fecha quienes suscriben la presente acta declaran lo siguiente:\n\nlos trabajos objeto del contrato de referencia fueron inspeccionados y se encuentran suficientemente terminados de acuerdo con la documentación contractual y las ordenes emitidas por la dirección de obra\n\nSe establece como fecha de recepción provisoria de la obra el día del mes de del año\n\nSe deja constancia que los trabajos fueron completados dentro del plazo contractual y sus ampliaciones (o con un atraso o anticipación de Días)\n\nEl plazo de garantía previsto en la documentación contractual se computará a partir de la fecha establecida en esta acta.\n\nEn el anexo que se adjunta se detallan las fallas y defectos menores registrados durante la inspección realizada, los que deberán ser completados, corregidos o rehechos por el contratista dentro de los dias corridos. La no inclusión de fallas o defectos menores en el anexo solo significa que al momento de la inspección no fueron advertidos o que no se habían evidenciado, lo que no altera las responsabilidades del contratista y su obligación de completar todos los trabajos y subsanar todos los defectos que se manifiesten de acuerdo con la documentación contractual.\n\nEl comitente por medio de esta acta toma posesión y se hace cargo a partir de la fecha de su vigilancia y mantenimiento, cumpliendo con las disposiciones del pliego de condiciones, se deja constancia así mismo de lo siguiente:\n\nDe conformidad se suscribe esta acta por triplicado, por el comitente, el contratista y la dirección de obra.`;
                break;
            case "ACTA DE RECEPCION DEFINITIVA":
                textoPrincipal = `En el día de la fecha quienes suscriben la presente acta declaran lo siguiente:\n\nQue se han cumplido los plazos de garantía de días computados a partir de la fecha a partir de la fecha establecida en el acta de recepción provisoria.\n\nQue en la inspección realizada con fecha .. Se ha constatado que el contratista realizó ejecutó los trabajos necesarios para subsanar las observaciones realizadas en el mismo acta.\n\nQue con fecha Fue aprobada la liquidación final practicad por la dirección de obra y que a la fecha no subsisten saldos impagos\n\nQue se ha devuelto al contratista la garantía de cumplimiento del contrato, obrando esta acta como suficiente recibo.\n\nQue se han cumplido las restantes obligaciones del contrato de fecha\n\nQue de acuerdo con la documentación contractual la recepción definitiva de la obra no releva al contratista de las responsabilidades por vicios ocultos, ni por otros defectos de la obra objeto de su contrato, como consecuencia de la mala calidad de los materiales empleados o deficiencias en la ejecución.\n\nQue subsisten para el contratista las responsabilidades de acuerdo con el Art. 1646 del Código Civil. De conformidad se suscribe esta acta por triplicado, por el comitente, el contratista y la dirección de obra.`;
                break;
            case "ACTA DE DESLIGAMIENTO":
                textoPrincipal = `Por la presente se comunica que a partir de la fecha han cesado las obligaciones profesionales que he contraído con el Sr. por la obra de referencia\n\nEste documento corresponde a las tareas de proyecto y dirección de dicha obra que me encargara el comitente citado\n\nLa determinación de esta decisión es por común acuerdo entre las partes\n\nDe las tareas contratadas se han realizado el .... % del proyecto y el ....% de la dirección de obra, según acta de estado de obra que se acompaña y que forma parte del presente documento.\n\nSe ha respetado la esencia de lo programado y no han surgido ni ocurrido ampliaciones, supresiones o modificaciones que alteren el contrato del caso.\n\nHe percibido del comitente por honorarios de las tareas realizadas la cantidad de $ y he efectuado los depósitos de la cuota de ejercicio profesional de $ y de aportes provisionales de $ . según fotocopia de los comprobantes que se acompañan\n\nPara la toma de conocimiento y a todo efecto que corresponda hago llegar copia de la presente a la Municipalidad de`;
                break;
            case "ACTA DE ESTADO DE OBRA":
                textoPrincipal = `RUBROS                               PORCENTAJE DEL RUBRO                               PORCENTAJE EJECUTADO\n\nInvestigación: 50%\nPrograma de necesidades: 100%\nDiseño del Proyecto: 100%\nComputo de materiales: 1,25%\nCortado de piezas: 2%\nEsamblado de piezas: 0%\nMontaje electrónico: 20%\nProgramación módulo 1: 50,43%\nProgramación arduino uno: 30%\nMontaje de leds: 80,56%\nAutomatizacion de puerta de acceso: 10%\nMontaje y programación de dth11: 45,34%\nProgramación De alarma: 100%\nProgramación de la interface: 40,11%\nPintura de la maqueta: 0%\n\nNOTA: AMPLIAR EN HOJA APARTE COMO ANEXO`;
                break;
            case "ACTA DE PRORROGA DE CONTRATO":
                textoPrincipal = `Por la presente se acuerda en prorrogar el contrato de referencia hasta el Día .................... del mes de .................... del año ....................`;
                break;
            case "ORDEN DE SERVICIO":
                textoPrincipal = `Se comunica a lo siguiente en su carácter de Contratista:\n\n${textoOrden}`;
                break;
            default:
                textoPrincipal = `Documento generado el ${fechaHoy}.`;
        }

        const lines = doc.splitTextToSize(textoPrincipal, 170);
        doc.text(lines, 20, yPos);
        yPos += (lines.length * 6) + 20;

        // Si la posición Y está muy baja (cerca del final de página), añadir nueva página
        if (yPos > 250) {
            doc.addPage();
            yPos = 30;
        }

        // Firmas (Dinámico según tipo)
        doc.line(20, yPos, 70, yPos);
        doc.text("Firma del Profesional", 25, yPos + 5);
        doc.setFontSize(9);
        doc.text("Aclaración:", 20, yPos + 10);
        doc.text("Doc N°:", 20, yPos + 15);
        
        if (tipoActa !== "ACTA DE REPLANTEO" && tipoActa !== "ORDEN DE SERVICIO") {
            doc.line(80, yPos, 130, yPos);
            doc.text("Firma del Comitente", 85, yPos + 5);
            doc.text("Aclaración:", 80, yPos + 10);
            doc.text("Doc N°:", 80, yPos + 15);
        }
        
        if (tipoActa !== "ACTA DE PARALIZACION DE OBRA" && tipoActa !== "ACTA DE DESLIGAMIENTO" && tipoActa !== "ACTA DE ESTADO DE OBRA" && tipoActa !== "ACTA DE PRORROGA DE CONTRATO") {
            let offset = (tipoActa === "ACTA DE REPLANTEO" || tipoActa === "ORDEN DE SERVICIO") ? 80 : 140;
            doc.line(offset, yPos, offset + 50, yPos);
            doc.text("Firma del Contratista", offset + 5, yPos + 5);
            doc.text("Aclaración:", offset, yPos + 10);
            doc.text("Doc N°:", offset, yPos + 15);
        }

        // Guardar
        const safeName = tipoActa.replace(/\s+/g, '_').toLowerCase();
        doc.save(`Acta_${safeName}_${expMuni}.pdf`);

        showToast("Acta PDF generada y anexada al legajo exitosamente.", "success");
        e.target.reset();
        document.getElementById('acta-orden-extra').style.display = 'none';

    } catch (error) {
        console.error("Error al generar PDF:", error);
        showToast("Error al generar el documento PDF.", "warning");
    } finally {
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
    }
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
