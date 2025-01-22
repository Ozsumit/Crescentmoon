import AuthTabs from "@/components/AuthTabs"

export default function LoginPage() {
  return (
    (<div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-2xl font-bold text-center text-gray-900">Welcome to Crescent Moon</h1>
        <AuthTabs />
      </div>
    </div>)
  );
}

