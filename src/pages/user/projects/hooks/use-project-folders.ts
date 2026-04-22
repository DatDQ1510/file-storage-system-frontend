import { useCallback, useMemo, useState } from "react"
import {
  createProjectFolderWithAcl,
  getProjectFolders,
} from "@/pages/user/projects/services/folder-service"
import type {
  ICreateFolderWithAclRequest,
  IProjectFolderItem,
} from "@/pages/user/projects/types/folder"

const toFolderItemFromCreateResponse = (input: {
  id?: string
  nameFolder?: string
  parentFolderId?: string | null
}): IProjectFolderItem => {
  return {
    id: input.id?.trim() ? input.id : `folder-${Date.now()}`,
    name: input.nameFolder?.trim() ? input.nameFolder : "Untitled Folder",
    filesCount: 0,
    parentFolderId: input.parentFolderId ?? null,
  }
}

export const useProjectFolders = (projectId?: string) => {
  const [folders, setFolders] = useState<IProjectFolderItem[]>([])
  const [isLoadingFolders, setIsLoadingFolders] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  const loadFolders = useCallback(async () => {
    if (!projectId) {
      setFolders([])
      return
    }

    setIsLoadingFolders(true)
    try {
      const items = await getProjectFolders(projectId)
      setFolders(items)
    } catch {
      setFolders([])
      throw new Error("Unable to load project folders")
    } finally {
      setIsLoadingFolders(false)
    }
  }, [projectId])

  const createFolder = useCallback(
    async (request: ICreateFolderWithAclRequest) => {
      if (!projectId) {
        throw new Error("Project ID is missing")
      }

      setIsCreatingFolder(true)
      try {
        const created = await createProjectFolderWithAcl({
          projectId,
          request,
        })

        const createdFolder = toFolderItemFromCreateResponse({
          id: created.folder?.id,
          nameFolder: created.folder?.nameFolder,
          parentFolderId: created.folder?.parentFolderId,
        })

        setFolders((current) => {
          const withoutVirtual = current.filter((folder) => !folder.isVirtual)
          return [createdFolder, ...withoutVirtual]
        })

        return created
      } finally {
        setIsCreatingFolder(false)
      }
    },
    [projectId]
  )

  const visibleFolders = useMemo(() => folders, [folders])

  return {
    folders: visibleFolders,
    isLoadingFolders,
    isCreatingFolder,
    loadFolders,
    createFolder,
  }
}
