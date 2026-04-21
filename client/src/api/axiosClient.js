const DB_KEY = "portal-db-v1";

const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const seedData = () => {
  const teacher = {
    _id: "u_teacher_demo",
    name: "Demo Teacher",
    email: "teacher@demo.com",
    password: "123456",
    role: "teacher",
    loggedIn: false
  };
  const studentSeeds = [
    { _id: "u_student_01", name: "Aarav Sharma", email: "aarav.sharma@demo.com" },
    { _id: "u_student_02", name: "Fatima Noor", email: "fatima.noor@demo.com" },
    { _id: "u_student_03", name: "Harpreet Singh", email: "harpreet.singh@demo.com" },
    { _id: "u_student_04", name: "Mariam D'Souza", email: "mariam.dsouza@demo.com" },
    { _id: "u_student_05", name: "Rehan Khan", email: "rehan.khan@demo.com" },
    { _id: "u_student_06", name: "Ritika Patel", email: "ritika.patel@demo.com" },
    { _id: "u_student_07", name: "Simran Kaur", email: "simran.kaur@demo.com" },
    { _id: "u_student_08", name: "Yusuf Ali", email: "yusuf.ali@demo.com" },
    { _id: "u_student_09", name: "Ananya Iyer", email: "ananya.iyer@demo.com" },
    { _id: "u_student_10", name: "Daniel Joseph", email: "daniel.joseph@demo.com" },
    { _id: "u_student_11", name: "Kabir Verma", email: "kabir.verma@demo.com" },
    { _id: "u_student_12", name: "Amina Rahman", email: "amina.rahman@demo.com" },
    { _id: "u_student_13", name: "Jasleen Kaur", email: "jasleen.kaur@demo.com" },
    { _id: "u_student_14", name: "Rohan Das", email: "rohan.das@demo.com" },
    { _id: "u_student_15", name: "Sara Thomas", email: "sara.thomas@demo.com" }
  ].map((student) => ({
    ...student,
    password: "123456",
    role: "student",
    loggedIn: true
  }));
  return {
    users: [teacher, ...studentSeeds],
    attendance: [],
    assignments: [],
    submissions: [],
    performance: [
      { _id: uid("perf"), studentId: "u_student_01", subject: "Math", marks: 78 },
      { _id: uid("perf"), studentId: "u_student_01", subject: "Physics", marks: 72 },
      { _id: uid("perf"), studentId: "u_student_01", subject: "English", marks: 85 }
    ],
    forum: [],
    planner: {},
    tests: [],
    antiCheatEvents: [],
    liveClasses: [],
    aiChats: {}
  };
};

const getDB = () => {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  const initial = seedData();
  localStorage.setItem(DB_KEY, JSON.stringify(initial));
  return initial;
};

const setDB = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));
const getCurrentUser = () => JSON.parse(localStorage.getItem("user") || "null");
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, loggedIn: u.loggedIn });
const delay = (data, ms = 240) => new Promise((resolve) => setTimeout(() => resolve({ data }), ms));
const fail = (message, status = 400) =>
  Promise.reject({
    response: { status, data: { message } }
  });

