// "use client";

// import { useState } from "react";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// // import { useNavigate } from "react-router-dom";

// export default function Register() {
//   // const navigate = useNavigate();
//   const [data, setData] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const registerUser = async (e: { preventDefault: () => void }) => {
//     e.preventDefault();
//     const { name, email, password } = data;
//     try {
//       const { data } = await axios.post("/register", {
//         name,
//         email,
//         password,
//       });
//       if (data.error) {
//         toast.error(data.error);
//       } else {
//         setData({ email, name, password });
//         toast.success("Register SuccessFul Wellcome!");
//         // navigate("/login");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <>
//       <div>
//         <h1>Register Page</h1>
//         <form onSubmit={registerUser}>
//           <label>name</label>
//           <input
//             type="text"
//             placeholder="Enter Name..."
//             value={data.name}
//             onChange={(e) => setData({ ...data, name: e.target.value })}
//           />
//           <br />

//           <label>Email</label>
//           <input
//             type="email"
//             placeholder="Enter Email..."
//             value={data.email}
//             onChange={(e) => setData({ ...data, email: e.target.value })}
//           />
//           <br />

//           <label>Password</label>
//           <input
//             type="password"
//             placeholder="Enter Password..."
//             value={data.password}
//             onChange={(e) => setData({ ...data, password: e.target.value })}
//           />
//           <br />

//           <button type="submit">Submit</button>
//         </form>
//       </div>
//     </>
//   );
// }

"use client";

import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { Content_Type: "application/json" },
      body: JSON.stringify({ email, password }),
    });
  };
  return (
    <>
      <div>
        <h1>Register Page</h1>

        <form onSubmit={registerUser}>
          <label>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter Email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />

          <label>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter Password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}
