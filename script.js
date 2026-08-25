/* ==========================================
   EXPLORA MAZAMARI — Script principal
   ========================================== */

/* =========================
   MENÚ HAMBURGUESA
   ========================= */
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("active");
  menuToggle.setAttribute("aria-expanded", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

/* =========================
   HEADER SCROLL EFFECT
   ========================= */
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 80);
});

/* =========================
   SCROLL REVEAL (Intersection Observer)
   ========================= */
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* =========================
   CARRITO DE COMPRAS
   ========================= */
let carrito = JSON.parse(localStorage.getItem("carrito_mazamari")) || [];

const listaCarrito = document.getElementById("lista-carrito");
const totalSpan = document.getElementById("total");
const vaciarBtn = document.getElementById("vaciar-carrito");

function guardarCarrito() {
  localStorage.setItem("carrito_mazamari", JSON.stringify(carrito));
}

function mostrarCarrito() {
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML =
      '<li class="empty-cart-msg">Tu carrito está vacío</li>';
    totalSpan.textContent = "0.00";
    return;
  }

  let total = 0;

  carrito.forEach((item, index) => {
    total += item.precio * item.cantidad;
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.nombre} ${item.cantidad > 1 ? `× ${item.cantidad}` : ""}</span>
      <span>S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
      <button class="btn-remove" data-index="${index}" aria-label="Eliminar ${item.nombre}">✕</button>
    `;
    listaCarrito.appendChild(li);
  });

  totalSpan.textContent = total.toFixed(2);

  // Event listeners para eliminar
  document.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      eliminarItem(idx);
    });
  });
}

function agregarCarrito(nombre, precio) {
  const existente = carrito.find((item) => item.nombre === nombre);
  if (existente) {
    existente.cantidad += 1;
    mostrarToast(`+1 ${nombre}`, "success");
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
    mostrarToast(`${nombre} agregado al carrito`, "success");
  }
  guardarCarrito();
  mostrarCarrito();
}

function eliminarItem(index) {
  const item = carrito[index];
  carrito.splice(index, 1);
  guardarCarrito();
  mostrarCarrito();
  mostrarToast(`${item.nombre} eliminado`, "error");
}

if (vaciarBtn) {
  vaciarBtn.addEventListener("click", () => {
    if (carrito.length === 0) return;
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
    mostrarToast("Carrito vaciado", "error");
  });
}

// Delegación de eventos para botones "Agregar"
document.querySelectorAll(".btn-add").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.currentTarget.closest(".producto");
    const nombre = card.dataset.nombre;
    const precio = parseFloat(card.dataset.precio);
    agregarCarrito(nombre, precio);
  });
});

// Iniciar carrito
mostrarCarrito();

/* =========================
   PEDIDO POR WHATSAPP
   ========================= */
const WHATSAPP_NUMERO = "51901579093"; // +51 901 579 093
const btnWhatsapp = document.getElementById("btn-whatsapp");

if (btnWhatsapp) {
  btnWhatsapp.addEventListener("click", () => {
    if (carrito.length === 0) {
      mostrarToast("Tu carrito está vacío. Agrega productos primero", "error");
      return;
    }

    let mensaje = "*Nuevo pedido - Explora Mazamari*\n\n";
    let total = 0;

    carrito.forEach((item) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      mensaje += `▪ ${item.nombre}`;
      if (item.cantidad > 1) mensaje += ` (x${item.cantidad})`;
      mensaje += ` - S/ ${subtotal.toFixed(2)}\n`;
    });

    mensaje += `\n*Total: S/ ${total.toFixed(2)}*\n\n`;
    mensaje += "Hola, quisiera confirmar este pedido. ¡Gracias!";

    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    mostrarToast("Abriendo WhatsApp con tu pedido...", "success");
  });
}

/* =========================
   TOAST SYSTEM
   ========================= */
function mostrarToast(mensaje, tipo = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.35s var(--ease) forwards";
    setTimeout(() => toast.remove(), 350);
  }, 2500);
}

/* =========================
   FORMULARIO DE CONTACTO
   ========================= */
const form = document.getElementById("formulario");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const mensaje = document.getElementById("mensaje");

  let valido = true;

  // Resetear errores
  document.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll("input.error, textarea.error").forEach((el) =>
    el.classList.remove("error")
  );

  if (!nombre.value.trim()) {
    mostrarError(nombre, "Por favor ingresa tu nombre");
    valido = false;
  }

  if (!correo.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value)) {
    mostrarError(correo, "Por favor ingresa un correo válido");
    valido = false;
  }

  if (!mensaje.value.trim()) {
    mostrarError(mensaje, "Por favor escribe un mensaje");
    valido = false;
  }

  if (valido) {
    mostrarToast("Mensaje enviado correctamente", "success");
    form.reset();
  }
});

function mostrarError(input, msg) {
  input.classList.add("error");
  const errorSpan = input.closest(".form-group").querySelector(".form-error");
  if (errorSpan) errorSpan.textContent = msg;
  input.focus();
}

/* =========================
   SCROLL SUAVE (fallback para navegadores sin scroll-behavior)
   ========================= */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* =========================
   MODAL - LUGARES TURÍSTICOS
   ========================= */
const modal = document.getElementById("modal-lugar");
const modalClose = document.getElementById("modal-close");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalTiempo = document.getElementById("modal-tiempo");
const modalUbicacion = modal.querySelector("#modal-ubicacion span");
const modalDescripcion = document.getElementById("modal-descripcion");
const modalHorario = document.getElementById("modal-horario");
const modalActividades = document.getElementById("modal-actividades");
const modalConsejo = document.getElementById("modal-consejo");

function abrirModal(card) {
  const datos = card.dataset;

  modalImg.src = datos.img;
  modalImg.alt = card.querySelector("h3").textContent;
  modalTitle.textContent = card.querySelector("h3").textContent;
  modalTiempo.textContent = datos.tiempo || "";
  modalUbicacion.textContent = datos.ubicacion || "";
  modalDescripcion.textContent = datos.descripcion || "";
  modalHorario.textContent = datos.horario || "";

  modalActividades.innerHTML = "";
  if (datos.actividades) {
    datos.actividades.split(",").forEach(function (act) {
      const li = document.createElement("li");
      li.textContent = act.trim();
      modalActividades.appendChild(li);
    });
  }

  modalConsejo.textContent = datos.consejo || "";

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".lugar-card").forEach(function (card) {
  card.addEventListener("click", function () {
    abrirModal(card);
  });

  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirModal(card);
    }
  });

  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", "Ver información de " + card.querySelector("h3").textContent);
});

modalClose.addEventListener("click", cerrarModal);

modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    cerrarModal();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modal.classList.contains("active")) {
    cerrarModal();
  }
});

/* =========================
   MODAL - PRODUCTOS TIENDA
   ========================= */
const modalProd = document.getElementById("modal-producto");
const modalProdClose = document.getElementById("modal-producto-close");
const modalProdImg = document.getElementById("modal-prod-img");
const modalProdTitle = document.getElementById("modal-prod-title");
const modalProdPrecio = document.getElementById("modal-prod-precio");
const modalProdCategoria = modalProd.querySelector("#modal-prod-categoria span");
const modalProdDescripcion = document.getElementById("modal-prod-descripcion");
const modalProdIngredientes = document.getElementById("modal-prod-ingredientes");
const modalProdBeneficios = document.getElementById("modal-prod-beneficios");
const modalProdPeso = document.getElementById("modal-prod-peso");
const modalProdOrigen = document.getElementById("modal-prod-origen");
const modalProdConservacion = document.getElementById("modal-prod-conservacion");
const modalProdBtnAdd = document.getElementById("modal-prod-btn-add");

let productoActivo = null;

function abrirModalProducto(card) {
  const datos = card.dataset;

  modalProdImg.src = datos.img;
  modalProdImg.alt = card.querySelector("h3").textContent;
  modalProdTitle.textContent = card.querySelector("h3").textContent;
  modalProdPrecio.textContent = datos.precio || "";
  modalProdCategoria.textContent = datos.categoria || "";
  modalProdDescripcion.textContent = datos.descripcion || "";
  modalProdIngredientes.textContent = datos.ingredientes || "";
  modalProdBeneficios.textContent = datos.beneficios || "";
  modalProdPeso.textContent = datos.peso || "";
  modalProdOrigen.textContent = datos.origen || "";
  modalProdConservacion.textContent = datos.conservacion || "";

  productoActivo = {
    nombre: datos.nombre,
    precio: parseFloat(datos.precio)
  };

  modalProd.classList.add("active");
  modalProd.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function cerrarModalProducto() {
  modalProd.classList.remove("active");
  modalProd.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  productoActivo = null;
}

document.querySelectorAll(".card.producto").forEach(function (card) {
  card.addEventListener("click", function (e) {
    if (e.target.closest(".btn-add")) return;
    abrirModalProducto(card);
  });

  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirModalProducto(card);
    }
  });

  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", "Ver detalles de " + card.querySelector("h3").textContent);
});

modalProdBtnAdd.addEventListener("click", function () {
  if (productoActivo) {
    agregarCarrito(productoActivo.nombre, productoActivo.precio);
    cerrarModalProducto();
  }
});

modalProdClose.addEventListener("click", cerrarModalProducto);

modalProd.addEventListener("click", function (e) {
  if (e.target === modalProd) {
    cerrarModalProducto();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modalProd.classList.contains("active")) {
    cerrarModalProducto();
  }
});

/* =========================
   GASTRONOMÍA - MODAL PLATOS
   ========================= */
const modalPlato = document.getElementById("modal-plato");
const modalPlatoClose = document.getElementById("modal-plato-close");
const modalPlatoImg = document.getElementById("modal-plato-img");
const modalPlatoTitle = document.getElementById("modal-plato-title");
const modalPlatoPromedio = document.getElementById("modal-plato-promedio");
const modalPlatoDescripcion = document.getElementById("modal-plato-descripcion");
const modalPlatoLugares = document.getElementById("modal-plato-lugares");

/* Lugares donde probar cada plato */
const LUGARES_PLATOS = {
  "enchipado-barbon": [
    { id: "fogon-de-la-selva", nombre: "El Fogón de la Selva", ubicacion: "Jr. Constitución N° 420, Mazamari — a 1 cuadra de la plaza de armas", precio: "S/ 18 – 25" },
    { id: "kivinaki", nombre: "Restaurant Kivinaki", ubicacion: "Av. San Martín N° 560, Mazamari", precio: "S/ 15 – 22" },
    { id: "mercado-central", nombre: "Puestos del Mercado Central", ubicacion: "Mercado Central de Mazamari, calle Comercio", precio: "S/ 10 – 15" }
  ],
  "juane": [
    { id: "casa-del-juane", nombre: "La Casa del Juane", ubicacion: "Jr. Ayacucho N° 128, Mazamari — frente al parque principal", precio: "S/ 12 – 18" },
    { id: "villa-selva", nombre: "Restaurant Turístico Villa Selva", ubicacion: "Carretera Mazamari – Satipo km 3", precio: "S/ 15 – 25" },
    { id: "comedor-dona-rosa", nombre: "Comedor Doña Rosa", ubicacion: "Plaza de Armas de Mazamari, portal norte", precio: "S/ 10 – 15" }
  ],
  "tacacho-cecina": [
    { id: "el-ceibo", nombre: "Restaurant El Ceibo", ubicacion: "Av. Perú N° 350, Mazamari — a media cuadra del puente", precio: "S/ 12 – 20" },
    { id: "kioscos-san-juan", nombre: "Kioscos Fiesta de San Juan", ubicacion: "Plaza de Armas de Mazamari (temporada junio)", precio: "S/ 8 – 12" },
    { id: "mercadillo-gastronomico", nombre: "Mercadillo Gastronómico", ubicacion: "Entrada principal de Mazamari, carretera a Satipo", precio: "S/ 7 – 12" }
  ]
};

/* Comentarios de ejemplo por restaurante (solo la primera visita) */
const COMENTARIOS_SEED = {
  "enchipado-barbon__fogon-de-la-selva": [
    { nombre: "Rosa Quillahuaman", estrellas: 5, texto: "El mejor enchipado que probé en la selva. Picante en su punto y el barbón muy fresco.", fecha: "12/06/2026" }
  ],
  "enchipado-barbon__mercado-central": [
    { nombre: "Diego Torres", estrellas: 4, texto: "Porción generosa y a buen precio. Los puestos se llenan al mediodía, lleguen temprano.", fecha: "28/06/2026" }
  ],
  "juane__casa-del-juane": [
    { nombre: "Lucía Ramos", estrellas: 5, texto: "El aroma de la hoja de bijao es increíble. El mejor juane de Mazamari sin duda.", fecha: "24/06/2026" }
  ],
  "juane__villa-selva": [
    { nombre: "Carlos Meza", estrellas: 4, texto: "Buen ambiente familiar junto a la carretera. El jugo de cocona está buenísimo.", fecha: "02/07/2026" }
  ],
  "tacacho-cecina__el-ceibo": [
    { nombre: "Marco Sandoval", estrellas: 5, texto: "Desayuno perfecto antes de ir a las cataratas. La cecina ahumada como debe ser.", fecha: "03/07/2026" }
  ],
  "tacacho-cecina__mercadillo-gastronomico": [
    { nombre: "Ana Pineda", estrellas: 4, texto: "Riquísimo y abundante por poco dinero. Se espera un poco pero vale la pena.", fecha: "15/07/2026" }
  ]
};

let platoActivo = null;

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function claveComentario(platoId, lugarId) {
  return `${platoId}__${lugarId}`;
}

function obtenerComentarios() {
  let datos = JSON.parse(localStorage.getItem("comentarios_lugares_mazamari")) || {};
  let cambio = false;
  Object.keys(COMENTARIOS_SEED).forEach((clave) => {
    if (!datos[clave]) {
      datos[clave] = COMENTARIOS_SEED[clave];
      cambio = true;
    }
  });
  if (cambio) localStorage.setItem("comentarios_lugares_mazamari", JSON.stringify(datos));
  return datos;
}

function guardarComentarios(datos) {
  localStorage.setItem("comentarios_lugares_mazamari", JSON.stringify(datos));
}

function estrellasTexto(cantidad) {
  const redondeo = Math.round(cantidad);
  return "★".repeat(redondeo) + "☆".repeat(5 - redondeo);
}

/* Estrellas interactivas dentro del formulario de cada restaurante */
function construirEstrellasFormulario(contenedor, form) {
  contenedor.innerHTML = "";

  const pintar = (hasta) => {
    contenedor.querySelectorAll(".estrella-btn").forEach((b) => {
      b.classList.toggle("activa", parseInt(b.dataset.valor) <= hasta);
    });
  };

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "estrella-btn";
    btn.textContent = "★";
    btn.dataset.valor = i;
    btn.setAttribute("aria-label", `Calificar con ${i} ${i === 1 ? "estrella" : "estrellas"}`);
    btn.addEventListener("click", () => {
      form.dataset.calificacion = i;
      pintar(i);
    });
    btn.addEventListener("mouseenter", () => pintar(i));
    contenedor.appendChild(btn);
  }

  contenedor.addEventListener("mouseleave", () =>
    pintar(parseInt(form.dataset.calificacion) || 0)
  );
}

/* Comentarios guardados de un restaurante */
function renderComentariosDe(clave, listaUl) {
  const datos = obtenerComentarios();
  const comentarios = datos[clave] || [];

  listaUl.innerHTML = "";

  if (comentarios.length === 0) {
    listaUl.innerHTML =
      '<li class="sin-comentarios">Aún no hay opiniones de este restaurante. ¡Sé el primero!</li>';
    return;
  }

  comentarios.forEach((c) => {
    const li = document.createElement("li");
    li.className = "comentario-item";
    li.innerHTML = `
      <span class="comentario-avatar">${escapeHtml(c.nombre.trim().charAt(0).toUpperCase())}</span>
      <div class="comentario-contenido">
        <div class="comentario-header">
          <strong>${escapeHtml(c.nombre)}</strong>
          <span class="comentario-estrellas">${"★".repeat(c.estrellas)}${"☆".repeat(5 - c.estrellas)}</span>
          <time>${c.fecha}</time>
        </div>
        <p>${escapeHtml(c.texto)}</p>
      </div>`;
    listaUl.appendChild(li);
  });
}

/* Render de cada restaurante con su calificación, opiniones y formulario */
function renderLugares(platoId) {
  const datos = obtenerComentarios();
  const lugares = LUGARES_PLATOS[platoId] || [];

  modalPlatoLugares.innerHTML = "";

  let sumaEstrellas = 0;
  let totalOpiniones = 0;

  lugares.forEach((lugar) => {
    const clave = claveComentario(platoId, lugar.id);
    const comentarios = datos[clave] || [];
    const promedio = comentarios.length
      ? comentarios.reduce((s, c) => s + c.estrellas, 0) / comentarios.length
      : 0;

    sumaEstrellas += comentarios.reduce((s, c) => s + c.estrellas, 0);
    totalOpiniones += comentarios.length;

    const li = document.createElement("li");
    li.className = "lugar-plato";
    li.dataset.clave = clave;

    li.innerHTML = `
      <button type="button" class="lugar-plato-header" aria-expanded="false">
        <div class="lugar-plato-info">
          <strong>${lugar.nombre}</strong>
          <span class="lugar-plato-dir">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${lugar.ubicacion}
          </span>
          <span class="lugar-rating ${comentarios.length ? "" : "sin-opiniones"}">${
            comentarios.length
              ? `${estrellasTexto(promedio)} ${promedio.toFixed(1)} · ${comentarios.length} ${comentarios.length === 1 ? "opinión" : "opiniones"}`
              : "Sin opiniones aún — sé el primero"
          }</span>
        </div>
        <div class="lugar-plato-meta">
          <span class="lugar-plato-precio">${lugar.precio}</span>
          <svg class="lugar-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </button>
      <div class="lugar-plato-detalle">
        <ul class="comentarios-lista"></ul>
        <form class="form-comentario" novalidate>
          <h4>Comenta tu experiencia en ${lugar.nombre}</h4>
          <input type="text" class="comentario-nombre-input" placeholder="Tu nombre" required maxlength="40" autocomplete="name">
          <div class="estrellas-input" role="radiogroup" aria-label="Califica de 1 a 5 estrellas"></div>
          <textarea class="comentario-texto-input" placeholder="Cuéntanos cómo fue tu experiencia..." required rows="3" maxlength="300"></textarea>
          <button type="submit" class="btn btn-primary btn-comentar">
            Publicar comentario
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>`;

    /* Acordeón: abrir/cerrar el restaurante */
    const header = li.querySelector(".lugar-plato-header");
    header.addEventListener("click", () => {
      const abierto = li.classList.toggle("abierta");
      header.setAttribute("aria-expanded", abierto);
    });

    /* Formulario propio del restaurante */
    const form = li.querySelector(".form-comentario");
    form.dataset.calificacion = "0";
    construirEstrellasFormulario(li.querySelector(".estrellas-input"), form);

    const inputNombre = li.querySelector(".comentario-nombre-input");
    inputNombre.value = localStorage.getItem("nombre_usuario_mazamari") || "";

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const inputTexto = li.querySelector(".comentario-texto-input");
      const nombre = inputNombre.value.trim();
      const texto = inputTexto.value.trim();
      const calificacion = parseInt(form.dataset.calificacion) || 0;

      if (!nombre) {
        mostrarToast("Por favor escribe tu nombre", "error");
        inputNombre.focus();
        return;
      }
      if (calificacion === 0) {
        mostrarToast("Selecciona una calificación de 1 a 5 estrellas", "error");
        return;
      }
      if (!texto) {
        mostrarToast("Cuéntanos tu experiencia", "error");
        inputTexto.focus();
        return;
      }

      const fecha = new Date().toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      const datosActuales = obtenerComentarios();
      if (!datosActuales[clave]) datosActuales[clave] = [];
      datosActuales[clave].unshift({ nombre, estrellas: calificacion, texto, fecha });
      guardarComentarios(datosActuales);

      localStorage.setItem("nombre_usuario_mazamari", nombre);

      renderLugares(platoId);

      /* Mantener abierto el restaurante recién comentado */
      const itemActualizado = modalPlatoLugares.querySelector(`[data-clave="${clave}"]`);
      if (itemActualizado) {
        itemActualizado.classList.add("abierta");
        itemActualizado
          .querySelector(".lugar-plato-header")
          .setAttribute("aria-expanded", "true");
      }

      mostrarToast("¡Gracias por compartir tu experiencia!", "success");
    });

    renderComentariosDe(clave, li.querySelector(".comentarios-lista"));

    modalPlatoLugares.appendChild(li);
  });

  /* Promedio general del plato (badge en el encabezado del modal) */
  if (totalOpiniones > 0) {
    const promedioGeneral = sumaEstrellas / totalOpiniones;
    modalPlatoPromedio.textContent = `★ ${promedioGeneral.toFixed(1)} (${totalOpiniones})`;
  } else {
    modalPlatoPromedio.textContent = "Sin opiniones aún";
  }
}

function abrirModalPlato(card) {
  const datos = card.dataset;
  platoActivo = datos.plato;

  modalPlatoImg.src = datos.img;
  modalPlatoImg.alt = card.querySelector("h3").textContent;
  modalPlatoTitle.textContent = card.querySelector("h3").textContent;
  modalPlatoDescripcion.textContent = datos.descripcion || "";

  renderLugares(platoActivo);

  modalPlato.classList.add("active");
  modalPlato.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function cerrarModalPlato() {
  modalPlato.classList.remove("active");
  modalPlato.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  platoActivo = null;
}

document.querySelectorAll(".plato-card").forEach(function (card) {
  card.addEventListener("click", function () {
    abrirModalPlato(card);
  });

  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirModalPlato(card);
    }
  });

  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", "Ver lugares y opiniones de " + card.querySelector("h3").textContent);
});

modalPlatoClose.addEventListener("click", cerrarModalPlato);

modalPlato.addEventListener("click", function (e) {
  if (e.target === modalPlato) {
    cerrarModalPlato();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modalPlato.classList.contains("active")) {
    cerrarModalPlato();
  }
});
