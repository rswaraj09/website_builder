import React from "react";

export default function App() {
  return (
    <div className="w-screen h-screen bg-black">
      <iframe
        title="Website Preview"
        className="w-full h-full border-none"
        srcDoc={`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AI Site Builder</title>

<style>
  body {
    margin: 0;
    background: #0f172a;
    color: #e5e7eb;
    font-family: system-ui, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  .container {
    padding: 40px;
    max-width: 1200px;
    margin: auto;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    opacity: 0.85;
  }

  .btn {
    padding: 12px 20px;
    border-radius: 8px;
    background: linear-gradient(to right, #6366f1, #4f46e5);
    color: white;
    border: none;
    cursor: pointer;
    margin-right: 10px;
  }

  .card {
    background: #1e293b;
    padding: 20px;
    border-radius: 12px;
    margin-top: 20px;
  }
</style>
</head>

<body>

<div class="container">
  <h1>Portfolio Website</h1>
  <p>
    Welcome! This is your generated portfolio website running inside a React iframe.
  </p>

  <div class="card">
    <h2>About Me</h2>
    <p>
      I'm a developer focused on clean UI, performance, and modern design systems.
    </p>
  </div>

  <div class="card">
    <h2>Projects</h2>
    <ul>
      <li>Modern Landing Page</li>
      <li>Dashboard UI</li>
      <li>Fullstack App</li>
    </ul>
  </div>

  <div class="card">
    <h2>Contact</h2>
    <p>Email: you@example.com</p>
  </div>

  <button class="btn">Contact Me</button>
</div>

</body>
</html>
        `}
      />
    </div>
  );
}
