import { Link, useLocation } from "react-router-dom";
import { Music, Home, Mail, AlertCircle, MessageSquare, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-smooth">
            <Music className="w-6 h-6" />
            <span>Apify Playlist AI</span>
          </Link>

          <div className="flex items-center gap-1">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>

            <Button
              variant={isActive("/generator") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/generator">
                <Music className="w-4 h-4 mr-2" />
                Generator
              </Link>
            </Button>

            <Button
              variant={isActive("/contact") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Link>
            </Button>

            <Button
              variant={isActive("/report-issue") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/report-issue">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Issue
              </Link>
            </Button>

            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button
                variant={isActive("/auth") ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};