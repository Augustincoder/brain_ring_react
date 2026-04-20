import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Trash2, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserStore } from '@/store/user-store';

interface User {
  _id: string;
  username: string;
  role: string;
  createdAt: string;
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { _id: currentUserId } = useUserStore();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("player");
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      toast.error("You cannot delete your own admin account.");
      return;
    }
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await api.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        toast.success("User deleted successfully");
        setUsers(users.filter(u => u._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete user", error);
      toast.error("Failed to delete user");
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setIsCreating(true);
      const res = await api.post('/api/admin/users', { 
        username: newUsername, 
        password: newPassword, 
        role: newRole 
      });
      if (res.data.success) {
        toast.success("User created successfully");
        setIsAddUserOpen(false);
        setNewUsername("");
        setNewPassword("");
        setNewRole("player");
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Failed to create user", error);
      toast.error(error.response?.data?.error || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">User Management</h2>
          <p className="text-neutral-400">View and manage platform users and their roles.</p>
        </div>

        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-neutral-200">
              <UserPlus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800 text-white max-h-[85dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Add a new player or administrator alias to the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  className="bg-neutral-900 border-neutral-800 focus-visible:ring-neutral-700 text-base min-h-[44px]"
                  placeholder="e.g. brain_master_99"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="bg-neutral-900 border-neutral-800 focus-visible:ring-neutral-700 text-base min-h-[44px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="bg-neutral-900 border-neutral-800 focus:ring-neutral-700">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateUser} 
                disabled={isCreating}
                className="bg-white text-black hover:bg-neutral-200 font-semibold w-full"
              >
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isCreating ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-900 border-b border-neutral-800 hover:bg-neutral-900">
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="text-neutral-400">Username</TableHead>
                <TableHead className="text-neutral-400 w-32">Role</TableHead>
                <TableHead className="text-neutral-400 w-32">Joined At</TableHead>
                <TableHead className="text-neutral-400 text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-neutral-800 hover:bg-neutral-900/50">
                    <TableCell><Skeleton className="h-4 w-32 bg-neutral-800" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-neutral-800" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-neutral-800" /></TableCell>
                    <TableCell align="right"><Skeleton className="h-8 w-8 bg-neutral-800 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow className="border-neutral-800 focus:bg-transparent hover:bg-transparent">
                  <TableCell colSpan={4} className="h-32 text-center text-neutral-500">
                    No users found in database.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="border-neutral-800 hover:bg-neutral-900/50">
                    <TableCell className="font-medium text-neutral-200">
                      {user.username} {user._id === currentUserId && <span className="text-xs text-neutral-500 ml-2">(You)</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} 
                        className={user.role === 'admin' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-sm">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30" 
                        onClick={() => handleDelete(user._id)}
                        disabled={user._id === currentUserId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
