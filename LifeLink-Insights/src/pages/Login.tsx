import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartPulse, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-gold flex items-center justify-center">
              <HeartPulse className="h-7 w-7 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">LifeLink</h1>
              <p className="text-sm text-primary-foreground/70">Insights Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            Transform Health Data<br />
            Into Business Intelligence
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Analyze anonymized health trends, predict claims, optimize insurance products, 
            and make data-driven decisions for Sagicor's future.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-secondary">7,245</p>
              <p className="text-sm text-primary-foreground/70">Consented Patients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary">14</p>
              <p className="text-sm text-primary-foreground/70">Parishes Covered</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary">$2.4M</p>
              <p className="text-sm text-primary-foreground/70">Fraud Prevented</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-primary-foreground/60">
            © 2024 Sagicor Life Jamaica. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-gold flex items-center justify-center">
              <HeartPulse className="h-7 w-7 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">LifeLink</h1>
              <p className="text-sm text-muted-foreground">Insights Platform</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your analytics dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="you@sagicor.com"
                defaultValue="john.smith@sagicor.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue="password123"
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-sm">Remember me</span>
              </label>
              <a href="#" className="text-sm text-secondary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-12 bg-gradient-gold text-secondary-foreground hover:opacity-90">
              Sign In to Dashboard
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Need access?{" "}
            <a href="#" className="text-secondary hover:underline">
              Contact IT Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
