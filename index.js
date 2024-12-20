const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("Almacen.json"); // Archivo JSON para la base de datos
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

server.use(middlewares);

// Middleware para soportar eliminar múltiples productos
server.use(jsonServer.bodyParser);

// Eliminar productos
server.post("/productos/eliminar", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "Formato inválido. Se espera un array de IDs." });
  }

  const db = router.db;
  const productos = db.get("productos").value();

  const productosActualizados = productos.filter((producto) => !ids.includes(producto.id_producto));
  db.set("productos", productosActualizados).write();

  res.status(200).json({ message: "Productos eliminados correctamente" });
});

// Crear un nuevo producto
server.post("/productos", (req, res) => {
  const { nombre, categoria, stock } = req.body;
  if (!nombre || !categoria || stock == null) {
    return res.status(400).json({ error: "Faltan datos en el producto." });
  }

  const db = router.db;
  const productos = db.get("productos").value();

  const newId = productos.length > 0 ? (parseInt(productos[productos.length - 1].id_producto) + 1).toString() : "1";

  const newProduct = { id_producto: newId, nombre, categoria, stock };
  const addedProduct = db.get("productos").push(newProduct).write();

  res.status(201).json(addedProduct[addedProduct.length - 1]);
});

// Editar un producto existente
server.put("/productos/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, stock } = req.body;

  if (!nombre || !categoria || stock == null) {
    return res.status(400).json({ error: "Faltan datos en el producto." });
  }

  const db = router.db;
  const productos = db.get("productos").value();

  const productIndex = productos.findIndex((producto) => producto.id_producto === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  const updatedProduct = { ...productos[productIndex], nombre, categoria, stock };
  db.get("productos").splice(productIndex, 1, updatedProduct).write();

  res.status(200).json(updatedProduct);
});

// Editar una tarea existente
server.put("/tareas/:id_tarea", (req, res) => {
  const { id_tarea } = req.params;  // Capturar id_tarea de la URL
  const { titulo, descripcion, fecha_inicio, fecha_termino, horas_dedicadas, estado, id_trabajador, id_supervisor } = req.body;

  // Validación
  if (!titulo || !descripcion || !fecha_inicio || !estado || !id_trabajador || !id_supervisor) {
    return res.status(400).json({ error: "Faltan datos en la tarea." });
  }

  const db = router.db;
  const tareas = db.get("tareas").value();

  const tareaIndex = tareas.findIndex((tarea) => tarea.id_tarea === id_tarea);
  if (tareaIndex === -1) {
    return res.status(404).json({ error: "Tarea no encontrada." });
  }

  const updatedTarea = {
    ...tareas[tareaIndex],
    titulo,
    descripcion,
    fecha_inicio,
    fecha_termino,
    horas_dedicadas,
    estado,
    id_trabajador,
    id_supervisor
  };

  // Actualizar la tarea
  db.get("tareas").splice(tareaIndex, 1, updatedTarea).write();

  res.status(200).json(updatedTarea);
});

// Usar el enrutador para manejar las rutas por defecto
server.use(router);

server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
