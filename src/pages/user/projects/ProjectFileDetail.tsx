import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Download, FileText, Loader2, FileWarning, Edit, Share2 } from "lucide-react";
import { getFileByIdApi, type IFileResponse } from "@/lib/api/file-service-updated";
import { getPresignedUrl } from "@/lib/api/storage-service";
import { toast } from "sonner";
import { getProjectFolderPath, getProjectPath } from "@/constants/routes";
import * as docx from "docx-preview";
import { DocxEditor } from "@/components/common/DocxEditor";
import { useChunkedUpload } from "@/hooks/use-chunked-upload";
import { ShareFileModal } from "@/pages/user/projects/components/ShareFileModal";

export const ProjectFileDetail = () => {
  const navigate = useNavigate();
  const { projectId, fileId } = useParams();
  
  const [fileDetail, setFileDetail] = useState<IFileResponse | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const docxContainerRef = useRef<HTMLDivElement>(null);
  const [isRenderingDocx, setIsRenderingDocx] = useState(false);
  const [docxError, setDocxError] = useState<string | null>(null);

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { uploadFile } = useChunkedUpload();

  useEffect(() => {
    if (!projectId || !fileId) return;

    let mounted = true;
    const loadFile = async () => {
      setIsLoading(true);
      try {
        const file = await getFileByIdApi(fileId);
        if (mounted) setFileDetail(file);

        let parsedExtraInfo: { objectName?: string; bucket?: string } | null = null;
        if (typeof file.extraInfo === 'string') {
          try {
            parsedExtraInfo = JSON.parse(file.extraInfo);
          } catch (e) {
            console.error("Failed to parse extraInfo string", e);
          }
        } else if (file.extraInfo && typeof file.extraInfo === 'object') {
          parsedExtraInfo = file.extraInfo as { objectName?: string; bucket?: string };
        }

        if (parsedExtraInfo?.objectName) {
          try {
            const url = await getPresignedUrl(parsedExtraInfo.objectName, parsedExtraInfo.bucket, 60);
            if (mounted) setFileUrl(url);
          } catch (urlError) {
            console.error("Failed to get presigned URL", urlError);
            if (mounted) toast.error("Failed to generate storage link.");
          }
        } else {
          console.warn("Missing objectName in extraInfo", file.extraInfo);
          if (mounted) toast.error("Storage information is missing for this file.");
        }
      } catch (error) {
        console.error("Failed to load file details API", error);
        if (mounted) {
          toast.error("Failed to load file details");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadFile();
    return () => {
      mounted = false;
    };
  }, [projectId, fileId]);

  const isWord = fileDetail ? /\.(doc|docx)$/i.test(fileDetail.nameFile) : false;

  // Render docx when URL is available
  useEffect(() => {
    if (!fileUrl || !isWord || !docxContainerRef.current || isEditingMode) return;

    let mounted = true;
    const renderDocx = async () => {
      setIsRenderingDocx(true);
      setDocxError(null);
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to download document");
        const blob = await response.blob();
        
        if (mounted && docxContainerRef.current) {
          await docx.renderAsync(blob, docxContainerRef.current, docxContainerRef.current, {
            className: "docx-viewer-custom",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            useBase64URL: true,
          });
        }
      } catch (err) {
        if (mounted) {
          console.error("Error rendering docx:", err);
          setDocxError("Trình duyệt không hỗ trợ xem trực tiếp file Word này do định dạng phức tạp. Bạn vui lòng tải về để xem.");
        }
      } finally {
        if (mounted) setIsRenderingDocx(false);
      }
    };

    void renderDocx();

    return () => {
      mounted = false;
    };
  }, [fileUrl, isWord, isEditingMode]);

  if (!projectId || !fileId) {
    return null;
  }

  const handleBack = () => {
    if (fileDetail?.folderId) {
      navigate(getProjectFolderPath(projectId, fileDetail.folderId));
    } else {
      navigate(getProjectPath(projectId));
    }
  };

  const handleSaveNewDocx = async (blob: Blob, newFileName: string) => {
    if (!fileDetail) return;
    
    try {
      const file = new File([blob], newFileName, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      
      const response = await uploadFile(file, {
        tenantId: fileDetail.tenantId,
        folderId: fileDetail.folderId,
        ownerId: fileDetail.ownerId,
      });
      
      if (response) {
        toast.success("Đã upload file mới. Hệ thống đang xử lý...");
        setIsEditingMode(false);
        // Delay navigation to give RabbitMQ time to assemble and save the file to DB
        setTimeout(() => {
          navigate(getProjectFolderPath(projectId, fileDetail.folderId));
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to upload new docx", err);
      toast.error("Lỗi khi upload file mới. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-border bg-card">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-sm">Loading file preview...</span>
        </div>
      </div>
    );
  }

  if (!fileDetail) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-border bg-card">
        <div className="text-sm text-slate-500 dark:text-slate-400">File not found</div>
      </div>
    );
  }

  const isPdf = fileDetail.nameFile.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileDetail.nameFile);
  
  const canPreview = isPdf || isImage;

  return (
    <div className="file-shell flex h-[calc(100vh-6rem)] flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {fileDetail.nameFile}
              {isEditingMode && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Editing</span>}
            </h1>
            <p className="text-xs text-muted-foreground">
              {(fileDetail.sizeFile).toFixed(2)} MB • Uploaded on {new Date(fileDetail.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isWord && !isEditingMode && fileUrl && (
            <button
              onClick={() => setIsEditingMode(true)}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-white border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </button>
          )}

          {fileUrl && !isEditingMode && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-white border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" />
              Chia sẻ
            </button>
          )}

          {fileUrl && !isEditingMode && (
            <a
              href={fileUrl}
              download={fileDetail.nameFile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Tải xuống
            </a>
          )}
        </div>
      </div>

      {/* Preview/Edit Area */}
      <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        {!fileUrl ? (
          <div className="flex flex-col h-full items-center justify-center p-6 text-center text-slate-500">
            <p className="mb-4 text-lg">File is currently processing or storage link is unavailable. Please try again later.</p>
            <div className="mt-8 text-left bg-slate-100 p-4 rounded-md text-xs w-full max-w-2xl overflow-auto border border-slate-200">
              <p className="font-semibold text-slate-700 mb-2">Debug Info (For Development):</p>
              <p><strong>File ID:</strong> {fileDetail.id}</p>
              <p><strong>extraInfo type:</strong> {typeof fileDetail.extraInfo}</p>
              <p><strong>extraInfo content:</strong> {JSON.stringify(fileDetail.extraInfo, null, 2)}</p>
              <p><strong>If you are seeing this immediately after uploading:</strong> The file might still be assembling in the background via RabbitMQ.</p>
            </div>
          </div>
        ) : isEditingMode ? (
          <DocxEditor
            fileUrl={fileUrl}
            fileName={fileDetail.nameFile}
            onSave={handleSaveNewDocx}
            onCancel={() => setIsEditingMode(false)}
          />
        ) : isWord ? (
          <div className="relative h-full w-full overflow-auto bg-slate-200/50 p-4">
            {isRenderingDocx && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600 dark:text-slate-400" />
                <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">Đang tải và hiển thị file Word...</span>
              </div>
            )}
            
            {docxError ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <FileWarning className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">Không thể hiển thị bản xem trước</h3>
                <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">{docxError}</p>
                <a
                  href={fileUrl}
                  download={fileDetail.nameFile}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Tải xuống để xem
                </a>
              </div>
            ) : (
              <div ref={docxContainerRef} className="mx-auto max-w-[850px] min-h-[1056px] bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" />
            )}
          </div>
        ) : canPreview ? (
          <iframe
            src={fileUrl}
            className="h-full w-full border-0"
            title={fileDetail.nameFile}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-slate-900">
              No Preview Available
            </h3>
            <p className="mb-6 max-w-sm text-sm text-slate-500">
              This file type ({fileDetail.nameFile.split('.').pop()?.toUpperCase()}) cannot be previewed directly in the browser. 
            </p>
            <a
              href={fileUrl}
              download={fileDetail.nameFile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              Download File to View
            </a>
          </div>
        )}
      </div>

      <ShareFileModal
        fileId={fileId || ""}
        fileName={fileDetail.nameFile}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
