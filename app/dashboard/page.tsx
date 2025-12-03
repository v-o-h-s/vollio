"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  // Check user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/v1/logout", { method: "POST" }); // server route clears cookies
    setUser(null); // update client UI
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {user ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <h1>some problem appears</h1>
      )}
    </div>
  );
}
