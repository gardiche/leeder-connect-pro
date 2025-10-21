import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { FileText, Star } from "lucide-react";
import ApplicationDetailDialog from "./ApplicationDetailDialog";

interface Application {
  id: string;
  message: string;
  status: string;
  created_at: string;
  freelancer: {
    id: string;
    name: string;
    photo_url?: string;
    freelancer_profile: {
      skills: string[];
      rating_average: number;
      location: string;
      distance_limit: number;
      hourly_rate: number;
      experience: string;
    };
  };
  mission: {
    id: string;
    title: string;
    hourly_rate: number;
  };
}

const ApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get missions created by this company
      const { data: missions, error: missionsError } = await supabase
        .from("missions")
        .select("id")
        .eq("company_id", user.id);

      if (missionsError) throw missionsError;

      const missionIds = missions?.map(m => m.id) || [];

      if (missionIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Get applications for these missions
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          freelancer:profiles!freelancer_id(
            id,
            name,
            photo_url
          ),
          mission:missions(
            id,
            title,
            hourly_rate
          )
        `)
        .in("mission_id", missionIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch freelancer profiles separately
      const applicationsWithProfiles = await Promise.all(
        (data || []).map(async (app) => {
          const { data: freelancerProfile } = await supabase
            .from("freelancer_profiles")
            .select("*")
            .eq("id", app.freelancer_id)
            .single();

          return {
            ...app,
            freelancer: {
              ...app.freelancer,
              freelancer_profile: freelancerProfile || {},
            },
          };
        })
      );

      setApplications(applicationsWithProfiles as any);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des candidatures");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const handleStatusChange = () => {
    fetchApplications();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: "Nouvelle", className: "bg-blue-500 text-white" },
      accepted: { label: "Acceptée", className: "bg-green-500 text-white" },
      rejected: { label: "Refusée", className: "bg-red-500 text-white" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  if (loading) {
    return <div className="p-8">Chargement des candidatures...</div>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune candidature reçue pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Candidatures reçues</h2>
        <Badge variant="secondary" className="text-base px-3 py-1">
          {applications.length} candidature{applications.length > 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => {
          const freelancerProfile = application.freelancer.freelancer_profile;
          const initials = application.freelancer.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Photo */}
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={application.freelancer.photo_url} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {application.freelancer.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          Pour : {application.mission.title}
                        </p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {/* Compétences */}
                      {freelancerProfile?.skills && freelancerProfile.skills.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Compétences:</span>
                          <span className="truncate">
                            {freelancerProfile.skills.slice(0, 3).join(", ")}
                            {freelancerProfile.skills.length > 3 && "..."}
                          </span>
                        </div>
                      )}

                      {/* Note moyenne */}
                      {freelancerProfile?.rating_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{freelancerProfile.rating_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bouton */}
                  <Button onClick={() => handleViewApplication(application)}>
                    Voir la candidature
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog */}
      <ApplicationDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        application={selectedApplication}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default ApplicationsList;
