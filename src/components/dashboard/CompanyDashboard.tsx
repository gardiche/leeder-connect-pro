import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import MissionList from "./MissionList";
import CreateMissionDialog from "./CreateMissionDialog";

const CompanyDashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMissionCreated = () => {
    setShowCreateDialog(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes missions</h1>
          <p className="text-muted-foreground">Gérez vos missions et candidatures</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle mission
        </Button>
      </div>

      <MissionList key={refreshKey} />

      <CreateMissionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onMissionCreated={handleMissionCreated}
      />
    </div>
  );
};

export default CompanyDashboard;
