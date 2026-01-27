import React, { useState } from "react";
import { tryLogin } from "../auth/auth.v2";

// interface LoginPageProps {
//   onSwitchToSignup: () => void;
// }

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (username.trim() && username !== "" && password !== "") {
      console.log("before loading");

      setLoading(true);
      console.log("after loading");

      const res = await tryLogin({ username, password });
      console.log("res", res);

      if (res) {
        window.location.href = "/";
      } else {
        setLoading(false);
        // Notification("Failed", "Invalid Credentials", "danger");
        setUsername("");
        setPassword("");
        setLoading(false);
      }
    } else {
      // Notification("Failed", "Invalid Credentials", "danger");
      setUsername("");
      setPassword("");
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && username !== "" && password !== "") {
      event.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-xl border border-slate-700 p-12 rounded-xl shadow-xl shadow-sky-500/5">
        <div className="space-y-1 flex flex-col items-center">
          <div className="text-5xl font-bold mb-4 bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">BM Search</div>
          <div className="text-center">
            Enter your credentials to access your account
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="space-y-4 pt-10">
            <div className="space-y-2 flex flex-col">
              <label>Email</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="email"
                placeholder="example@email.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[0.5px] focus-visible:ring-ring/5 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-slate-600 focus-visible:ring-slate-700"
                required
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <label>Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[0.5px] focus-visible:ring-ring/5 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-slate-600 focus-visible:ring-slate-700"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-10">
            <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-indigo-400 hover:bg-sky-800 text-white font-semibold py-2 rounded-md cursor-pointer">
              {loading ? "Loading..." : "Sign in"}
            </button>
            {/* <div className="w-full h-fit flex items-center justify-center">
              <h1 className="text-[14px] text-black font-normal flex items-center justify-center gap-1">Don't have an account yet?<span className="text-blue-700 text-[14px] font-semibold hover:underline cursor-pointer ml-1" onClick={() => onSwitchToSignup()}>Sign Up</span></h1>
            </div> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
