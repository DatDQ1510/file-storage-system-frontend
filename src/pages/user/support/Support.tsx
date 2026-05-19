import { useMemo, useState } from "react"
import { LifeBuoy, Mail, MessageSquareWarning, Phone, Search, SendHorizonal } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type TSupportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

type TSupportCategory =
  | "ACCOUNT"
  | "PROJECTS"
  | "UPLOAD_DOWNLOAD"
  | "PERMISSIONS"
  | "BILLING"
  | "BUG_REPORT"
  | "OTHER"

interface IFaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: IFaqItem[] = [
  {
    question: "Tai sao file upload xong nhung refresh khong thay?",
    answer:
      "He thong upload bat dong bo. Sau khi upload, file duoc xu ly o queue. Vui long doi vai giay roi refresh trang hoac mo lai folder.",
  },
  {
    question: "Lam sao khoi phuc file da xoa?",
    answer:
      "Vao Recycle Bin, tim file can khoi phuc va chon Restore. File se quay ve folder cu neu ban con quyen truy cap.",
  },
  {
    question: "Toi khong mo duoc file cua project du da duoc them vao member?",
    answer:
      "Hay kiem tra quyen tren folder/file (READ/WRITE/DELETE). Neu can, lien he owner hoac tenant admin de cap lai ACL.",
  },
]

const initialFormState = {
  title: "",
  category: "OTHER" as TSupportCategory,
  priority: "MEDIUM" as TSupportPriority,
  description: "",
}

export const Support = () => {
  const [searchKeyword, setSearchKeyword] = useState("")
  const [title, setTitle] = useState(initialFormState.title)
  const [category, setCategory] = useState<TSupportCategory>(initialFormState.category)
  const [priority, setPriority] = useState<TSupportPriority>(initialFormState.priority)
  const [description, setDescription] = useState(initialFormState.description)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredFaqItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) {
      return FAQ_ITEMS
    }

    return FAQ_ITEMS.filter((item) => {
      return item.question.toLowerCase().includes(keyword) || item.answer.toLowerCase().includes(keyword)
    })
  }, [searchKeyword])

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please enter title and description")
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 400))

      toast.success("Support request submitted. We will contact you soon.")
      setTitle(initialFormState.title)
      setCategory(initialFormState.category)
      setPriority(initialFormState.priority)
      setDescription(initialFormState.description)
    } catch {
      toast.error("Failed to submit support request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pb-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold text-blue-700">Support</h1>
            <p className="text-sm text-muted-foreground">Need help? Search FAQ or create a support request.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="Search FAQs..."
            className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Support Email</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Mail className="h-4 w-4 text-blue-600" /> support@vaultstorage.app
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hotline</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Phone className="h-4 w-4 text-blue-600" /> +84 1900 1234
          </p>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Response SLA</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquareWarning className="h-4 w-4 text-blue-600" /> 4-24 hours
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3 rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Frequently Asked Questions</h2>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{filteredFaqItems.length} Items</span>
          </div>

          {filteredFaqItems.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
              No FAQ matches your keyword.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqItems.map((item) => (
                <details key={item.question} className="group rounded-md border border-border px-4 py-3 open:border-blue-200">
                  <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Create Support Ticket</h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Short summary of your issue"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-blue-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as TSupportCategory)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-blue-300"
              >
                <option value="ACCOUNT">Account</option>
                <option value="PROJECTS">Projects</option>
                <option value="UPLOAD_DOWNLOAD">Upload/Download</option>
                <option value="PERMISSIONS">Permissions</option>
                <option value="BILLING">Billing</option>
                <option value="BUG_REPORT">Bug report</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TSupportPriority)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-blue-300"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              placeholder="Describe issue, steps, and expected result"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-blue-300"
            />
          </div>

          <Button className="w-full" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            <SendHorizonal className="mr-2 h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </section>
    </div>
  )
}
