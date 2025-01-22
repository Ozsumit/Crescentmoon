import AuthTabs from "@/components/AuthTabs";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      {/* <div className="w-full max-w-md p-8 space-y-8 bg-slate-700 shadow-lg rounded-xl"> */}
      <h1 className="text-2xl font-bold text-center text-gray-100">
        Welcome to Crescent Moon
      </h1>
      <LoginForm />
      {/* </div> */}
    </div>
  );
}
