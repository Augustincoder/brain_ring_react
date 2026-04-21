import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { QuestionsTab } from "@/components/admin/QuestionsTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { LayoutDashboard, FileQuestion, Users } from "lucide-react";

export function AdminDashboard() {
  return (
    <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col overflow-hidden min-h-0">
      <TabsList className="grid w-full grid-cols-3 max-w-sm bg-neutral-900 border border-neutral-800 p-1">
        <TabsTrigger value="overview" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-primary transition-all">
          <LayoutDashboard className="h-5 w-5" />
        </TabsTrigger>
        <TabsTrigger value="questions" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-primary transition-all">
          <FileQuestion className="h-5 w-5" />
        </TabsTrigger>
        <TabsTrigger value="users" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-primary transition-all">
          <Users className="h-5 w-5" />
        </TabsTrigger>
      </TabsList>
      <div className="mt-6 border border-neutral-800 bg-neutral-900 rounded-xl p-4 md:p-6 shadow-xl flex-1 overflow-y-auto min-h-0">
        <TabsContent value="overview" className="mt-0 outline-none">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="questions" className="mt-0 outline-none">
          <QuestionsTab />
        </TabsContent>
        <TabsContent value="users" className="mt-0 outline-none">
          <UsersTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
