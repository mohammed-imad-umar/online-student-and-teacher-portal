import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Textarea from "../components/ui/Textarea";
import { useAuth } from "../context/AuthContext";

export default function AIChatPage() {
  const { user } = useAuth();
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [presetQuestions, setPresetQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/ai-chat")
      .then((res) => {
        setChat((res.data.messages || []).filter((m) => m.role !== "system"));
        setPresetQuestions(res.data.presetQuestions || []);
      })
      .catch((e) => setError(e?.response?.data?.message || "Failed to load chat"));
  }, []);

  const ask = async (forcedQuestion) => {
    const text = String(forcedQuestion || message).trim();
    if (!text) return;
    setError("");
    setLoading(true);
    const optimistic = { role: "user", content: text };
    setChat((prev) => [...prev, optimistic]);
    try {
      const { data } = await api.post("/ai-chat", { message: text });
      setChat((data.chat?.messages || []).filter((m) => m.role !== "system"));
      setMessage("");
    } catch (e) {
      setChat((prev) => prev.filter((m) => m !== optimistic));
      setError(e?.response?.data?.message || "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "student") {
    return <Alert variant="warning">AI Teacher is available only for student login.</Alert>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Teacher</h1>
        <p className="text-sm text-slate-600">
          Basic offline AI teacher with 20 built-in questions and instant answers.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 space-y-2 overflow-y-auto pr-1">
            {chat.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                No messages yet. Start by asking a question.
              </div>
            ) : (
              chat.map((m, i) => (
                <div
                  key={i}
                  className={[
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "ml-auto bg-indigo-600 text-white"
                      : "mr-auto border border-slate-200 bg-white text-slate-900"
                  ].join(" ")}
                >
                  {m.content}
                </div>
              ))
            )}
            {loading && (
              <div className="mr-auto max-w-[90%] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                Thinking…
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 md:flex-row">
            <Textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading) ask();
                }
              }}
              className="min-h-[44px] flex-1"
            />
            <Button onClick={ask} disabled={loading || !message.trim()} className="md:w-32">
              Ask
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Tip: Press Enter to send, Shift+Enter for new line.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>20 built-in basic questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {presetQuestions.map((item) => (
              <Button key={item.q} variant="outline" className="justify-start text-left" onClick={() => ask(item.q)}>
                {item.q}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
