import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { QuestionsTab } from "@/components/admin/QuestionsTab";
import { UsersTab } from "@/components/admin/UsersTab";

export function AdminDashboard() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-md bg-neutral-900 text-neutral-400 border border-neutral-800">
        <TabsTrigger value="overview" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
          Overview
        </TabsTrigger>
        <TabsTrigger value="questions" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
          Questions
        </TabsTrigger>
        <TabsTrigger value="users" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
          Users
        </TabsTrigger>
      </TabsList>
      <div className="mt-6 border border-neutral-800 bg-neutral-900 rounded-xl p-4 md:p-6 shadow-xl">
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
