import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const load = () => api.get("/forum").then((res) => setPosts(res.data));
  useEffect(() => { load(); }, []);

  const post = async () => {
    setError("");
    if (!title.trim() || !content.trim()) return setError("Title and content are required");
    await api.post("/forum", { title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    load();
  };
  const answer = async (id) => {
    const value = answers[id]?.trim();
    if (!value) return;
    await api.post(`/forum/${id}/answer`, { content: value });
    setAnswers((prev) => ({ ...prev, [id]: "" }));
    load();
  };
  const upvote = async (id) => { await api.post(`/forum/${id}/upvote`); load(); };
  const markBest = async (postId, answerId) => {
    await api.patch(`/forum/${postId}/best-answer/${answerId}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discussion Forum</h1>
        <p className="text-sm text-slate-600">Ask doubts, reply, upvote. Teachers can mark a best answer.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>New Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Write your doubt…" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex justify-end">
            <Button onClick={post}>Post</Button>
          </div>
        </CardContent>
      </Card>

      {posts.map((p) => (
        <Card key={p._id}>
          <CardHeader>
            <CardTitle>{p.title}</CardTitle>
            <div className="mt-1 text-xs text-slate-500">
              Posted by {p.userId?.name || "User"} • {new Date(p.createdAt).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-800">{p.content}</p>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => upvote(p._id)}>
                Upvote ({p.upvotes.length})
              </Button>
            </div>

            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                className="flex-1"
                placeholder="Write your answer"
                value={answers[p._id] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [p._id]: e.target.value }))}
              />
              <Button variant="secondary" onClick={() => answer(p._id)} disabled={!answers[p._id]?.trim()}>
                Reply
              </Button>
            </div>

            {p.answers?.length > 0 && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-600">Answers</div>
                {p.answers.map((ans) => (
                  <div
                    key={ans._id}
                    className={[
                      "rounded-xl border p-3 text-sm",
                      ans.isBestAnswer ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-slate-800">{ans.content}</div>
                      {ans.isBestAnswer && (
                        <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white">
                          Best
                        </span>
                      )}
                    </div>
                    {(user?.role === "teacher" || user?.role === "admin") && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant={ans.isBestAnswer ? "outline" : "primary"}
                          onClick={() => markBest(p._id, ans._id)}
                        >
                          {ans.isBestAnswer ? "Marked" : "Mark best answer"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
