"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Terminal, Database } from "lucide-react"
import { formatNumber, formatCurrency } from "@/lib/utils"

interface PreviewData {
  rowCount: number
  totalRequests: number
  totalTokens: number
  totalCost: number
  mostUsedModel: string
  topModels: { model: string; tokens: number; requests: number; cost: number }[]
}

export function UploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [xHandle, setXHandle] = useState("")
  const [showExtendedStats, setShowExtendedStats] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ displayName: string; slug: string } | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      handleFileSelect(droppedFile)
    } else {
      setError("ERROR: Invalid file format. Expected *.csv")
    }
  }, [])

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setPreview(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/upload", {
        method: "PUT",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to parse CSV")
        setFile(null)
      } else {
        setPreview(data.preview)
      }
    } catch {
      setError("Failed to parse CSV file")
      setFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !displayName.trim()) {
      setError("ERROR: Missing required fields (file, displayName)")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("displayName", displayName.trim())
      formData.append("visibility", showExtendedStats ? "public_extended" : "public_minimal")
      formData.append("sourceTool", "cursor")
      if (xHandle.trim()) {
        formData.append("xHandle", xHandle.trim())
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Upload failed")
      } else {
        setSuccess({
          displayName: data.user.displayName,
          slug: data.user.slug,
        })
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-primary/30 glow-box">
        <CardContent className="pt-8">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <CheckCircle2 className="h-20 w-20 text-primary mx-auto glow" />
            </div>
            <div className="space-y-2">
              <p className="text-primary font-mono text-sm">[SUCCESS]</p>
              <h2 className="text-2xl font-bold">Upload Complete</h2>
              <p className="text-muted-foreground font-mono">
                User @{success.displayName} added to database
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/")} className="glow-box">
                {">"} View Leaderboard
              </Button>
              <Button variant="outline" onClick={() => router.push(`/u/${success.slug}`)} className="border-primary/30">
                {">"} View Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="text-primary">$</span> ./upload_stats
          </CardTitle>
          <CardDescription className="font-mono text-sm">
            {"// Upload your Cursor usage CSV to join the matrix"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer
              ${isDragging ? "border-primary bg-primary/10 glow-border" : "border-primary/30"}
              ${file ? "bg-primary/5" : "hover:border-primary/60 hover:bg-primary/5"}
            `}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0]
                if (selectedFile) handleFileSelect(selectedFile)
              }}
            />
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-sm text-primary font-mono">Parsing CSV data...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-3">
                <FileText className="h-12 w-12 text-primary glow" />
                <p className="font-mono text-primary">{file.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{"// Click or drag to replace"}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="font-mono text-foreground">Drop your *.csv file here</p>
                <p className="text-sm text-muted-foreground font-mono">{"// or click to browse"}</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary font-mono text-sm">
                <Database className="h-4 w-4" />
                DATA_PREVIEW
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-mono text-xs">rows</p>
                  <p className="font-bold text-accent text-lg">{formatNumber(preview.rowCount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono text-xs">requests</p>
                  <p className="font-bold text-accent text-lg">{formatNumber(preview.totalRequests)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono text-xs">tokens</p>
                  <p className="font-bold text-accent text-lg">{formatNumber(preview.totalTokens)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-mono text-xs">cost_usd</p>
                  <p className="font-bold text-accent text-lg">{formatCurrency(preview.totalCost)}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground font-mono text-xs mb-2">top_models[]</p>
                <div className="space-y-1">
                  {preview.topModels.slice(0, 3).map((m, i) => (
                    <div key={m.model} className="flex justify-between text-sm font-mono">
                      <span className="text-primary">[{i}] {m.model}</span>
                      <span className="text-muted-foreground">{formatNumber(m.tokens)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="font-mono text-sm">
              --username=
            </Label>
            <Input
              id="displayName"
              placeholder="enter_your_handle"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="font-mono bg-background/50 border-primary/20 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground font-mono">
              {"// This is how you'll appear on the leaderboard"}
            </p>
          </div>

          {/* X Handle (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="xHandle" className="font-mono text-sm">
              --twitter= <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="xHandle"
              placeholder="@your_x_handle"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              maxLength={50}
              className="font-mono bg-background/50 border-primary/20 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground font-mono">
              {"// Link your X account to your profile"}
            </p>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="extendedStats"
              checked={showExtendedStats}
              onChange={(e) => setShowExtendedStats(e.target.checked)}
              className="rounded border-primary/30 bg-background text-primary focus:ring-primary"
            />
            <Label htmlFor="extendedStats" className="text-sm font-mono text-muted-foreground">
              --public-extended (show tokens, cost publicly)
            </Label>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm font-mono bg-destructive/10 p-3 rounded border border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full glow-box font-mono"
            disabled={!file || !displayName.trim() || isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading to database...
              </>
            ) : (
              "$ submit --confirm"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
