import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SKILLS_OPTIONS = [
  "Merchandising",
  "Mise en rayon",
  "PLV",
  "Animation commerciale",
  "Inventaire",
  "Facing",
  "Théâtralisation",
  "Implantation",
];

const FreelancerOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    photo_url: "",
    birth_date: "",
    nationality: "",
    address: "",
    email: "",
    phone: "",
    skills: [] as string[],
    experience: "",
    location: "",
    max_travel_time: "",
    distance_limit: "",
    is_available: true,
  });

  useEffect(() => {
    checkUserAndProfile();
  }, []);

  const checkUserAndProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      // Get existing profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const { data: freelancerProfile } = await supabase
        .from("freelancer_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (freelancerProfile?.profile_completed) {
        navigate("/dashboard");
        return;
      }

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.name || "",
          email: profile.email || "",
          photo_url: profile.photo_url || "",
        }));
      }

      if (freelancerProfile) {
        setFormData(prev => ({
          ...prev,
          birth_date: freelancerProfile.birth_date || "",
          nationality: freelancerProfile.nationality || "",
          address: freelancerProfile.address || "",
          phone: freelancerProfile.phone || "",
          skills: freelancerProfile.skills || [],
          experience: freelancerProfile.experience || "",
          location: freelancerProfile.location || "",
          max_travel_time: freelancerProfile.max_travel_time?.toString() || "",
          distance_limit: freelancerProfile.distance_limit?.toString() || "50",
          is_available: freelancerProfile.is_available ?? true,
        }));
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors du chargement du profil");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.birth_date || !formData.nationality) {
          toast.error("Veuillez remplir tous les champs obligatoires");
          return false;
        }
        break;
      case 2:
        if (!formData.address || !formData.email || !formData.phone) {
          toast.error("Veuillez remplir tous les champs obligatoires");
          return false;
        }
        break;
      case 3:
        if (formData.skills.length === 0 || !formData.experience) {
          toast.error("Veuillez sélectionner au moins une compétence et décrire votre expérience");
          return false;
        }
        break;
      case 4:
        if (!formData.location || !formData.max_travel_time || !formData.distance_limit) {
          toast.error("Veuillez remplir tous les champs obligatoires");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep() || !userId) return;

    setLoading(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          photo_url: formData.photo_url,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Update freelancer_profiles table
      const { error: freelancerError } = await supabase
        .from("freelancer_profiles")
        .update({
          birth_date: formData.birth_date,
          nationality: formData.nationality,
          address: formData.address,
          phone: formData.phone,
          skills: formData.skills,
          experience: formData.experience,
          location: formData.location,
          max_travel_time: parseInt(formData.max_travel_time),
          distance_limit: parseInt(formData.distance_limit),
          is_available: formData.is_available,
          profile_completed: true,
        })
        .eq("id", userId);

      if (freelancerError) throw freelancerError;

      toast.success("Profil complété avec succès !");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde du profil");
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complétez votre profil freelance</CardTitle>
          <CardDescription>
            Étape {currentStep} sur 4
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Informations personnelles</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Nom et prénom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo de profil</Label>
                <div className="flex items-center gap-4">
                  {formData.photo_url && (
                    <img
                      src={formData.photo_url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Télécharger une photo
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fonctionnalité d'upload à implémenter avec Supabase Storage
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange("birth_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  placeholder="Française"
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Coordonnées</h3>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Rue de la République, 69001 Lyon"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Cette adresse ne peut pas être modifiée
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          )}

          {/* Step 3: Skills and Experience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Compétences et expérience</h3>

              <div className="space-y-2">
                <Label>Compétences principales *</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_OPTIONS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur les compétences que vous maîtrisez
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience *</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="Décrivez votre expérience dans le merchandising..."
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* Step 4: Location and Availability */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Localisation et disponibilité</h3>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Lyon, France"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_travel_time">Temps de trajet maximum (en minutes) *</Label>
                <Input
                  id="max_travel_time"
                  type="number"
                  value={formData.max_travel_time}
                  onChange={(e) => handleInputChange("max_travel_time", e.target.value)}
                  placeholder="30"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance_limit">Distance maximum (en km) *</Label>
                <Input
                  id="distance_limit"
                  type="number"
                  value={formData.distance_limit}
                  onChange={(e) => handleInputChange("distance_limit", e.target.value)}
                  placeholder="50"
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => handleInputChange("is_available", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_available" className="font-normal cursor-pointer">
                  Je suis actuellement disponible pour des missions
                </Label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Enregistrement..." : "Terminer"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerOnboarding;
