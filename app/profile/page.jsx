"use client"; // top to the file
import { useContext } from "react";
import { UserContext } from "../providers";

export default function Profile() {
  const { user } = useContext(UserContext);

  return (
    <>
      <div>Profile Page</div>
      <div>{!!user && <h2>Hi {user.name}!</h2>}</div>
    </>
  );
}
