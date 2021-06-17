// acceder al row id cards
const cards = document.getElementById("cards");

const items = document.getElementById("items");
const footer = document.getElementById("footer");

// acceder al contenido del template
const templateCard = document.getElementById("template-card").content;
// el fragment es volátil, por lo tanto podemos usar el mismo para todo
const fragment = document.createDocumentFragment();

const templateFooter = document.getElementById("template-footer").content;
const templateCarrito = document.getElementById("template-carrito").content;

let carrito = {};

document.addEventListener("DOMContentLoaded", () => {
  //cuando se carga el documento para poder hacer la llamada
  fetchData(); // la petición para traer los datos

  //para guardar en el localStorage
  if (localStorage.getItem("carrito")) {
    // devuelve los objetos del carrito, usando parse, que transforma
    // texto json en objetos de js
    carrito = JSON.parse(localStorage.getItem("carrito"));
    pintarCarrito();
  }
});

// para manejar el evento de click en la card
cards.addEventListener("click", (e) => {
  // el e nos sirve para capturar el elemento que queremos modificar
  addCarrito(e);
});

//para manejar los botones de aumentar y disminuir
items.addEventListener("click", (e) => {
  btnAccion(e);
});

const fetchData = async () => {
  //esto me trae los datos de la api, que en este caso es un archivo (app.js)
  try {
    // en la vida real es una url
    const res = await fetch("api.json");
    const data = await res.json();
    // console.log(data);
    pintarCard(data);
  } catch (error) {}
};

const pintarCard = (data) => {
  //   console.log(data);

  data.forEach((producto) => {
    // console.log(producto);
    templateCard.querySelector("h5").textContent = producto.title;
    templateCard.querySelector("p").textContent = producto.precio;
    templateCard
      .querySelector("img")
      .setAttribute("src", producto.thumbnailUrl);
    // esto de abajo de hace para añadir un id a cada botón de compra
    // es decir, vincular el botón de la tarjeta con el id del producto
    templateCard.querySelector(".btn-dark").dataset.id = producto.id;
    //clonación del template, no me acuerdo para qué
    const clone = templateCard.cloneNode(true);
    fragment.appendChild(clone);
  });
  cards.appendChild(fragment);
};

//para agregar un ítem al carrito
const addCarrito = (e) => {
  //   console.log(e.target);

  //para verificar si al elemento al que le estamos haciendo
  // click contiene la clase que le pasamos, en este caso btn-dark
  // esto pinta true or false

  //   console.log(e.target.classList.contains('btn-dark'))
  if (e.target.classList.contains("btn-dark")) {
    //esto empuja toda la card con la info hacia set carrito
    // sin necesidad de pedir a la base de datos. solo con js
    setCarrito(e.target.parentElement);
  }
  // para detener cualquier otro evento que se pueda estar generando en
  // nuestro item
  e.stopPropagation();
};

const setCarrito = (objeto) => {
  //este console me mostraría el div class="card-body"
  //   console.log(objeto);
  const producto = {
    //accediendo a la información
    id: objeto.querySelector(".btn-dark").dataset.id,
    title: objeto.querySelector("h5").textContent,
    precio: objeto.querySelector("p").textContent,
    cantidad: 1,
  };

  //acá usamos el objeto que creamos arriba, que está vacío
  if (carrito.hasOwnProperty(producto.id)) {
    producto.cantidad = carrito[producto.id].cantidad + 1;
  }

  // se hace una copia de producto
  // toma un item que es un objeto, al que se le dio comprar
  // y lo copia en la posicion producto.id del objeto carrito
  carrito[producto.id] = { ...producto };
  pintarCarrito();
  // console.log(carrito);
};

const pintarCarrito = () => {
  // console.log(carrito);
  items.innerHTML = "";
  Object.values(carrito).forEach((producto) => {
    templateCarrito.querySelector("th").textContent = producto.id;
    //abajo va All porque vamos a acceder al primer elemento, por eso se usa All
    templateCarrito.querySelectorAll("td")[0].textContent = producto.title;
    templateCarrito.querySelectorAll("td")[1].textContent = producto.cantidad;
    templateCarrito.querySelector(".btn-info").dataset.id = producto.id;
    templateCarrito.querySelector(".btn-danger").dataset.id = producto.id;
    templateCarrito.querySelector("span").textContent =
      producto.cantidad * producto.precio;

    const clone = templateCarrito.cloneNode(true);
    fragment.appendChild(clone);
  });

  items.appendChild(fragment);

  pintarFooter();

  // guarda en el local storage, transformando de objeto a texto json
  localStorage.setItem("carrito", JSON.stringify(carrito));
};

const pintarFooter = () => {
  footer.innerHTML = "";
  if (Object.keys(carrito).length === 0) {
    footer.innerHTML = `<th scope="row" colspan="5"> Carrito vacío
    - comience a comprar!</th>`;
    //este return se hizo porque al vaciar carrito, si no
    // estuviera, se ejecutarían las líneas de abajo y aparecería
    //todavía el botón de vaciar todo
    return;
  }

  //para recorrer el objeto
  //el cero es porque eso es lo que devuelve inicialmente
  //el método reduce. Lo necesita como parámetro
  const nCantidad = Object.values(carrito).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );
  //y ahora para calcular el total de dinero
  const nPrecio = Object.values(carrito).reduce(
    (acc, { cantidad, precio }) => acc + cantidad * precio,
    0
  );

  templateFooter.querySelectorAll("td")[0].textContent = nCantidad;
  templateFooter.querySelector("span").textContent = nPrecio;

  const clone = templateFooter.cloneNode(true);
  fragment.appendChild(clone);
  //como esto no es un ciclo, se agrega directamente sin necesidad
  // de colocar esto: fragment.appendChild(clone);

  footer.appendChild(fragment);

  const btnVaciar = document.getElementById("vaciar-carrito");
  btnVaciar.addEventListener("click", () => {
    carrito = {};
    // console.log(carrito)
    pintarCarrito();
  });
};

//me trae los elementos dentro del tbody items
const btnAccion = (e) => {
  // console.log(e.target);
  //acción de aumentar
  if (e.target.classList.contains("btn-info")) {
    //me traigo el id del objeto para luego poder
    // afectar la cantidad

    //carrito[e.target.dataset.id]

    const producto = carrito[e.target.dataset.id];

    //producto.cantidad = carrito[e.target.dataset.id].cantidad + 1;
    producto.cantidad++;
    carrito[e.target.dataset.id] = { ...producto };
    pintarCarrito();
  }

  if (e.target.classList.contains("btn-danger")) {
    const producto = carrito[e.target.dataset.id];
    producto.cantidad--;
    carrito[e.target.dataset.id] = { ...producto };
    if (producto.cantidad === 0) {
      //me confunde un poco esta línea
      delete carrito[e.target.dataset.id];
    }
    pintarCarrito();
  }
  e.stopPropagation();
};
