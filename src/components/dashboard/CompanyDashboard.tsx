import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Briefcase, FileText } from "lucide-react";
import MissionList from "./MissionList";
import CreateMissionDialog from "./CreateMissionDialog";
import ApplicationsList from "../company/ApplicationsList";

const CompanyDashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("missions");

  const handleMissionCreated = () => {
    setShowCreateDialog(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tableau de bord entreprise</h1>
          <p className="text-muted-foreground">Gérez vos missions et candidatures</p>
        </div>
        {activeTab === "missions" && (
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle mission
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Mes missions
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Candidatures reçues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions">
          <MissionList key={refreshKey} />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsList />
        </TabsContent>
      </Tabs>

      <CreateMissionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onMissionCreated={handleMissionCreated}
      />
    </div>
  );
};

export default CompanyDashboard;
