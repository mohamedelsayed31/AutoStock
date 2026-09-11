import {
    createContext,
    useContext,
    useState,
  } from "react";
  
  import type {
    ReactNode,
  } from "react";
  
  import type {
    LoginResponse,
  } from "../types/auth";
  
  
  interface AuthContextType {
    userId: string | null;
    fullName: string | null;
    email: string | null;
    role: string | null;
    token: string | null;
  
    isAuthenticated: boolean;
    isAdmin: boolean;
  
    signIn: (
      data: LoginResponse
    ) => void;
  
    signOut: () => void;
  }
  
  
  const AuthContext =
    createContext<AuthContextType | undefined>(
      undefined
    );
  
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  
  export function AuthProvider({
    children,
  }: AuthProviderProps) {
  
    const [userId, setUserId] =
      useState<string | null>(
        () =>
          localStorage.getItem(
            "userId"
          )
      );
  
    const [fullName, setFullName] =
      useState<string | null>(
        () =>
          localStorage.getItem(
            "fullName"
          )
      );
  
    const [email, setEmail] =
      useState<string | null>(
        () =>
          localStorage.getItem(
            "email"
          )
      );
  
    const [role, setRole] =
      useState<string | null>(
        () =>
          localStorage.getItem(
            "role"
          )
      );
  
    const [token, setToken] =
      useState<string | null>(
        () =>
          localStorage.getItem(
            "token"
          )
      );
  
  
    const signIn = (
      data: LoginResponse
    ) => {
  
      localStorage.setItem(
        "userId",
        data.userId
      );
  
      localStorage.setItem(
        "fullName",
        data.fullName
      );
  
      localStorage.setItem(
        "email",
        data.email
      );
  
      localStorage.setItem(
        "role",
        data.role
      );
  
      localStorage.setItem(
        "token",
        data.token
      );
  
  
      setUserId(data.userId);
      setFullName(data.fullName);
      setEmail(data.email);
      setRole(data.role);
      setToken(data.token);
    };
  
  
    const signOut = () => {
  
      localStorage.removeItem(
        "userId"
      );
  
      localStorage.removeItem(
        "fullName"
      );
  
      localStorage.removeItem(
        "email"
      );
  
      localStorage.removeItem(
        "role"
      );
  
      localStorage.removeItem(
        "token"
      );
  
  
      setUserId(null);
      setFullName(null);
      setEmail(null);
      setRole(null);
      setToken(null);
    };
  
  
    const isAuthenticated =
      Boolean(token);
  
    const isAdmin =
      role === "Admin";
  
  
    return (
      <AuthContext.Provider
        value={{
          userId,
          fullName,
          email,
          role,
          token,
          isAuthenticated,
          isAdmin,
          signIn,
          signOut,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  
  export function useAuth() {
    const context =
      useContext(AuthContext);
  
  
    if (!context) {
      throw new Error(
        "useAuth must be used inside AuthProvider."
      );
    }
  
  
    return context;
  }