const localAIQuestions = [
  { q: "What is photosynthesis?", a: "Photosynthesis is how plants make food using sunlight, water, and carbon dioxide." },
  { q: "What is Newton's first law?", a: "An object stays at rest or in motion unless an external force acts on it." },
  { q: "What is the Pythagoras theorem?", a: "In a right triangle, a^2 + b^2 = c^2 where c is the hypotenuse." },
  { q: "Define democracy.", a: "Democracy is a system where people choose leaders through voting." },
  { q: "What is a noun?", a: "A noun is the name of a person, place, thing, or idea." },
  { q: "What is the formula of speed?", a: "Speed equals distance divided by time." },
  { q: "What is an ecosystem?", a: "An ecosystem is a community of living things interacting with their environment." },
  { q: "What is evaporation?", a: "Evaporation is when liquid changes into vapor due to heat." },
  { q: "What is the capital of Pakistan?", a: "The capital of Pakistan is Islamabad." },
  { q: "What is a fraction?", a: "A fraction represents part of a whole, written as numerator over denominator." },
  { q: "What is a verb?", a: "A verb is an action word or a state of being." },
  { q: "What is the water cycle?", a: "It is the continuous movement of water through evaporation, condensation, and precipitation." },
  { q: "What is force?", a: "Force is a push or pull that can change an object's motion." },
  { q: "What is a prime number?", a: "A prime number has exactly two factors: 1 and itself." },
  { q: "Why do we use punctuation?", a: "Punctuation makes writing clear and helps readers understand meaning." },
  { q: "What is the solar system?", a: "The solar system includes the Sun and all objects that orbit it." },
  { q: "What is gravity?", a: "Gravity is the force that pulls objects toward each other." },
  { q: "What is an adjective?", a: "An adjective describes a noun or pronoun." },
  { q: "What is a cell in biology?", a: "A cell is the basic structural and functional unit of life." },
  { q: "What is percentage?", a: "Percentage means a part per hundred." }
];

const matchAIAnswer = (msg) => {
  const text = msg.toLowerCase();
  const found = localAIQuestions.find((x) => text.includes(x.q.toLowerCase().replace("?", "")));
  if (found) return found.a;
  if (text.includes("hello") || text.includes("hi")) return "Hello! Ask me about math, science, grammar, or general basics.";
  return "I am a basic offline AI teacher. Please ask a short topic-based question from school basics.";
};

