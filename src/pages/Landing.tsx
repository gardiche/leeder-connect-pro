import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, Users, CheckCircle, TrendingUp, Shield, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <img src="/logo.png" alt="LEEDER" className="h-28" />
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Connectez entreprises et <span className="text-primary">talents du merchandising</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La plateforme qui simplifie la mise en relation entre entreprises et freelances qualifiés en Auvergne-Rhône-Alpes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth?role=company">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg h-14 px-8">
                <Building2 className="mr-2 h-5 w-5" />
                Je suis une entreprise
              </Button>
            </Link>
            <Link to="/auth?role=freelancer">
              <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2">
                <Users className="mr-2 h-5 w-5" />
                Je suis freelance
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Une plateforme complète pour tous vos besoins
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Matching intelligent</h3>
              <p className="text-muted-foreground">
                Trouvez les meilleurs profils selon vos critères de compétences, localisation et disponibilité
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Paiements sécurisés</h3>
              <p className="text-muted-foreground">
                Transactions sécurisées et traçables avec délais de paiement garantis
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Process simplifié</h3>
              <p className="text-muted-foreground">
                De la mission au paiement, tout est géré sur une seule plateforme
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <p className="text-lg opacity-90">Freelances qualifiés</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">200+</div>
              <p className="text-lg opacity-90">Entreprises partenaires</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <p className="text-lg opacity-90">Taux de satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <TrendingUp className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-4xl font-bold">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-muted-foreground">
              Rejoignez LEEDER aujourd'hui et découvrez une nouvelle façon de travailler
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg h-14 px-8">
                Créer mon compte gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 LEEDER. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
