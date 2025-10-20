import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Users, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"freelancer" | "company">("freelancer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "company" || roleParam === "freelancer") {
      setRole(roleParam);
      setIsLogin(false);
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [searchParams, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Connexion réussie !");
        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email,
              name,
              role,
            });

          if (profileError) throw profileError;

          if (role === "freelancer") {
            await supabase.from("freelancer_profiles").insert({ id: data.user.id });
          } else {
            await supabase.from("company_profiles").insert({
              id: data.user.id,
              company_name: name,
              contact_name: name,
            });
          }

          toast.success("Compte créé avec succès !");
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
            <h1 className="text-3xl font-bold">
              {isLogin ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? "Connectez-vous à votre espace LEEDER" 
                : `Rejoignez LEEDER en tant que ${role === "freelancer" ? "freelance" : "entreprise"}`
              }
            </p>
          </div>

          {!isLogin && (
            <div className="flex gap-4">
              <Button
                type="button"
                variant={role === "freelancer" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRole("freelancer")}
              >
                <Users className="mr-2 h-4 w-4" />
                Freelance
              </Button>
              <Button
                type="button"
                variant={role === "company" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRole("company")}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Entreprise
              </Button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">
                  {role === "company" ? "Nom de l'entreprise" : "Nom complet"}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block flex-1 bg-primary relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-primary-foreground space-y-6">
            <h2 className="text-4xl font-bold">
              La plateforme qui facilite le merchandising
            </h2>
            <p className="text-lg opacity-90">
              Rejoignez des centaines de professionnels qui font confiance à LEEDER pour leurs missions de merchandising
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
