"use client"; // top to the file

import axios from "axios";
import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Login() {
  // const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const loginUser = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const { email, password } = data;
    try {
      const { data } = await axios.post("/login", {
        email,
        password,
      });
      if (data.error) {
        toast.error(data.error);
      } else {
        setData({ email, password });
        toast.success("Login SuccessFul Wellcome!");
        // navigate("/profile");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div>
        <h1>Login Page</h1>
        <form onSubmit={loginUser}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter Email... "
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter Password... "
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          <button type="submit">Login</button>
        </form>
      </div>
      <br />
    </>
  );
}
