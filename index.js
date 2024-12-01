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

// Crear un nuevo producto: no se necesita enviar el id_producto (json-server lo maneja automáticamente)
server.post("/productos", (req, res) => {
  const { nombre, categoria, stock } = req.body;

  // Validar que los campos obligatorios estén presentes
  if (!nombre || !categoria || stock == null) {
    return res.status(400).json({ error: "Faltan datos en el producto." });
  }

  // Crear el nuevo producto sin necesidad de enviar id_producto (json-server asignará uno)
  const newProduct = {
    nombre,
    categoria,
    stock
  };

  // Agregar el nuevo producto al archivo JSON
  const db = router.db;
  const addedProduct = db.get("productos").push(newProduct).write();

  res.status(201).json(addedProduct); // Devuelve el producto creado con su id
});

server.use(router);

server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

