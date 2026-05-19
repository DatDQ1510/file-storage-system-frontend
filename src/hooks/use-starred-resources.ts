import { useCallback, useEffect, useMemo, useState } from "react"
import {
  getStarredPageApi,
  starFileApi,
  starFolderApi,
  unstarFileApi,
  unstarFolderApi,
} from "@/lib/api/starred-service"

export const useStarredResources = () => {
  const [starredFileIds, setStarredFileIds] = useState<Set<string>>(new Set())
  const [starredFolderIds, setStarredFolderIds] = useState<Set<string>>(new Set())
  const [isLoadingStars, setIsLoadingStars] = useState(true)

  const refreshStars = useCallback(async () => {
    setIsLoadingStars(true)

    try {
      const response = await getStarredPageApi()
      setStarredFileIds(new Set(response.files.map((file) => file.fileId)))
      setStarredFolderIds(new Set(response.folders.map((folder) => folder.folderId)))
    } finally {
      setIsLoadingStars(false)
    }
  }, [])

  useEffect(() => {
    void refreshStars()
  }, [refreshStars])

  const isFileStarred = useCallback(
    (fileId: string) => starredFileIds.has(fileId),
    [starredFileIds]
  )

  const isFolderStarred = useCallback(
    (folderId: string) => starredFolderIds.has(folderId),
    [starredFolderIds]
  )

  const toggleFileStar = useCallback(
    async (fileId: string) => {
      if (starredFileIds.has(fileId)) {
        await unstarFileApi(fileId)
      } else {
        await starFileApi(fileId)
      }

      await refreshStars()
    },
    [refreshStars, starredFileIds]
  )

  const toggleFolderStar = useCallback(
    async (folderId: string) => {
      if (starredFolderIds.has(folderId)) {
        await unstarFolderApi(folderId)
      } else {
        await starFolderApi(folderId)
      }

      await refreshStars()
    },
    [refreshStars, starredFolderIds]
  )

  return useMemo(
    () => ({
      starredFileIds,
      starredFolderIds,
      isLoadingStars,
      isFileStarred,
      isFolderStarred,
      refreshStars,
      toggleFileStar,
      toggleFolderStar,
    }),
    [
      starredFileIds,
      starredFolderIds,
      isLoadingStars,
      isFileStarred,
      isFolderStarred,
      refreshStars,
      toggleFileStar,
      toggleFolderStar,
    ]
  )
}