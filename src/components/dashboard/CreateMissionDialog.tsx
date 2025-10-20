import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreateMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMissionCreated: () => void;
}

const CreateMissionDialog = ({ open, onOpenChange, onMissionCreated }: CreateMissionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    hourly_rate: "",
    duration: "",
    skills: "",
    equipment_needed: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const skillsArray = formData.skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const { error } = await supabase
        .from("missions")
        .insert({
          company_id: user.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          hourly_rate: parseFloat(formData.hourly_rate),
          duration: formData.duration,
          skills_required: skillsArray,
          equipment_needed: formData.equipment_needed,
        });

      if (error) throw error;

      toast.success("Mission créée avec succès !");
      setFormData({
        title: "",
        description: "",
        location: "",
        hourly_rate: "",
        duration: "",
        skills: "",
        equipment_needed: "",
      });
      onMissionCreated();
    } catch (error: any) {
      toast.error("Erreur lors de la création de la mission");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle mission</DialogTitle>
          <DialogDescription>
            Remplissez les informations de votre mission pour trouver le freelance idéal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la mission *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Ex: Merchandiser pour événement..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Décrivez la mission en détail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="Ex: Lyon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Ex: 2 jours"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Taux horaire (€) *</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
              required
              placeholder="Ex: 25"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Compétences requises</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="Séparez par des virgules (ex: PLV, Mise en rayon...)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Équipement nécessaire</Label>
            <Textarea
              id="equipment"
              value={formData.equipment_needed}
              onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
              rows={2}
              placeholder="Précisez l'équipement que le freelance doit apporter..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer la mission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMissionDialog;
