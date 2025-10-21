import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, Euro } from "lucide-react";
import { toast } from "sonner";
import ApplyMissionDialog from "./ApplyMissionDialog";

interface Mission {
  id: string;
  title: string;
  description: string;
  location: string;
  hourly_rate: number;
  duration: string;
  skills_required: string[];
  created_at: string;
  company_id: string;
}

const FreelancerDashboard = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des missions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mission: Mission) => {
    setSelectedMission(mission);
    setDialogOpen(true);
  };

  const handleApply = async (data: {
    message: string;
    availability: string;
    availability_date?: Date;
    proposed_rate?: number;
  }) => {
    if (!selectedMission) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("applications")
        .insert({
          mission_id: selectedMission.id,
          freelancer_id: user.id,
          message: data.message || `Disponibilité : ${data.availability}\nTarif souhaité : ${data.proposed_rate}€/h`,
        });

      if (error) throw error;
      toast.success("Candidature envoyée avec succès !");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Vous avez déjà postulé à cette mission");
      } else {
        toast.error("Erreur lors de la candidature");
      }
      console.error(error);
      throw error;
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Missions disponibles</h1>
        <p className="text-muted-foreground">Trouvez votre prochaine mission</p>
      </div>

      {missions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune mission disponible pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {missions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{mission.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {mission.location}
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenDialog(mission)}>
                    Postuler
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{mission.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {mission.skills_required?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    <span>{mission.hourly_rate}€/h</span>
                  </div>
                  {mission.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{mission.duration}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedMission && (
        <ApplyMissionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mission={{
            id: selectedMission.id,
            title: selectedMission.title,
            hourly_rate: selectedMission.hourly_rate,
            company_name: "l'entreprise", // TODO: récupérer le nom de l'entreprise
          }}
          onSubmit={handleApply}
        />
      )}
    </div>
  );
};

export default FreelancerDashboard;
