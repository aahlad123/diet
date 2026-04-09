const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ADMIN_EMAIL = "aahlad123@gamil.com";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "app-data.json");

const defaultGoals = {
  calories: 2200,
  protein: 150,
  carbs: 220,
  fat: 70,
};

ensureDataStore();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === "/healthz" || url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    serveStatic(response, url.pathname);
  } catch (error) {
    sendJson(response, 500, { error: "Internal server error." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Diet backend running on http://${HOST}:${PORT}`);
});

async function handleApi(request, response, url) {
  const method = request.method;
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/healthz") {
    return sendJson(response, 200, { ok: true });
  }

  if (method === "POST" && pathname === "/api/auth/signup") {
    const body = await readJsonBody(request);
    return handleSignup(response, body);
  }

  if (method === "POST" && pathname === "/api/auth/login") {
    const body = await readJsonBody(request);
    return handleLogin(response, body);
  }

  if (method === "GET" && pathname === "/api/auth/session") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    return sendJson(response, 200, { user: session.user });
  }

  if (method === "POST" && pathname === "/api/auth/logout") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    const data = readData();
    data.sessions = data.sessions.filter((entry) => entry.token !== session.token);
    appendAuditEvent(data, "logout", session.user.email);
    writeData(data);
    return sendJson(response, 200, { ok: true });
  }

  if (method === "GET" && pathname === "/api/goals") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    const data = readData();
    return sendJson(response, 200, {
      goals: data.goalsByUser[session.user.id] || { ...defaultGoals },
    });
  }

  if (method === "PUT" && pathname === "/api/goals") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    const body = await readJsonBody(request);
    const data = readData();
    data.goalsByUser[session.user.id] = sanitizeGoals(body);
    writeData(data);
    return sendJson(response, 200, {
      goals: data.goalsByUser[session.user.id],
    });
  }

  if (method === "GET" && pathname === "/api/meals") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    const date = url.searchParams.get("date");
    const meals = readData()
      .meals.filter((meal) => meal.userId === session.user.id && (!date || meal.date === date))
      .sort((left, right) => (right.createdAt || "").localeCompare(left.createdAt || ""));
    return sendJson(response, 200, { meals });
  }

  if (method === "POST" && pathname === "/api/meals") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    const body = await readJsonBody(request);
    const today = getTodayDateKey();
    if (body.date !== today) {
      return sendJson(response, 400, { error: "Only today's meals can be added." });
    }

    const meal = sanitizeMeal(body, session.user.id);
    const data = readData();
    data.meals.unshift(meal);
    writeData(data);
    return sendJson(response, 201, { meal });
  }

  if (method === "DELETE" && pathname.startsWith("/api/meals/")) {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }

    const mealId = pathname.split("/").pop();
    const data = readData();
    const meal = data.meals.find((entry) => entry.id === mealId && entry.userId === session.user.id);
    if (!meal) {
      return sendJson(response, 404, { error: "Meal not found." });
    }
    if (meal.date !== getTodayDateKey()) {
      return sendJson(response, 400, { error: "Previous days are read-only." });
    }

    data.meals = data.meals.filter((entry) => entry.id !== mealId);
    writeData(data);
    return sendJson(response, 200, { ok: true });
  }

  if (method === "GET" && pathname === "/api/history") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    const data = readData();
    return sendJson(response, 200, {
      days: buildHistory(data, session.user.id),
    });
  }

  if (method === "GET" && pathname === "/api/admin/audit") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    if (session.user.email !== ADMIN_EMAIL) {
      return sendJson(response, 403, { error: "Admin access required." });
    }
    const data = readData();
    return sendJson(response, 200, { events: data.auditEvents });
  }

  if (method === "GET" && pathname === "/api/admin/notifications") {
    const session = requireSession(request, response);
    if (!session) {
      return;
    }
    if (session.user.email !== ADMIN_EMAIL) {
      return sendJson(response, 403, { error: "Admin access required." });
    }
    const data = readData();
    return sendJson(response, 200, {
      notifications: data.notifications.filter((entry) => entry.adminEmail === ADMIN_EMAIL),
    });
  }

  sendJson(response, 404, { error: "Route not found." });
}

