import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FreelancerDashboard from "@/components/dashboard/FreelancerDashboard";
import CompanyDashboard from "@/components/dashboard/CompanyDashboard";
import AdminManagement from "@/components/admin/AdminManagement";
import { Users, Building2, BarChart3, Settings } from "lucide-react";

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState<"freelancer" | "company" | "stats" | "manage">("stats");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panneau d'administration</h1>
        <p className="text-muted-foreground">
          Accédez à toutes les fonctionnalités de la plateforme
        </p>
      </div>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gestion
          </TabsTrigger>
          <TabsTrigger value="freelancer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vue Freelance
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Vue Entreprise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Freelances</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">500+</div>
                <p className="text-xs text-muted-foreground">+20% depuis le mois dernier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entreprises</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">200+</div>
                <p className="text-xs text-muted-foreground">+15% depuis le mois dernier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missions Actives</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">En cours sur la plateforme</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Capacités Admin</CardTitle>
              <CardDescription>
                En tant qu'administrateur, vous avez accès à toutes les fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Vue Freelance</h4>
                  <p className="text-sm text-muted-foreground">
                    Voir et postuler aux missions comme un freelance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Vue Entreprise</h4>
                  <p className="text-sm text-muted-foreground">
                    Créer et gérer des missions comme une entreprise
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Gestion complète</h4>
                  <p className="text-sm text-muted-foreground">
                    Modifier, supprimer et gérer tous les contenus de la plateforme
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="freelancer">
          <Card>
            <CardHeader>
              <CardTitle>Vue Freelance</CardTitle>
              <CardDescription>
                Accédez à toutes les missions disponibles et postulez en tant qu'admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FreelancerDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Vue Entreprise</CardTitle>
              <CardDescription>
                Créez et gérez des missions comme une entreprise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Gestion complète</CardTitle>
              <CardDescription>
                Modifier, supprimer et gérer tous les contenus de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
