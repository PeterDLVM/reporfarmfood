const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("Almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

server.use(middlewares);

// Middleware para soportar eliminar múltiples productos
server.use(jsonServer.bodyParser);

// Eliminar productos: elimina los productos cuyo id_producto esté en el array de IDs
server.post("/productos/eliminar", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "Formato inválido. Se espera un array de IDs." });
  }

  const db = router.db; // Acceso directo al archivo JSON
  const productos = db.get("productos").value(); // Obtener productos actuales

  // Filtrar productos que no están en los IDs a eliminar
  const productosActualizados = productos.filter((producto) => !ids.includes(producto.id_producto));
  db.set("productos", productosActualizados).write(); // Guardar cambios en el archivo JSON

  res.status(200).json({ message: "Productos eliminados correctamente" });
});

// Crear un nuevo producto: aquí asignamos el id_producto manualmente
server.post("/productos", (req, res) => {
  const { nombre, categoria, stock } = req.body;

  // Validar que los campos obligatorios estén presentes
  if (!nombre || !categoria || stock == null) {
    return res.status(400).json({ error: "Faltan datos en el producto." });
  }

  // Crear el nuevo producto y asignar un id_producto manualmente
  const db = router.db;
  const productos = db.get("productos").value(); // Obtener productos actuales

  // Generamos un id_producto basado en el último producto (si existe) o un número único
  const newId = productos.length > 0 ? (parseInt(productos[productos.length - 1].id_producto) + 1).toString() : "1";

  const newProduct = {
    id_producto: newId, // Asignamos el id_producto manualmente
    nombre,
    categoria,
    stock
  };

  // Agregar el nuevo producto al archivo JSON
  const addedProduct = db.get("productos").push(newProduct).write();

  // Devuelve el producto creado con su id_producto asignado
  res.status(201).json(addedProduct[addedProduct.length - 1]);
});

// Editar un producto existente: actualizar un producto por su id_producto
server.put("/productos/:id", (req, res) => {
  const { id } = req.params;  // ID del producto a editar
  const { nombre, categoria, stock } = req.body;  // Datos a actualizar

  // Validar que los campos obligatorios estén presentes
  if (!nombre || !categoria || stock == null) {
    return res.status(400).json({ error: "Faltan datos en el producto." });
  }

  const db = router.db;
  const productos = db.get("productos").value();  // Obtener productos actuales

  // Buscar el producto por id_producto
  const productIndex = productos.findIndex(producto => producto.id_producto === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  // Actualizar el producto
  const updatedProduct = {
    ...productos[productIndex],  // Mantener los datos antiguos
    nombre,
    categoria,
    stock
  };

  // Reemplazar el producto en el archivo JSON
  db.get("productos")
    .splice(productIndex, 1, updatedProduct)  // Reemplazar el producto editado
    .write();

  // Responder con el producto actualizado
  res.status(200).json(updatedProduct);
});

server.use(router);

server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

