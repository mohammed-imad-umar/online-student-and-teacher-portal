import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function TestsPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [result, setResult] = useState(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(10);
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [answer, setAnswer] = useState("");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [status, setStatus] = useState("");

  const load = () => api.get("/tests").then((res) => setTests(res.data));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!active || user.role !== "student") return;
    if (timer > 0) return;
    // auto-submit once at 0
    if (!result) submit();
  }, [timer, active, user.role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onBlur = async () => {
      if (active) await api.post(`/tests/${active._id}/anti-cheat`, { event: "tab_switch_detected" });
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [active]);

  const start = (test) => { setActive(test); setTimer(test.duration * 60); setAnswers(Array(test.questions.length).fill("")); setResult(null); };
  const submit = async () => {
    if (!active) return;
    setStatus("");
    try {
      setResult((await api.post(`/tests/${active._id}/submit`, { answers })).data);
    } catch (e) {
      setStatus(e?.response?.data?.message || "Submit failed");
    }
  };

  const addDraftQuestion = () => {
    setStatus("");
    const q = question.trim();
    const o1 = option1.trim();
    const o2 = option2.trim();
    const a = answer.trim();
    if (!q || !o1 || !o2 || !a) return setStatus("Please fill question, options, and correct answer");
    setDraftQuestions((prev) => [...prev, { question: q, options: [o1, o2], answer: a }]);
    setQuestion("");
    setOption1("");
    setOption2("");
    setAnswer("");
  };

  const create = async () => {
    setStatus("");
    const t = title.trim();
    if (!t) return setStatus("Test title is required");
    if (draftQuestions.length === 0) return setStatus("Add at least 1 question");
    await api.post("/tests", { title: t, duration, questions: draftQuestions });
    setTitle("");
    setDuration(10);
    setDraftQuestions([]);
    load();
  };
  const timeLabel = useMemo(() => `${Math.floor(timer / 60)}:${String(Math.max(0, timer % 60)).padStart(2, "0")}`, [timer]);

  if (active && user.role === "student") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{active.title}</h1>
            <p className="text-sm text-slate-600">Timer: {timeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setActive(null); setResult(null); }}>
              Exit
            </Button>
            <Button variant="secondary" onClick={submit} disabled={!!result}>
              Submit
            </Button>
          </div>
        </div>

        {status && <Alert variant="danger">{status}</Alert>}

        <div className="space-y-3">
          {active.questions.map((q, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Q{i + 1}. {q.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={answers[i] === opt}
                      onChange={() =>
                        setAnswers((a) => {
                          const n = [...a];
                          n[i] = opt;
                          return n;
                        })
                      }
                    />
                    {opt}
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {result && (
          <Alert variant="success">
            Score: {result.score}/{result.total} ({result.percentage}%)
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tests</h1>
        <p className="text-sm text-slate-600">Students can attempt; teachers can create multi-question tests.</p>
      </div>

      {status && <Alert variant="warning">{status}</Alert>}

      {user.role !== "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Create Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input placeholder="Test title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input
                type="number"
                placeholder="Duration (min)"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input className="md:col-span-2" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
              <Input placeholder="Option 1" value={option1} onChange={(e) => setOption1(e.target.value)} />
              <Input placeholder="Option 2" value={option2} onChange={(e) => setOption2(e.target.value)} />
              <Input className="md:col-span-2" placeholder="Correct answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <div className="flex gap-2 md:col-span-2">
                <Button variant="secondary" onClick={addDraftQuestion} className="flex-1">
                  Add question ({draftQuestions.length})
                </Button>
                <Button onClick={create} className="flex-1" disabled={draftQuestions.length === 0 || !title.trim()}>
                  Create test
                </Button>
              </div>
            </div>

            {draftQuestions.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="mb-2 font-medium text-slate-700">Draft questions</div>
                <ol className="list-decimal space-y-1 pl-5 text-slate-800">
                  {draftQuestions.map((q, i) => (
                    <li key={i}>{q.question}</li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {tests.map((t) => (
        <Card key={t._id}>
          <CardContent className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <div className="text-sm font-medium text-slate-900">
              {t.title} <span className="font-normal text-slate-500">({t.duration} min)</span>
            </div>
          {user.role === "student" && (
              <Button size="sm" onClick={() => start(t)}>
                Start
              </Button>
          )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
