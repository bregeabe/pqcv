import http from "http";
import getInstructions from "./controllers/processor.js";

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = [];
    req.on("data", (chunk) => body.push(chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(body).toString()));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": 86400,
    });
    return res.end();
  }

  if (req.url === "/api/generateInstructions" && req.method === "POST") {
    try {
      const body = await getBody(req);
      const result = getInstructions(body);

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(JSON.stringify(result));
    } catch (err) {
      console.error("Server error:", err);
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
      }
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
