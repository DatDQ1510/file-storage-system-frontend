import { Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PROJECT_PERMISSION_OPTIONS,
  type TProjectPermissionCode,
} from "@/components/projects/AddProjectMemberModal";
import type { IProjectMemberItem } from "@/lib/api/user-project-service";

interface IProjectMembersModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  projectName: string;
  ownerUserId: string;
  currentUserCanManageMembers: boolean;
  members: IProjectMemberItem[];
  onClose: () => void;
  onUpdatePermission: (memberUserId: string, permission: number) => Promise<void>;
  onDeleteMember: (memberUserId: string) => Promise<void>;
}

interface IConfirmState {
  type: "update-permission" | "delete-member";
  member: IProjectMemberItem;
  permission?: number;
}

const toPermissionCodes = (permissionValue: number): TProjectPermissionCode[] => {
  return PROJECT_PERMISSION_OPTIONS.filter((permission) => {
    return (permissionValue & permission.code) === permission.code;
  }).map((permission) => permission.code);
};

const toPermissionBitmask = (permissions: TProjectPermissionCode[]) => {
  return permissions.reduce((permission, code) => permission | code, 0);
};

const toPermissionLabel = (permissionValue: number) => {
  const activePermissions = PROJECT_PERMISSION_OPTIONS.filter((permission) => {
    return (permissionValue & permission.code) === permission.code;
  }).map((permission) => permission.name);

  if (activePermissions.length === 0) {
    return "READ";
  }

  return activePermissions.join(", ");
};

export const ProjectMembersModal = ({
  isOpen,
  isSubmitting,
  projectName,
  ownerUserId,
  currentUserCanManageMembers,
  members,
  onClose,
  onUpdatePermission,
  onDeleteMember,
}: IProjectMembersModalProps) => {
  const [editingMember, setEditingMember] = useState<IProjectMemberItem | null>(null);
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<TProjectPermissionCode[]>([1]);
  const [confirmState, setConfirmState] = useState<IConfirmState | null>(null);

  const canUpdatePermission = useMemo(() => {
    return selectedPermissionCodes.length > 0;
  }, [selectedPermissionCodes.length]);

  if (!isOpen) {
    return null;
  }

  const resetModalState = () => {
    if (isSubmitting) {
      return;
    }
    setEditingMember(null);
    setConfirmState(null);
    onClose();
  };

  const handleTogglePermission = (permissionCode: TProjectPermissionCode) => {
    setSelectedPermissionCodes((currentPermissions) => {
      const hasPermission = currentPermissions.includes(permissionCode);
      if (hasPermission) {
        return currentPermissions.filter((code) => code !== permissionCode);
      }
      return [...currentPermissions, permissionCode];
    });
  };

  const handleOpenUpdatePermissionModal = (member: IProjectMemberItem) => {
    setEditingMember(member);
    setSelectedPermissionCodes(toPermissionCodes(member.permission));
  };

  const handleConfirmAction = async () => {
    if (!confirmState) {
      return;
    }

    try {
      if (confirmState.type === "delete-member") {
        await onDeleteMember(confirmState.member.userId);
        setConfirmState(null);
        return;
      }

      const nextPermission = confirmState.permission ?? 1;
      await onUpdatePermission(confirmState.member.userId, nextPermission);
      setConfirmState(null);
      setEditingMember(null);
    } catch {
      // Parent handlers surface error details via toast; keep modal state for retry.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={resetModalState}
        aria-label="Close project members modal"
      />

      <div className="relative z-10 flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {isSubmitting && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-700" />
              Applying changes...
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-3xl font-semibold text-slate-900">Project members</h3>
            <p className="mt-1 text-sm text-slate-500">Project: {projectName || "-"}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            onClick={resetModalState}
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Permission</th>
                  <th className="w-48 px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isOwner = member.userId === ownerUserId;
                  const canManageThisMember = currentUserCanManageMembers && !isOwner;

                  return (
                    <tr
                      key={member.userId}
                      className={`border-b border-slate-100 last:border-b-0 ${isOwner ? "bg-amber-50/70" : ""}`}
                    >
                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-800">{member.userName}</p>
                        {isOwner && (
                          <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                            OWNER
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{toPermissionLabel(member.permission)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                            disabled={!canManageThisMember || isSubmitting}
                            onClick={() => handleOpenUpdatePermissionModal(member)}
                          >
                            Update
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="h-8"
                            disabled={!canManageThisMember || isSubmitting}
                            onClick={() =>
                              setConfirmState({
                                type: "delete-member",
                                member,
                              })
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Button type="button" variant="outline" onClick={resetModalState} disabled={isSubmitting}>
            Close
          </Button>
        </div>
      </div>

      {editingMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={() => {
              if (isSubmitting) {
                return;
              }
              setEditingMember(null);
            }}
            aria-label="Close permission modal"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h4 className="text-xl font-semibold text-slate-900">Update permissions</h4>
                <p className="mt-1 text-sm text-slate-500">{editingMember.userName}</p>
              </div>
              <button
                type="button"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  setEditingMember(null);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-slate-600">Select permissions (4 common permissions)</p>
              <div className="overflow-hidden rounded-md border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                      <th className="px-3 py-2">Permission</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="w-24 px-3 py-2 text-center">Allow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROJECT_PERMISSION_OPTIONS.map((permission) => {
                      const isChecked = selectedPermissionCodes.includes(permission.code);

                      return (
                        <tr key={permission.code} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-3 py-3 font-semibold text-slate-800">{permission.name}</td>
                          <td className="px-3 py-3 text-slate-600">{permission.description}</td>
                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(permission.code)}
                              className="h-4 w-4 cursor-pointer accent-cyan-700"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMember(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-cyan-700 text-white hover:bg-cyan-800"
                disabled={isSubmitting || !canUpdatePermission}
                onClick={() =>
                  setConfirmState({
                    type: "update-permission",
                    member: editingMember,
                    permission: toPermissionBitmask(selectedPermissionCodes),
                  })
                }
              >
                Save permission
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmState && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => {
              if (isSubmitting) {
                return;
              }
              setConfirmState(null);
            }}
            aria-label="Close confirm modal"
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h5 className="text-lg font-semibold text-slate-900">Confirm action</h5>
            <p className="mt-2 text-sm text-slate-600">
              {confirmState.type === "delete-member"
                ? `Do you want to remove ${confirmState.member.userName} from this project?`
                : `Do you want to update permissions for ${confirmState.member.userName}?`}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setConfirmState(null)}
              >
                No
              </Button>
              <Button
                type="button"
                className="bg-cyan-700 text-white hover:bg-cyan-800"
                disabled={isSubmitting}
                onClick={() => void handleConfirmAction()}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
