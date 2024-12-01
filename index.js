const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("Almacen.json"); // Archivo JSON para la base de datos
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

  const db = router.db;
  const productos = db.get("productos").value();

  // Filtrar productos que no están en los IDs a eliminar
  const productosActualizados = productos.filter((producto) => !ids.includes(producto.id_producto));
  db.set("productos", productosActualizados).write();

  res.status(200).json({ message: "Productos eliminados correctamente" });
});

// Crear un nuevo producto: asigna el id_producto manualmente
server.post("/productos", (req, res) => {
  const { nombre, categoria, stock } = req.body;

  // Validar que los campos obligatorios estén presentes
  if (!nombre || !categoria || stock == null) {
    return res.status(400).json({ error: "Faltan datos en el producto." });
  }

  const db = router.db;
  const productos = db.get("productos").value();

  // Generamos un id_producto único basado en el último producto
  const newId = productos.length > 0 ? (parseInt(productos[productos.length - 1].id_producto) + 1).toString() : "1";

  const newProduct = {
    id_producto: newId,
    nombre,
    categoria,
    stock
  };

  // Agregar el nuevo producto al archivo JSON
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

  const productIndex = productos.findIndex(producto => producto.id_producto === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  const updatedProduct = {
    ...productos[productIndex],
    nombre,
    categoria,
    stock
  };

  db.get("productos").splice(productIndex, 1, updatedProduct).write();

  res.status(200).json(updatedProduct);
});

// Eliminar usuarios: elimina los usuarios cuyo id_usuario esté en el array de IDs
server.post("/usuarios/eliminar", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "Formato inválido. Se espera un array de IDs." });
  }

  const db = router.db;
  const usuarios = db.get("usuarios").value();

  // Filtrar usuarios que no están en los IDs a eliminar
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

  const newUser = {
    id_usuario: newId,
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    tipo,
    username,
    password,
    rut
  };

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

  const userIndex = usuarios.findIndex(usuario => usuario.id_usuario === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  const updatedUser = {
    ...usuarios[userIndex],
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    tipo,
    username,
    password,
    rut
  };

  db.get("usuarios").splice(userIndex, 1, updatedUser).write();

  res.status(200).json(updatedUser);
});

// Usar el enrutador para manejar las rutas por defecto
server.use(router);

server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

