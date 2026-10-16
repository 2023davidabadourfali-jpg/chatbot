// Variables globales de estado
let arbolDecision = {};
let nodoActual = null;
let nombreUsuario = "";

// Elementos del DOM respetando los nombres indicados
const zonaChat = id("zona-de-chat");
const ingresoOpciones = id("ingreso-de-opciones");

// Función auxiliar para seleccionar por id
function id(nombreId) {
  return document.getElementById(nombreId);
}

// Cargar el JSON del árbol de decisión al iniciar
window.addEventListener("DOMContentLoaded", () => {
  fetch("arbol_decision.json")
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error("Error al cargar JSON");
      return respuesta.json();
    })
    .then((datos) => {
      arbolDecision = datos;
      iniciarConversacion("inicio");
    })
    .catch((error) => {
      console.error(error);
      mostrarMensajeErrorServidor();
    });
});

// Mostrar mensaje si se ejecuta sin servidor local / Live Server
function mostrarMensajeErrorServidor() {
  zonaChat.innerHTML = "";
  agregarMensajeBot(
    "⚠️ Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json."
  );
}

// Iniciar o reanudar conversación en un nodo específico
function iniciarConversacion(idNodo) {
  nodoActual = arbolDecision[idNodo];

  if (!nodoActual) {
    console.error("El nodo no existe:", idNodo);
    return;
  }

  // Personalizar texto reemplazando variable de nombre si existe
  let textoBot = nodoActual.texto;
  if (nombreUsuario) {
    textoBot = textoBot.replace(/{nombre}/g, nombreUsuario);
  }

  agregarMensajeBot(textoBot);
  renderizarOpciones();
}

// Agregar mensaje del bot al área de chat
function agregarMensajeBot(texto) {
  const div = document.createElement("div");
  div.classList.add("mensaje", "bot");
  div.innerText = texto;
  zonaChat.appendChild(div);
  hacerScrollAlFinal();
}

// Agregar mensaje del usuario al área de chat
function agregarMensajeUsuario(texto) {
  const div = document.createElement("div");
  div.classList.add("mensaje", "usuario");
  div.innerText = texto;
  zonaChat.appendChild(div);
  hacerScrollAlFinal();
}

// Mantener el scroll al final de la zona de chat
function hacerScrollAlFinal() {
  zonaChat.scrollTop = zonaChat.scrollHeight;
}

// Renderizar botones de opción o el input según el nodo actual
function renderizarOpciones() {
  ingresoOpciones.innerHTML = "";

  // Si el nodo requiere un input (ejemplo: solicitar nombre)
  if (nodoActual.requiereInput) {
    renderizarCampoInput();
    return;
  }

  // Renderizar botones de opción estándar
  if (nodoActual.opciones && nodoActual.opciones.length > 0) {
    nodoActual.opciones.forEach((opcion) => {
      const boton = document.createElement("button");
      boton.classList.add("btn-opcion");
      
      // Personalizar texto de la opción si contiene {nombre}
      let textoOpcion = opcion.texto;
      if (nombreUsuario) {
        textoOpcion = textoOpcion.replace(/{nombre}/g, nombreUsuario);
      }
      boton.innerText = textoOpcion;

      boton.addEventListener("click", () => {
        // En caso de reiniciar conversación, reseteamos el nombre
        if (opcion.siguiente === "inicio") {
          nombreUsuario = "";
        }
        agregarMensajeUsuario(textoOpcion);
        iniciarConversacion(opcion.siguiente);
      });

      ingresoOpciones.appendChild(boton);
    });
  }
}

// Crear y manejar la entrada de texto mediante input cuando sea imperioso
function renderizarCampoInput() {
  const contenedorForm = document.createElement("div");
  contenedorForm.classList.add("form-input");

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Escribí tu nombre acá...";

  const botonEnviar = document.createElement("button");
  botonEnviar.innerText = "Enviar";

  const divError = document.createElement("div");
  divError.classList.add("mensaje-error");

  const procesarEnvio = () => {
    const valor = input.value.trim();

    // Validación del formato del nombre: Solo letras y espacios, sin números
    const regexNombreValido = /^[a-zA-AáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!valor) {
      mostrarErrorInput("Por favor, ingresá tu nombre.");
      return;
    }

    if (!regexNombreValido.test(valor)) {
      mostrarErrorInput("El nombre no puede contener números ni caracteres especiales.");
      return;
    }

    // Guardar el nombre recordado y avanzar al siguiente nodo
    nombreUsuario = valor;
    agregarMensajeUsuario(valor);
    iniciarConversacion(nodoActual.siguienteInput);
  };

  botonEnviar.addEventListener("click", procesarEnvio);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") procesarEnvio();
  });

  contenedorForm.appendChild(input);
  contenedorForm.appendChild(botonEnviar);
  ingresoOpciones.appendChild(contenedorForm);
  ingresoOpciones.appendChild(divError);

  input.focus();
}

// Mostrar mensaje de validación fallida en el input
function mostrarErrorInput(mensaje) {
  let divError = ingresoOpciones.querySelector(".mensaje-error");
  if (divError) {
    divError.innerText = mensaje;
  }
}
