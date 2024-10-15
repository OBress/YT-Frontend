"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, AlertCircle, Sun, Moon } from "lucide-react";

interface LoginPageProps {
  setIsLoggedIn: (value: boolean) => void;
}

export default function LoginPage({ setIsLoggedIn }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const users = [
      {
        name: import.meta.env.VITE_USER_1,
        password: import.meta.env.VITE_USER_1_PASSWORD,
        id: import.meta.env.VITE_USER_1_ID,
      },
      {
        name: import.meta.env.VITE_USER_2,
        password: import.meta.env.VITE_USER_2_PASSWORD,
        id: import.meta.env.VITE_USER_2_ID,
      },
      {
        name: import.meta.env.VITE_USER_3,
        password: import.meta.env.VITE_USER_3_PASSWORD,
        id: import.meta.env.VITE_USER_3_ID,
      },
    ];

    const user = users.find(
      (u) => u.name === username && u.password === password
    );

    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", user.id);
      setIsLoggedIn(true);
      navigate("/channel-navigator");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Button
        onClick={toggleDarkMode}
        variant="outline"
        size="icon"
        className="absolute top-4 right-4"
      >
        {isDarkMode ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Button>
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Enter your email & password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full mt-4">
              <Lock className="mr-2 h-4 w-4" /> Login
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-muted-foreground">
            Don&apos;t have an account?
            <br />
            You probably shouldn&apos;t be here.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
