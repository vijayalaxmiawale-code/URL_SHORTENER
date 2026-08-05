import { useAuth } from "../context/AuthContext";
import { User } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700">Profile</h1>
        <p className="mt-1 text-sm text-ink/50">Your account details.</p>
      </div>

      <div className="max-w-md rounded-2xl border border-ink/10 bg-white p-6">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand-dark">
            <User size={24} />
          </div>
          <div>
            <p className="font-display text-lg font-700">{user?.name}</p>
            <p className="text-sm text-ink/50">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/50">Name</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/50">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
