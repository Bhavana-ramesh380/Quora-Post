const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { v4 : uuidv4 } = require("uuid");
const methodOverride = require("method-override");

app.use(express.urlencoded({ extended : true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

let posts = [
    {
        id : uuidv4(),
        username : "Bhavana",
        content : " Got selected for first job",  
        likes: 0,
        tags: ["Career"],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      },
      {
        id : uuidv4(),
        username : "Shradha",
        content : " teacher of dsa and development",  
        likes: 0,
        tags: ["Education", "DSA"],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
      },
      {
        id : uuidv4(),
        username : "Rahul",
        content : " I love Reading and developing",  
        likes: 0,
        tags: ["Hobby"],
        createdAt: Date.now() - 1000 * 60 * 60 * 8,
      },
      { 
        id : uuidv4(),
        username : "Neha",
        content : "  got selected for Internship",  
        likes: 0,
        tags: ["Career", "Internship"],
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
      },
];

app.get("/posts", (req , res) => {
    const q = (req.query.q || "").toString().trim();
    const tag = (req.query.tag || "").toString().trim();
    const sort = (req.query.sort || "latest").toString().trim();
    const lower = q.toLowerCase();
    let list = posts.slice();
    if (q) {
      list = list.filter((p) =>
        (p.username && p.username.toLowerCase().includes(lower)) ||
        (p.content && p.content.toLowerCase().includes(lower))
      );
    }
    if (tag) {
      const tagLower = tag.toLowerCase();
      list = list.filter((p) => Array.isArray(p.tags) && p.tags.some((t) => (t||"").toLowerCase() === tagLower));
    }
    if (sort === "likes") {
      list.sort((a,b) => (b.likes||0) - (a.likes||0));
    } else if (sort === "trending") {
      list.sort((a,b) => ((b.likes||0) - (a.likes||0)) || ((b.createdAt||0) - (a.createdAt||0)));
    } else {
      list.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
    }
    res.render("index.ejs" , { posts: list, q, tag, sort });
});

app.get("/posts/new", (req , res) => {
  res.render("new.ejs");
});

app.post("/posts", (req , res ) => {
  let { username, content } = req.body;
  let rawTags = (req.body.tags || "").toString();
  let tags = rawTags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  let id = uuidv4();
  posts.push({ id , username, content, likes: 0, tags, createdAt: Date.now() });
  res.redirect("/posts?success=created");
});
app.get("/posts/:id", (req, res)=> {
  let { id } = req.params;
  console.log(id );
  let post = posts.find((p) => id ===p.id);
  res.render("show.ejs", {post});
});

app.patch("/posts/:id", (req, res)=> {
  let { id } = req.params;
  let newContent = req.body.content;
  let post = posts.find((p) => id ===p.id);
  post.content = newContent;
  console.log(post);
  res.redirect("/posts?success=updated");
});

app.get("/posts/:id/edit", (req, res)=> {
  let { id } = req.params;
  let post = posts.find((p) => id === p.id);
  res.render("edit.ejs", { post });
});

app.delete("/posts/:id", (req, res) => {
  let { id } = req.params;
   posts = posts.filter((p) => id !== p.id);
   res.redirect("/posts?success=deleted");
});

// Like endpoint
app.post("/posts/:id/like", (req, res) => {
  const { id } = req.params;
  const post = posts.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  post.likes = (post.likes || 0) + 1;
  return res.json({ likes: post.likes });
});

app.listen(port, () => {
    console.log("listining to port : 8080");
});