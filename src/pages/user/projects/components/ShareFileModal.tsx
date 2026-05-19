import { useEffect, useState, useCallback } from "react";
import { Loader2, UserPlus, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  shareFileApi,
  getFileSharesApi,
  unshareFileApi,
  updateFileShareApi,
  type IFileShareResponse,
  type TFileSharePermission,
} from "@/lib/api/file-service-updated";
import { getTenantUserOptions, type IUserTenantOption } from "@/lib/api/user-project-service";

interface ShareFileModalProps {
  fileId: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareFileModal = ({
  fileId,
  fileName,
  isOpen,
  onClose,
}: ShareFileModalProps) => {
  const [shares, setShares] = useState<IFileShareResponse[]>([]);
  const [tenantUsers, setTenantUsers] = useState<IUserTenantOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedPermission, setSelectedPermission] = useState<TFileSharePermission>("VIEW");

  const loadData = useCallback(async () => {
    if (!isOpen || !fileId) return;
    
    setIsLoading(true);
    try {
      const [sharesData, usersData] = await Promise.all([
        getFileSharesApi(fileId),
        getTenantUserOptions({ page: 0, offset: 100 })
      ]);
      setShares(sharesData);
      setTenantUsers(usersData);
    } catch (err) {
      console.error("Failed to load share data", err);
      toast.error("Failed to load sharing information");
    } finally {
      setIsLoading(false);
    }
  }, [fileId, isOpen]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Filter out users who already have access
  const availableUsers = tenantUsers.filter(
    (user) => !shares.some((share) => share.sharedWithUserId === user.id)
  );

  const handleShare = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user to share with");
      return;
    }

    setIsSharing(true);
    try {
      await shareFileApi(fileId, {
        sharedWithUserId: selectedUserId,
        permission: selectedPermission,
      });
      toast.success("File shared successfully");
      setSelectedUserId(""); // reset
      void loadData();
    } catch {
      toast.error("Failed to share file");
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdateShare = async (sharedWithUserId: string, newPermission: TFileSharePermission) => {
    try {
      await updateFileShareApi(fileId, sharedWithUserId, {
        sharedWithUserId,
        permission: newPermission,
      });
      toast.success("Permission updated");
      void loadData();
    } catch {
      toast.error("Failed to update permission");
    }
  };

  const handleRemoveShare = async (sharedWithUserId: string) => {
    try {
      await unshareFileApi(fileId, sharedWithUserId);
      toast.success("Access revoked");
      void loadData();
    } catch {
      toast.error("Failed to revoke access");
    }
  };

  const getUserEmail = (userId: string) => {
    const user = tenantUsers.find(u => u.id === userId);
    return user ? user.email : userId;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Close modal" />

      <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Share File</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Share "{fileName}" with members of your organization
            </p>
          </div>
          <button type="button" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Share Form */}
              <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-medium text-slate-700">Add people</h4>
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                  <select
                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value as TFileSharePermission)}
                  >
                    <option value="VIEW">Viewer</option>
                    <option value="COMMENT">Commenter</option>
                    <option value="EDIT">Editor</option>
                  </select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => void handleShare()} 
                  disabled={isSharing || !selectedUserId || availableUsers.length === 0}
                >
                  {isSharing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Share
                </Button>
              </div>

              {/* Current Shares */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">People with access</h4>
                
                {shares.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-4">
                    This file is not shared with anyone yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-2 rounded-md border border-slate-100 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                            {getUserEmail(share.sharedWithUserId).substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">
                              {getUserEmail(share.sharedWithUserId)}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(share.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <select
                            className="h-8 rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-xs text-slate-600 focus:ring-0 cursor-pointer"
                            value={share.permission}
                            onChange={(e) => void handleUpdateShare(share.sharedWithUserId, e.target.value as TFileSharePermission)}
                          >
                            <option value="VIEW">Viewer</option>
                            <option value="COMMENT">Commenter</option>
                            <option value="EDIT">Editor</option>
                          </select>
                          <button
                            onClick={() => void handleRemoveShare(share.sharedWithUserId)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                            title="Remove access"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Button type="button" variant="outline" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
};
