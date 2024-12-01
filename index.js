const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("Almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

server.use(middlewares);

// Middleware para soportar eliminar múltiples productos
server.use(jsonServer.bodyParser);
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

server.use(router);

server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