function handleSignup(response, body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email) {
    return sendJson(response, 400, { error: "Email is required." });
  }
  if (password.length < 4) {
    return sendJson(response, 400, { error: "Password must be at least 4 characters." });
  }

  const data = readData();
  if (data.users.some((user) => user.email === email)) {
    return sendJson(response, 409, { error: "This email already has an account." });
  }

  const passwordSalt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, passwordSalt);
  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    passwordSalt,
    createdAt: new Date().toISOString(),
  };

  data.users.push(user);
  data.goalsByUser[user.id] = { ...defaultGoals };
  appendAuditEvent(data, "signup", email);
  data.notifications.unshift({
    id: crypto.randomUUID(),
    type: "new_registration",
    adminEmail: ADMIN_EMAIL,
    registeredEmail: email,
    timestamp: new Date().toISOString(),
    status: "pending_email_service",
    message: `New customer registered with ${email}.`,
  });
  writeData(data);

  sendJson(response, 201, { ok: true });
}

function handleLogin(response, body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const data = readData();
  const user = data.users.find((entry) => entry.email === email);

  if (!user || hashPassword(password, user.passwordSalt) !== user.passwordHash) {
    appendAuditEvent(data, "login_failed", email);
    writeData(data);
    return sendJson(response, 401, { error: "Incorrect email or password." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  data.sessions = data.sessions.filter((entry) => entry.userId !== user.id);
  data.sessions.unshift({
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
  });
  appendAuditEvent(data, "login", user.email);
  writeData(data);

  sendJson(response, 200, {
    token,
    user: publicUser(user),
  });
}

function requireSession(request, response) {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) {
    sendJson(response, 401, { error: "Authentication required." });
    return null;
  }

  const data = readData();
  const session = data.sessions.find((entry) => entry.token === token);
  if (!session) {
    sendJson(response, 401, { error: "Session expired. Please log in again." });
    return null;
  }

  const user = data.users.find((entry) => entry.id === session.userId);
  if (!user) {
    sendJson(response, 401, { error: "User not found." });
    return null;
  }

  return { token, user: publicUser(user) };
}

function buildHistory(data, userId) {
  const goals = data.goalsByUser[userId] || { ...defaultGoals };
  const meals = data.meals.filter((meal) => meal.userId === userId);
  const grouped = new Map();

  meals.forEach((meal) => {
    if (!grouped.has(meal.date)) {
      grouped.set(meal.date, []);
    }
    grouped.get(meal.date).push(meal);
  });

  if (!grouped.has(getTodayDateKey())) {
    grouped.set(getTodayDateKey(), []);
  }

  return [...grouped.entries()]
    .map(([date, dayMeals]) => {
      const totals = dayMeals.reduce(
        (accumulator, meal) => ({
          calories: accumulator.calories + meal.calories,
          protein: accumulator.protein + meal.protein,
          carbs: accumulator.carbs + meal.carbs,
          fat: accumulator.fat + meal.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      const onTrack =
        totals.calories <= goals.calories &&
        totals.protein >= goals.protein &&
        totals.carbs <= goals.carbs &&
        totals.fat <= goals.fat;

      return {
        date,
        mealCount: dayMeals.length,
        totals,
        status: dayMeals.length === 0 ? "No meals yet" : onTrack ? "On limit" : "Off limit",
      };
    })
    .sort((left, right) => right.date.localeCompare(left.date));
}

function sanitizeGoals(body) {
  return {
    calories: positiveNumber(body.calories),
    protein: positiveNumber(body.protein),
    carbs: positiveNumber(body.carbs),
    fat: positiveNumber(body.fat),
  };
}

function sanitizeMeal(body, userId) {
  return {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    date: String(body.date),
    name: String(body.name || "").trim(),
    type: String(body.type || "Custom"),
    description: String(body.description || "").trim(),
    calories: positiveNumber(body.calories),
    protein: positiveNumber(body.protein),
    carbs: positiveNumber(body.carbs),
    fat: positiveNumber(body.fat),
    ingredients: Array.isArray(body.ingredients) ? body.ingredients : [],
  };
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function appendAuditEvent(data, type, email) {
  data.auditEvents.unshift({
    id: crypto.randomUUID(),
    type,
    email,
    timestamp: new Date().toISOString(),
  });
  data.auditEvents = data.auditEvents.slice(0, 500);
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function ensureDataStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    writeData({
      users: [],
      sessions: [],
      meals: [],
      goalsByUser: {},
      auditEvents: [],
      notifications: [],
    });
  }
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, DATA_FILE);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;
      if (rawBody.length > 1_000_000) {
        reject(new Error("Payload too large."));
      }
    });

    request.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    request.on("error", reject);
  });
}

function serveStatic(response, pathname) {
  const targetPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(targetPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendText(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": getContentType(filePath),
    });
    response.end(content);
  });
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  };
  return types[extension] || "text/plain; charset=utf-8";
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
