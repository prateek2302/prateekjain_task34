import { useCallback, useEffect, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/$/, "");

async function request(path, options) {
  if (!API_URL) {
    throw new Error(
      "The API is not configured yet. Deploy the backend, then set the VITE_API_URL repository variable."
    );
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "The request could not be completed.");
  }

  return response.json();
}

function App() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userForm, setUserForm] = useState({ name: "", email: "" });
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    userId: "",
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [loadedUsers, loadedPosts] = await Promise.all([
        request("/users"),
        request("/posts"),
      ]);
      setUsers(loadedUsers);
      setPosts(loadedPosts);
      setPostForm((current) => ({
        ...current,
        userId: current.userId || loadedUsers[0]?._id || "",
      }));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleUserSubmit(event) {
    event.preventDefault();
    setSavingUser(true);
    setError("");
    setNotice("");
    try {
      const createdUser = await request("/users", {
        method: "POST",
        body: JSON.stringify(userForm),
      });
      setUsers((current) =>
        [...current, createdUser].sort((a, b) => a.name.localeCompare(b.name))
      );
      setPostForm((current) => ({
        ...current,
        userId: current.userId || createdUser._id,
      }));
      setUserForm({ name: "", email: "" });
      setNotice("User added. You can now link a post to this user.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingUser(false);
    }
  }

  async function handlePostSubmit(event) {
    event.preventDefault();
    setSavingPost(true);
    setError("");
    setNotice("");
    try {
      const createdPost = await request("/posts", {
        method: "POST",
        body: JSON.stringify(postForm),
      });
      setPosts((current) => [createdPost, ...current]);
      setPostForm((current) => ({ ...current, title: "", content: "" }));
      setNotice("Post published and linked to its author.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingPost(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Schema Reference home">
          <span className="brand-mark">S</span>
          <span>schema<span className="brand-light">reference</span></span>
        </a>
        <span className="topbar-note"><span className="status-dot" /> Express + MongoDB</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> A FULL-STACK MONGOOSE DEMO</span>
          <h1>Good stories start<br />with <span>good connections.</span></h1>
          <p>Create people, write posts, and see how a Mongoose reference brings them together.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-center"><span>ref</span><i /></div>
          <div className="orbit-node node-user"><span className="node-icon">U</span><span>User</span></div>
          <div className="orbit-node node-post"><span className="node-icon">P</span><span>Post</span></div>
          <span className="orbit-caption">ObjectId → populate()</span>
        </div>
      </section>

      {(error || notice) && (
        <div className={`feedback ${error ? "feedback-error" : "feedback-success"}`} role="status">
          <span>{error ? "!" : "✓"}</span>
          {error || notice}
          {error && <button type="button" onClick={loadData}>Retry</button>}
        </div>
      )}

      <section className="workspace">
        <div className="forms-column">
          <article className="panel form-panel">
            <div className="panel-heading">
              <div className="heading-icon user-icon">01</div>
              <div><span className="section-kicker">FIRST, THE AUTHOR</span><h2>Add a person</h2></div>
            </div>
            <form onSubmit={handleUserSubmit}>
              <label htmlFor="user-name">Full name</label>
              <input
                id="user-name"
                required
                maxLength={100}
                placeholder="e.g. Alex Morgan"
                value={userForm.name}
                onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              />
              <label htmlFor="user-email">Email address</label>
              <input
                id="user-email"
                type="email"
                required
                maxLength={254}
                placeholder="alex@example.com"
                value={userForm.email}
                onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              />
              <button className="button button-secondary" type="submit" disabled={savingUser}>
                {savingUser ? "Adding person…" : "Add person"} <span aria-hidden="true">↗</span>
              </button>
            </form>
          </article>

          <article className="panel form-panel">
            <div className="panel-heading">
              <div className="heading-icon post-icon">02</div>
              <div><span className="section-kicker">THEN, THE STORY</span><h2>Write a post</h2></div>
            </div>
            <form onSubmit={handlePostSubmit}>
              <label htmlFor="post-author">Written by</label>
              <select
                id="post-author"
                required
                value={postForm.userId}
                onChange={(event) => setPostForm({ ...postForm, userId: event.target.value })}
                disabled={!users.length}
              >
                {!users.length && <option value="">Add a person first</option>}
                {users.map((user) => (
                  <option key={user._id} value={user._id}>{user.name} · {user.email}</option>
                ))}
              </select>
              <label htmlFor="post-title">Post title</label>
              <input
                id="post-title"
                required
                maxLength={160}
                placeholder="Give your post a title"
                value={postForm.title}
                onChange={(event) => setPostForm({ ...postForm, title: event.target.value })}
              />
              <label htmlFor="post-content">Your story</label>
              <textarea
                id="post-content"
                required
                maxLength={5000}
                rows={4}
                placeholder="What would you like to share?"
                value={postForm.content}
                onChange={(event) => setPostForm({ ...postForm, content: event.target.value })}
              />
              <button className="button button-primary" type="submit" disabled={savingPost || !users.length}>
                {savingPost ? "Publishing…" : "Publish post"} <span aria-hidden="true">↗</span>
              </button>
            </form>
          </article>
        </div>

        <section className="panel feed-panel" aria-labelledby="feed-title">
          <div className="feed-heading">
            <div>
              <span className="section-kicker">THE CONNECTION IN ACTION</span>
              <h2 id="feed-title">Latest posts <span className="count">{posts.length}</span></h2>
            </div>
            <button className="refresh-button" type="button" onClick={loadData} aria-label="Refresh posts" title="Refresh posts">↻</button>
          </div>
          {loading ? (
            <div className="empty-state"><span className="loader" />Loading your posts…</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-illustration">✳</span>
              <strong>No posts just yet</strong>
              <span>Add a person, then write the first story.</span>
            </div>
          ) : (
            <div className="post-list">
              {posts.map((post) => (
                <article className="post-card" key={post._id}>
                  <div className="post-meta">
                    <span className="author-avatar">
                      {post.user?.name?.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <div className="author-details">
                      <strong>{post.user?.name || "Unknown author"}</strong>
                      <span>{post.user?.email || "User record unavailable"}</span>
                    </div>
                    <time>{new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</time>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <div className="reference-tag"><span /> Populated from User</div>
                </article>
              ))}
            </div>
          )}
          <div className="feed-footnote"><span className="footnote-line" /> Posts are fetched with <code>.populate(&quot;user&quot;)</code></div>
        </section>
      </section>
      <footer><span>Schema Reference</span><span>One reference. A richer story.</span></footer>
    </main>
  );
}

export default App;