const api = {
  async get(path) {
    const db = getDB();
    const user = getCurrentUser();

    if (path === "/ai-chat") {
      const messages = user ? db.aiChats[user._id] || [] : [];
      return delay({ messages, presetQuestions: localAIQuestions });
    }
    if (path === "/attendance") {
      const rows = (user?.role === "student" ? db.attendance.filter((a) => a.studentId === user._id) : db.attendance).map((a) => ({
        ...a,
        studentId: publicUser(db.users.find((u) => u._id === a.studentId) || {})
      }));
      return delay(rows);
    }
    if (path.startsWith("/users")) {
      const role = path.includes("role=student") ? "student" : null;
      const loggedIn = path.includes("loggedIn=true");
      let users = [...db.users];
      if (role) users = users.filter((u) => u.role === role);
      if (loggedIn) users = users.filter((u) => u.loggedIn);
      return delay(users.map(publicUser));
    }
    if (path === "/assignments") {
      const list = db.assignments.map((a) => ({ ...a, teacherId: publicUser(db.users.find((u) => u._id === a.teacherId) || {}) }));
      return delay(list);
    }
    if (path === "/performance") {
      const list = (user?.role === "student" ? db.performance.filter((p) => p.studentId === user._id) : db.performance).map((p) => ({
        ...p,
        studentId: publicUser(db.users.find((u) => u._id === p.studentId) || {})
      }));
      return delay(list);
    }
    if (path === "/forum") {
      return delay(
        db.forum.map((p) => ({
          ...p,
          userId: publicUser(db.users.find((u) => u._id === p.userId) || {})
        }))
      );
    }
    if (path === "/planner") return delay(db.planner[user?._id] || null);
    if (path === "/tests") return delay(db.tests);
    if (path === "/live-classes") {
      return delay(db.liveClasses.map((c) => ({ ...c, teacherId: publicUser(db.users.find((u) => u._id === c.teacherId) || {}) })));
    }
    if (path === "/dashboard/student") {
      const perf = db.performance.filter((p) => p.studentId === user?._id);
      const att = db.attendance.filter((a) => a.studentId === user?._id);
      const present = att.filter((a) => a.status === "present").length;
      const attendancePercentage = att.length ? Math.round((present / att.length) * 100) : 0;
      const predictedScore = perf.length ? Math.round(perf.reduce((s, p) => s + Number(p.marks || 0), 0) / perf.length) : 0;
      return delay({
        attendancePercentage,
        predictedScore,
        weakSubjects: perf.filter((p) => p.marks < 60).map((p) => p.subject),
        performance: perf,
        totalAssignments: db.assignments.length,
        totalTests: db.tests.length,
        totalForumPosts: db.forum.length,
        scheduleItems: (db.planner[user?._id]?.schedule || []).length
      });
    }
    if (path === "/dashboard/teacher") {
      const studentIds = db.users.filter((u) => u.role === "student").map((u) => u._id);
      const classAverage = db.performance.length
        ? Math.round(db.performance.reduce((sum, p) => sum + Number(p.marks || 0), 0) / db.performance.length)
        : 0;
      return delay({
        studentsCount: studentIds.length,
        assignmentsCount: db.assignments.length,
        attendanceCount: db.attendance.length,
        classAverage
      });
    }

    return fail("Route not found", 404);
  },

  async post(path, payload = {}) {
    const db = getDB();
    const user = getCurrentUser();

    if (path === "/auth/register") {
      const email = String(payload.email || "").trim().toLowerCase();
      if (!email || !payload.password || !payload.name) return fail("Name, email and password are required");
      if (db.users.some((u) => u.email.toLowerCase() === email)) return fail("User already exists");
      const newUser = {
        _id: uid("u"),
        name: String(payload.name).trim(),
        email,
        password: String(payload.password),
        role: payload.role === "teacher" ? "teacher" : "student",
        loggedIn: false
      };
      db.users.push(newUser);
      setDB(db);
      return delay({ message: "Signup successful. Please login." });
    }
    if (path === "/auth/login") {
      const email = String(payload.email || "").trim().toLowerCase();
      const found = db.users.find((u) => u.email.toLowerCase() === email && u.password === payload.password);
      if (!found) return fail("Invalid email or password", 401);
      found.loggedIn = true;
      setDB(db);
      return delay({ token: `local-token-${found._id}`, user: publicUser(found) });
    }
    if (path === "/auth/logout") {
      if (user) {
        const found = db.users.find((u) => u._id === user._id);
        if (found) found.loggedIn = false;
        setDB(db);
      }
      return delay({ ok: true });
    }

    if (path === "/ai-chat") {
      if (!user) return fail("Login required", 401);
      const msg = String(payload.message || "").trim();
      if (!msg) return fail("Message is required");
      const history = db.aiChats[user._id] || [];
      history.push({ role: "user", content: msg });
      history.push({ role: "assistant", content: matchAIAnswer(msg) });
      db.aiChats[user._id] = history.slice(-40);
      setDB(db);
      return delay({ chat: { messages: db.aiChats[user._id] } });
    }

    if (path === "/attendance") {
      const row = {
        _id: uid("att"),
        studentId: user?.role === "student" ? user._id : payload.studentId,
        classId: payload.classId,
        status: payload.status || "present",
        date: payload.date || new Date().toISOString()
      };
      db.attendance.unshift(row);
      setDB(db);
      return delay(row);
    }

    if (path === "/assignments/generate") {
      const topic = String(payload.topic || "").trim() || "General Topic";
      return delay({
        questions: [
          `Define ${topic} in simple words.`,
          `List two practical uses of ${topic}.`,
          `Write one short difference related to ${topic}.`
        ]
      });
    }
    if (path === "/assignments") {
      const row = {
        _id: uid("asg"),
        teacherId: user?._id,
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate,
        questions: payload.questions || []
      };
      db.assignments.unshift(row);
      setDB(db);
      return delay(row);
    }
    if (path.includes("/submit") && path.startsWith("/assignments/")) {
      const assignmentId = path.split("/")[2];
      db.submissions.push({ _id: uid("sub"), assignmentId, studentId: user?._id, answers: payload.answers || [] });
      setDB(db);
      return delay({ ok: true });
    }

    if (path === "/performance") {
      const row = {
        _id: uid("perf"),
        studentId: user?.role === "student" ? user._id : payload.studentId,
        subject: payload.subject,
        marks: Number(payload.marks || 0),
        weakAreas: payload.weakAreas || []
      };
      db.performance.push(row);
      setDB(db);
      return delay(row);
    }

    if (path === "/forum") {
      const row = {
        _id: uid("post"),
        userId: user?._id,
        title: payload.title,
        content: payload.content,
        upvotes: [],
        answers: [],
        createdAt: new Date().toISOString()
      };
      db.forum.unshift(row);
      setDB(db);
      return delay(row);
    }
    if (path.includes("/answer") && path.startsWith("/forum/")) {
      const postId = path.split("/")[2];
      const post = db.forum.find((p) => p._id === postId);
      if (!post) return fail("Post not found", 404);
      post.answers.push({ _id: uid("ans"), content: payload.content, isBestAnswer: false });
      setDB(db);
      return delay({ ok: true });
    }
    if (path.includes("/upvote") && path.startsWith("/forum/")) {
      const postId = path.split("/")[2];
      const post = db.forum.find((p) => p._id === postId);
      if (!post) return fail("Post not found", 404);
      if (!post.upvotes.includes(user?._id)) post.upvotes.push(user?._id);
      setDB(db);
      return delay({ ok: true });
    }

    if (path === "/tests") {
      const row = { _id: uid("test"), title: payload.title, duration: Number(payload.duration || 10), questions: payload.questions || [] };
      db.tests.unshift(row);
      setDB(db);
      return delay(row);
    }
    if (path.endsWith("/submit") && path.startsWith("/tests/")) {
      const testId = path.split("/")[2];
      const test = db.tests.find((t) => t._id === testId);
      if (!test) return fail("Test not found", 404);
      let score = 0;
      (test.questions || []).forEach((q, idx) => {
        if ((payload.answers || [])[idx] === q.answer) score += 1;
      });
      const total = test.questions.length;
      return delay({ score, total, percentage: total ? Math.round((score / total) * 100) : 0 });
    }
    if (path.endsWith("/anti-cheat") && path.startsWith("/tests/")) {
      db.antiCheatEvents.push({ _id: uid("ac"), testId: path.split("/")[2], event: payload.event, userId: user?._id });
      setDB(db);
      return delay({ ok: true });
    }

    if (path === "/live-classes") {
      const row = {
        _id: uid("live"),
        teacherId: user?._id,
        title: payload.title,
        classLink: payload.classLink,
        recordingUrl: payload.recordingUrl || "",
        notes: payload.notes || [],
        createdAt: new Date().toISOString()
      };
      db.liveClasses.unshift(row);
      setDB(db);
      return delay(row);
    }

    return fail("Route not found", 404);
  },

  async put(path, payload = {}) {
    const db = getDB();
    const user = getCurrentUser();
    if (path === "/planner") {
      db.planner[user?._id] = { goals: payload.goals || [], schedule: payload.schedule || [] };
      setDB(db);
      return delay(db.planner[user?._id]);
    }
    return fail("Route not found", 404);
  },

  async patch(path, payload = {}) {
    const db = getDB();
    if (path.includes("/best-answer/") && path.startsWith("/forum/")) {
      const postId = path.split("/")[2];
      const answerId = path.split("/")[4];
      const post = db.forum.find((p) => p._id === postId);
      if (!post) return fail("Post not found", 404);
      post.answers = post.answers.map((a) => ({ ...a, isBestAnswer: a._id === answerId }));
      setDB(db);
      return delay(post);
    }
    if (path.startsWith("/live-classes/")) {
      const id = path.split("/")[2];
      const item = db.liveClasses.find((c) => c._id === id);
      if (!item) return fail("Class not found", 404);
      Object.assign(item, payload);
      setDB(db);
      return delay(item);
    }
    return fail("Route not found", 404);
  }
};

export default api;
