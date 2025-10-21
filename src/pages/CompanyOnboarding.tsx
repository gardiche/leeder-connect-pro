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

const MISSION_TYPES_OPTIONS = [
  "Merchandising",
  "Mise en rayon",
  "PLV",
  "Animation commerciale",
  "Inventaire",
  "Facing",
  "Théâtralisation",
  "Implantation",
  "Audit terrain",
  "Formation",
];

const SECTOR_OPTIONS = [
  "Grande distribution",
  "Commerce spécialisé",
  "Retail",
  "Cosmétique",
  "Alimentaire",
  "Textile",
  "Électronique",
  "Bricolage",
  "Autre",
];

const CompanyOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    company_name: "",
    siret: "",
    kbis_document_url: "",
    activity: "",
    contact_name: "",
    address: "",
    sector: "",
    location: "",
    mission_types: [] as string[],
    special_requirements: "",
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

      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (companyProfile?.profile_completed) {
        navigate("/dashboard");
        return;
      }

      if (profile) {
        setFormData(prev => ({
          ...prev,
          company_name: profile.name || "",
        }));
      }

      if (companyProfile) {
        setFormData(prev => ({
          ...prev,
          company_name: companyProfile.company_name || "",
          siret: companyProfile.siret || "",
          kbis_document_url: companyProfile.kbis_document_url || "",
          activity: companyProfile.activity || "",
          contact_name: companyProfile.contact_name || "",
          address: companyProfile.address || "",
          sector: companyProfile.sector || "",
          location: companyProfile.location || "",
          mission_types: companyProfile.mission_types || [],
          special_requirements: companyProfile.special_requirements || "",
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

  const toggleMissionType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      mission_types: prev.mission_types.includes(type)
        ? prev.mission_types.filter(t => t !== type)
        : [...prev.mission_types, type]
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.company_name || !formData.siret || !formData.activity) {
          toast.error("Veuillez remplir tous les champs obligatoires");
          return false;
        }
        break;
      case 2:
        if (!formData.contact_name || !formData.address) {
          toast.error("Veuillez remplir tous les champs obligatoires");
          return false;
        }
        break;
      case 3:
        if (!formData.sector || !formData.location) {
          toast.error("Veuillez remplir tous les champs obligatoires");
          return false;
        }
        break;
      case 4:
        if (formData.mission_types.length === 0) {
          toast.error("Veuillez sélectionner au moins un type de mission");
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
          name: formData.company_name,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Update company_profiles table
      const { error: companyError } = await supabase
        .from("company_profiles")
        .update({
          company_name: formData.company_name,
          siret: formData.siret,
          kbis_document_url: formData.kbis_document_url,
          activity: formData.activity,
          contact_name: formData.contact_name,
          address: formData.address,
          sector: formData.sector,
          location: formData.location,
          mission_types: formData.mission_types,
          special_requirements: formData.special_requirements,
          profile_completed: true,
        })
        .eq("id", userId);

      if (companyError) throw companyError;

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
          <CardTitle>Complétez votre profil entreprise</CardTitle>
          <CardDescription>
            Étape {currentStep} sur 4
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent>
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Informations sur l'entreprise</h3>

              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="LEEDER SAS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET *</Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => handleInputChange("siret", e.target.value)}
                  placeholder="123 456 789 00012"
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kbis">Document K-bis</Label>
                <div className="flex items-center gap-4">
                  {formData.kbis_document_url && (
                    <span className="text-sm text-muted-foreground">Document téléchargé</span>
                  )}
                  <Button variant="outline" size="sm" type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    Télécharger K-bis
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fonctionnalité d'upload à implémenter avec Supabase Storage
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Enseigne ou activité *</Label>
                <Input
                  id="activity"
                  value={formData.activity}
                  onChange={(e) => handleInputChange("activity", e.target.value)}
                  placeholder="Distribution de produits alimentaires"
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personne à contacter</h3>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Nom du contact *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange("contact_name", e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse de l'entreprise *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Rue de la République, 69001 Lyon"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Sector and Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Secteur et localisation</h3>

              <div className="space-y-2">
                <Label htmlFor="sector">Secteur d'activité *</Label>
                <div className="flex flex-wrap gap-2">
                  {SECTOR_OPTIONS.map((sector) => (
                    <Badge
                      key={sector}
                      variant={formData.sector === sector ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleInputChange("sector", sector)}
                    >
                      {sector}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez votre secteur d'activité principal
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Lyon, Auvergne-Rhône-Alpes"
                />
                <p className="text-sm text-muted-foreground">
                  Zone géographique principale de vos activités
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Mission Types and Requirements */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Types de missions et exigences</h3>

              <div className="space-y-2">
                <Label>Types de missions offertes *</Label>
                <div className="flex flex-wrap gap-2">
                  {MISSION_TYPES_OPTIONS.map((type) => (
                    <Badge
                      key={type}
                      variant={formData.mission_types.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleMissionType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les types de missions que vous proposez
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requirements">Exigences particulières et compétences</Label>
                <Textarea
                  id="special_requirements"
                  value={formData.special_requirements}
                  onChange={(e) => handleInputChange("special_requirements", e.target.value)}
                  placeholder="Décrivez les compétences spécifiques recherchées, les exigences particulières pour vos missions..."
                  rows={5}
                />
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

export default CompanyOnboarding;
