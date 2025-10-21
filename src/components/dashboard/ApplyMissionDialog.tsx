import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ApplyMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: {
    id: string;
    title: string;
    hourly_rate: number;
    company_name?: string;
  };
  onSubmit: (data: {
    message: string;
    availability: string;
    availability_date?: Date;
    proposed_rate?: number;
  }) => Promise<void>;
}

const ApplyMissionDialog = ({ open, onOpenChange, mission, onSubmit }: ApplyMissionDialogProps) => {
  const [message, setMessage] = useState("");
  const [availability, setAvailability] = useState<"immediate" | "date">("immediate");
  const [availabilityDate, setAvailabilityDate] = useState<Date>();
  const [proposedRate, setProposedRate] = useState<string>(mission.hourly_rate.toString());
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        message,
        availability: availability === "immediate" ? "Immédiate" : format(availabilityDate!, "dd/MM/yyyy", { locale: fr }),
        availability_date: availabilityDate,
        proposed_rate: parseFloat(proposedRate) || mission.hourly_rate,
      });

      setSubmitted(true);

      // Afficher le message de succès pendant 2 secondes puis fermer
      setTimeout(() => {
        setSubmitted(false);
        onOpenChange(false);
        // Reset form
        setMessage("");
        setAvailability("immediate");
        setAvailabilityDate(undefined);
        setProposedRate(mission.hourly_rate.toString());
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Candidature envoyée !</h3>
            <p className="text-muted-foreground max-w-sm">
              Nous avons notifié {mission.company_name || "l'entreprise"}.
              Tu recevras une notification dès qu'elle consulte ton profil.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Postuler à cette mission ?</DialogTitle>
          <DialogDescription className="text-base">
            Vérifie tes informations avant d'envoyer ta candidature à{" "}
            <span className="font-medium text-foreground">
              {mission.company_name || "cette entreprise"}
            </span>
            . Tu peux ajouter un message pour te présenter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Message au recruteur */}
          <div className="space-y-2">
            <Label htmlFor="message">Message au recruteur (facultatif)</Label>
            <Textarea
              id="message"
              placeholder="Bonjour, je suis disponible dès lundi matin. J'ai déjà travaillé sur des implantations similaires."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Disponibilité */}
          <div className="space-y-3">
            <Label>Disponibilité estimée</Label>
            <RadioGroup value={availability} onValueChange={(value: any) => setAvailability(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="font-normal cursor-pointer">
                  Immédiate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="date" id="date" />
                <Label htmlFor="date" className="font-normal cursor-pointer">
                  À partir du
                </Label>
              </div>
            </RadioGroup>

            {availability === "date" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !availabilityDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {availabilityDate ? (
                      format(availabilityDate, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={availabilityDate}
                    onSelect={setAvailabilityDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Tarif proposé */}
          <div className="space-y-2">
            <Label htmlFor="rate">Tarif souhaité (optionnel)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="rate"
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                className="flex-1"
                min="0"
                step="0.5"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">€/heure</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tarif proposé par l'entreprise : {mission.hourly_rate} €/h
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (availability === "date" && !availabilityDate)}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Envoi en cours..." : "Confirmer ma candidature"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyMissionDialog;
