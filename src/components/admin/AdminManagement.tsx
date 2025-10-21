import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Users, Briefcase, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminManagement = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string }>({
    open: false,
    type: "",
    id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [missionsRes, profilesRes, applicationsRes] = await Promise.all([
        supabase.from("missions").select("*, company:profiles!company_id(name)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("applications").select("*, mission:missions(title), freelancer:profiles!freelancer_id(name)").order("created_at", { ascending: false }),
      ]);

      if (missionsRes.error) throw missionsRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (applicationsRes.error) throw applicationsRes.error;

      setMissions(missionsRes.data || []);
      setUsers(profilesRes.data || []);
      setApplications(applicationsRes.data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des données");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const { type, id } = deleteDialog;
    try {
      let error;

      switch (type) {
        case "mission":
          ({ error } = await supabase.from("missions").delete().eq("id", id));
          break;
        case "user":
          ({ error } = await supabase.from("profiles").delete().eq("id", id));
          break;
        case "application":
          ({ error } = await supabase.from("applications").delete().eq("id", id));
          break;
      }

      if (error) throw error;

      toast.success("Élément supprimé avec succès");
      fetchData();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } finally {
      setDeleteDialog({ open: false, type: "", id: "" });
    }
  };

  const handleStatusChange = async (missionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("missions")
        .update({ status: newStatus })
        .eq("id", missionId);

      if (error) throw error;

      toast.success("Statut mis à jour");
      fetchData();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  const handleApplicationStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success("Statut de candidature mis à jour");
      fetchData();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Missions ({missions.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs ({users.length})
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Candidatures ({applications.length})
          </TabsTrigger>
        </TabsList>

        {/* Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Tarif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium">{mission.title}</TableCell>
                    <TableCell>{mission.company?.name || "N/A"}</TableCell>
                    <TableCell>{mission.location}</TableCell>
                    <TableCell>{mission.hourly_rate}€/h</TableCell>
                    <TableCell>
                      <select
                        value={mission.status}
                        onChange={(e) => handleStatusChange(mission.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="open">Ouverte</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toast.info("Fonctionnalité d'édition à venir")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, type: "mission", id: mission.id })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toast.info("Fonctionnalité d'édition à venir")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, type: "user", id: user.id })}
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Freelance</TableHead>
                  <TableHead>Mission</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.freelancer?.name || "N/A"}</TableCell>
                    <TableCell>{app.mission?.title || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">{app.message}</TableCell>
                    <TableCell>
                      <select
                        value={app.status}
                        onChange={(e) => handleApplicationStatusChange(app.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">En attente</option>
                        <option value="accepted">Acceptée</option>
                        <option value="rejected">Refusée</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      {new Date(app.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, type: "application", id: app.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement cet élément de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminManagement;
