const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errHandle = require("./errorHandle");
const todos = [
  {
    title: "今天要刷牙",
    id: uuidv4(),
  },
  {
    title: "今天要上班",
    id: uuidv4(),
  },
];

const requestListener = (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url == "/todos" && req.method == "GET") {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
      })
    );
    res.end();
  } else if (req.url == "/todos" && req.method == "POST") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            title,
            id: uuidv4(),
          };
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos,
            })
          );
          res.end();
        } else {
          errHandle(res);
        }
      } catch (err) {
        errHandle(res);
      }
    });
  } else if (req.url == "/todos" && req.method == "DELETE") {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
        message: "刪除成功",
      })
    );
    res.end();
  } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
    const id = req.url.split("/").pop();
    console.log("pop", id);
    const index = todos.findIndex((e) => e.id == id);
    console.log("index", index);
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          message: "刪除成功",
          data: todos,
        })
      );
      res.end();
    } else {
      errHandle(res);
    }
  } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
    req.on("end", () => {
      try {
        const editTodo = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        const index = todos.findIndex((e) => e.id == id);
        if (editTodo !== undefined && index !== -1) {
          todos[index].title = editTodo;
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              message: "更新成功",
              data: todos,
            })
          );
          res.end();
        } else {
          errHandle(res);
        }
      } catch {
        errHandle(res);
      }
    });
  } else if (req.method == "OPTIONS") {
    //option api preflight
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此網址",
      })
    );
    res.end();
  }
};
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);

// // See https://github.com/typicode/json-server#module
// const cors = require('cors');
// const jsonServer = require('json-server')
// const server = jsonServer.create()
// const auth = require("json-server-auth");
// const db = require("./db.json");
// const router = jsonServer.router(db);
// const middlewares = jsonServer.defaults();
// server.use(cors())
// server.use(middlewares)
// server.db = router.db;
// server.use(auth);
// server.use(router)
// server.listen(3000, () => {
//     console.log('JSON Server is running')
// })

// // Export the Server API
// module.exports = server
