"use client"; // top to the file

import React, { useState } from "react";
export default function Hotel() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (username === "" || password === "") {
      setError("Please fill in all fields.");
    } else {
      setError("");
      alert(`Logged in as: ${username}`);
      // Here you can add logic for actual authentication
    }
  };
  return (
    <>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </>
  );
}
