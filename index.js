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

// Eliminar usuarios
server.post("/usuarios/eliminar", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "Formato inválido. Se espera un array de IDs." });
  }

  const db = router.db;
  const usuarios = db.get("usuarios").value();

  const usuariosActualizados = usuarios.filter((usuario) => !ids.includes(usuario.id_usuario));
  db.set("usuarios", usuariosActualizados).write();

  res.status(200).json({ message: "Usuarios eliminados correctamente" });
});

// Crear un nuevo usuario
server.post("/usuarios", (req, res) => {
  const { nombre, apellido, email, telefono, direccion, tipo, username, password, rut } = req.body;

  if (!nombre || !apellido || !email || !telefono || !direccion || !tipo || !username || !password || !rut) {
    return res.status(400).json({ error: "Faltan datos en el usuario." });
  }

  const db = router.db;
  const usuarios = db.get("usuarios").value();

  const newId = usuarios.length > 0 ? (parseInt(usuarios[usuarios.length - 1].id_usuario) + 1).toString() : "1";

  const newUser = { id_usuario: newId, nombre, apellido, email, telefono, direccion, tipo, username, password, rut };
  const addedUser = db.get("usuarios").push(newUser).write();

  res.status(201).json(addedUser[addedUser.length - 1]);
});

// Editar un usuario existente
server.put("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, telefono, direccion, tipo, username, password, rut } = req.body;

  if (!nombre || !apellido || !email || !telefono || !direccion || !tipo || !username || !password || !rut) {
    return res.status(400).json({ error: "Faltan datos en el usuario." });
  }

  const db = router.db;
  const usuarios = db.get("usuarios").value();

  const userIndex = usuarios.findIndex((usuario) => usuario.id_usuario === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  const updatedUser = { ...usuarios[userIndex], nombre, apellido, email, telefono, direccion, tipo, username, password, rut };
  db.get("usuarios").splice(userIndex, 1, updatedUser).write();

  res.status(200).json(updatedUser);
});

// Crear una nueva tarea
server.post("/tareas", (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_termino, horas_dedicadas, estado, id_trabajador, id_supervisor } = req.body;

  if (!titulo || !descripcion || !fecha_inicio || !estado || !id_trabajador || !id_supervisor) {
    return res.status(400).json({ error: "Faltan datos en la tarea." });
  }

  const db = router.db;
  const tareas = db.get("tareas").value();

  const newId = tareas.length > 0 ? (parseInt(tareas[tareas.length - 1].id_tarea) + 1).toString() : "1";

  const nuevaTarea = {
    id_tarea: newId,
    titulo,
    descripcion,
    fecha_inicio,
    fecha_termino: fecha_termino || null,
    horas_dedicadas: horas_dedicadas || 0,
    estado,
    id_trabajador,
    id_supervisor
  };

  const tareaAgregada = db.get("tareas").push(nuevaTarea).write();

  res.status(201).json(tareaAgregada[tareaAgregada.length - 1]);
});

// Editar una solicitud
server.put("/solicitudes/:id", (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: "Estado no proporcionado." });
  }

  const db = router.db;
  const solicitudes = db.get("solicitudes").value();

  const solicitudIndex = solicitudes.findIndex((solicitud) => solicitud.id_solicitud === id);
  if (solicitudIndex === -1) {
    return res.status(404).json({ error: "Solicitud no encontrada." });
  }

  const updatedSolicitud = { ...solicitudes[solicitudIndex], estado };
  db.get("solicitudes").splice(solicitudIndex, 1, updatedSolicitud).write();

  res.status(200).json(updatedSolicitud);
});

// Usar el enrutador para manejar las rutas por defecto
server.use(router);

server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

