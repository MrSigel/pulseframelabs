"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Lock,
  Unlock,
  Trash2,
  Pencil,
  Search,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface UserRow {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  is_locked: boolean;
  locked_reason: string | null;
  ip_whitelist: string[] | null;
  created_at: string;
  last_sign_in_at: string | null;
  wallet: { balance: number; total_deposited: number; total_spent: number } | null;
  subscription: { status: string; expires_at: string; packages?: { name: string } } | null;
}

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const a = t.admin ?? {};
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [lockModal, setLockModal] = useState<UserRow | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [editModal, setEditModal] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editIps, setEditIps] = useState("");
  const [deleteModal, setDeleteModal] = useState<UserRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const { users: data } = await res.json();
        setUsers(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (u.display_name?.toLowerCase().includes(search.toLowerCase()) ?? false),
      ),
    [users, search],
  );

  async function handleLock(user: UserRow) {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/users/${user.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_locked: !user.is_locked,
          locked_reason: user.is_locked ? null : lockReason,
        }),
      });
      setLockModal(null);
      setLockReason("");
      await loadUsers();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEdit() {
    if (!editModal) return;
    setActionLoading(true);
    try {
      const ipArr = editIps
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await fetch(`/api/admin/users/${editModal.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: editName || null,
          ip_whitelist: ipArr.length > 0 ? ipArr : null,
        }),
      });
      setEditModal(null);
      await loadUsers();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/users/${deleteModal.user_id}`, {
        method: "DELETE",
      });
      setDeleteModal(null);
      await loadUsers();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title={a.userManagement ?? "User Management"} />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={a.search ?? "Search..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          {a.loading ?? "Loading..."}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.email ?? "Email"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.displayName ?? "Display Name"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.status ?? "Status"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.subscription ?? "Subscription"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.balance ?? "Balance"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.registeredAt ?? "Registered"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">{a.actions ?? "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.user_id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground font-mono text-xs">
                        {user.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {user.display_name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {user.is_locked ? (
                          <Badge variant="destructive" className="text-[10px]">
                            {a.locked ?? "Locked"}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            {a.active ?? "Active"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.subscription ? (
                          <Badge variant="default" className="text-[10px]">
                            {(user.subscription.packages as Record<string, unknown> | undefined)?.name as string ?? "Active"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {a.noSubscription ?? "No Subscription"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono">
                        {user.wallet?.balance ?? 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setLockModal(user);
                              setLockReason("");
                            }}
                            title={user.is_locked ? (a.unlockUser ?? "Unlock") : (a.lockUser ?? "Lock")}
                          >
                            {user.is_locked ? (
                              <Unlock className="h-3.5 w-3.5" />
                            ) : (
                              <Lock className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditModal(user);
                              setEditName(user.display_name ?? "");
                              setEditIps(user.ip_whitelist?.join(", ") ?? "");
                            }}
                            title={a.editUser ?? "Edit"}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteModal(user)}
                            title={a.deleteUser ?? "Delete"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        {a.noData ?? "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lock/Unlock Modal */}
      <Dialog open={!!lockModal} onOpenChange={() => setLockModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lockModal?.is_locked
                ? (a.unlockUser ?? "Unlock User")
                : (a.lockUser ?? "Lock User")}
            </DialogTitle>
            <DialogDescription>
              {lockModal?.is_locked
                ? (a.userUnlocked ?? "This will unlock the user.")
                : (a.confirmLock ?? "Are you sure you want to lock this user?")}
            </DialogDescription>
          </DialogHeader>
          {lockModal && !lockModal.is_locked && (
            <div className="py-2">
              <label className="text-sm text-muted-foreground mb-1 block">
                {a.lockReason ?? "Lock Reason"}
              </label>
              <Input
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Optional reason..."
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLockModal(null)}>
              {a.cancel ?? "Cancel"}
            </Button>
            <Button
              variant={lockModal?.is_locked ? "default" : "destructive"}
              disabled={actionLoading}
              onClick={() => lockModal && handleLock(lockModal)}
            >
              {actionLoading
                ? (a.loading ?? "Loading...")
                : lockModal?.is_locked
                  ? (a.unlockUser ?? "Unlock")
                  : (a.lockUser ?? "Lock")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editModal} onOpenChange={() => setEditModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{a.editUser ?? "Edit User"}</DialogTitle>
            <DialogDescription>
              {editModal?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {a.displayName ?? "Display Name"}
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                {a.ipWhitelist ?? "IP Whitelist"}{" "}
                <span className="text-xs">(comma separated)</span>
              </label>
              <Input
                value={editIps}
                onChange={(e) => setEditIps(e.target.value)}
                placeholder="192.168.1.1, 10.0.0.1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditModal(null)}>
              {a.cancel ?? "Cancel"}
            </Button>
            <Button disabled={actionLoading} onClick={handleEdit}>
              {actionLoading ? (a.loading ?? "Loading...") : (a.save ?? "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{a.deleteUser ?? "Delete User"}</DialogTitle>
            <DialogDescription>
              {a.confirmDelete ??
                "Are you sure you want to delete this user? This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            {deleteModal?.email}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>
              {a.cancel ?? "Cancel"}
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={handleDelete}
            >
              {actionLoading
                ? (a.loading ?? "Loading...")
                : (a.deleteUser ?? "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
