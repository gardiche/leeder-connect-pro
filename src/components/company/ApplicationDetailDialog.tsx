import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, MessageCircle, MapPin, Clock, Euro, Star, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

interface ApplicationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onStatusChange: () => void;
}

const ApplicationDetailDialog = ({ open, onOpenChange, application, onStatusChange }: ApplicationDetailDialogProps) => {
  const [loading, setLoading] = useState(false);

  if (!application) return null;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "accepted" })
        .eq("id", application.id);

      if (error) throw error;

      toast.success("✅ Candidature acceptée. Le contrat va être généré automatiquement.");
      onStatusChange();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erreur lors de l'acceptation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "rejected" })
        .eq("id", application.id);

      if (error) throw error;

      toast.success("❌ Candidature refusée. Le freelance a été notifié.");
      onStatusChange();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erreur lors du refus");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscuss = () => {
    toast.success(`💬 Conversation ouverte avec ${application.freelancer.name}.`);
    // TODO: Implémenter la messagerie
    onOpenChange(false);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: "Nouvelle", variant: "default" as const, color: "bg-blue-500" },
      accepted: { label: "Acceptée", variant: "default" as const, color: "bg-green-500" },
      rejected: { label: "Refusée", variant: "destructive" as const, color: "bg-red-500" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <Badge variant={badge.variant} className={badge.color}>
        {badge.label}
      </Badge>
    );
  };

  const freelancerProfile = application.freelancer.freelancer_profile;
  const initials = application.freelancer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détail de la candidature</DialogTitle>
          <DialogDescription>
            Candidature pour : {application.mission.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Freelancer Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={application.freelancer.photo_url} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{application.freelancer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {freelancerProfile?.rating_average > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{freelancerProfile.rating_average.toFixed(1)}</span>
                      </div>
                    )}
                    {getStatusBadge(application.status)}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Profil complet à venir")}>
                  <User className="h-4 w-4 mr-2" />
                  Voir le profil
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Compétences */}
          {freelancerProfile?.skills && freelancerProfile.skills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Compétences principales</h4>
              <div className="flex flex-wrap gap-2">
                {freelancerProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Message de candidature */}
          {application.message && (
            <div>
              <h4 className="font-semibold mb-2">Message envoyé</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{application.message}</p>
              </div>
            </div>
          )}

          {/* Informations pratiques */}
          <div className="grid grid-cols-2 gap-4">
            {freelancerProfile?.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Localisation</p>
                  <p className="text-sm text-muted-foreground">{freelancerProfile.location}</p>
                </div>
              </div>
            )}

            {freelancerProfile?.distance_limit && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Distance max</p>
                  <p className="text-sm text-muted-foreground">{freelancerProfile.distance_limit} km</p>
                </div>
              </div>
            )}
          </div>

          {/* Tarifs */}
          <div>
            <h4 className="font-semibold mb-3">Tarifs</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tarif proposé</span>
                </div>
                <p className="text-2xl font-bold">{application.mission.hourly_rate}€/h</p>
                <p className="text-xs text-muted-foreground">Par votre entreprise</p>
              </div>

              <div className={`p-4 rounded-lg ${
                freelancerProfile?.hourly_rate && freelancerProfile.hourly_rate !== application.mission.hourly_rate
                  ? "bg-amber-50 dark:bg-amber-950"
                  : "bg-muted"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tarif demandé</span>
                </div>
                <p className="text-2xl font-bold">
                  {freelancerProfile?.hourly_rate || application.mission.hourly_rate}€/h
                </p>
                <p className="text-xs text-muted-foreground">
                  {freelancerProfile?.hourly_rate && freelancerProfile.hourly_rate !== application.mission.hourly_rate
                    ? "Tarif négocié"
                    : "Tarif accepté"}
                </p>
              </div>
            </div>
          </div>

          {/* Expérience */}
          {freelancerProfile?.experience && (
            <div>
              <h4 className="font-semibold mb-2">Expérience</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{freelancerProfile.experience}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {application.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={loading}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Refuser
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDiscuss}
                  disabled={loading}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discuter
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Check className="h-4 w-4" />
                  {loading ? "Traitement..." : "Accepter"}
                </Button>
              </>
            )}

            {application.status === "accepted" && (
              <Button variant="outline" onClick={handleDiscuss} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Contacter le freelance
              </Button>
            )}

            {application.status === "rejected" && (
              <p className="text-sm text-muted-foreground">Cette candidature a été refusée</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailDialog;
