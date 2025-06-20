import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Admin {
  id: number;
  username: string;
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (admin: Admin) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
      }
    } catch (error) {
      // User is not authenticated
    } finally {
      setIsLoading(false);
    }
  };

  const login = (adminData: Admin) => {
    setAdmin(adminData);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      // Logout failed, but we'll clear the local state anyway
    }
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}