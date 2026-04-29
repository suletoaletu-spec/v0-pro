
"use client"

import { useState, useRef, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Clapperboard,
  Sparkles,
  Settings,
  Save,
  FolderOpen,
  Plus,
  Layers,
  GripVertical,
  Trash2,
  Upload,
  Mic,
  Film,
  Clock,
  Image as ImageIcon,
  Video,
  Volume2,
  Loader2,
  Square,
  Play,
  Pause,
  Maximize2,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

type MediaType = "ai" | "upload"
type VoiceProfile = "studio-narrator" | "cinematic-male" | "crystal-female" | "warm-friendly" | "dramatic-intense"

interface Scene {
  id: string
  type: MediaType
  visualPrompt: string
  localFileUrl: string | null
  localFileName: string | null
  scriptText: string
  selectedVoice: VoiceProfile
  duration: number
  title: string
}

interface RenderStage {
  message: string
  progress: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VOICE_PROFILES: { value: VoiceProfile; label: string; description: string }[] = [
  { value: "studio-narrator", label: "Studio Narrator", description: "Commanding, cinematic voice" },
  { value: "cinematic-male", label: "Cinematic Male", description: "Rich, authoritative tone" },
  { value: "crystal-female", label: "Crystal Female", description: "Clear, professional articulation" },
  { value: "warm-friendly", label: "Warm Friendly", description: "Approachable, conversational" },
  { value: "dramatic-intense", label: "Dramatic Intense", description: "High emotion, theatrical" },
]

const RENDER_STAGES = [
  { stage: "Generating Clear Audio", threshold: 0 },
  { stage: "Synthesizing Visuals", threshold: 33 },
  { stage: "Final Composition", threshold: 66 },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `scene-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function createNewScene(index: number): Scene {
  return {
    id: generateId(),
    type: "ai",
    visualPrompt: "",
    localFileUrl: null,
    localFileName: null,
    scriptText: "",
    selectedVoice: "studio-narrator",
    duration: 5,
    title: `Scene ${index + 1}`,
  }
}

// ============================================================================
// SCENE CARD COMPONENT
// ============================================================================

interface SceneCardProps {
  scene: Scene
  index: number
  onUpdate: (id: string, updates: Partial<Scene>) => void
  onDelete: (id: string) => void
}

function SceneCard({ scene, index, onUpdate, onDelete }: SceneCardProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleMediaTypeChange = (value: string) => {
    onUpdate(scene.id, { type: value as MediaType })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onUpdate(scene.id, { localFileUrl: url, localFileName: file.name })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      const url = URL.createObjectURL(file)
      onUpdate(scene.id, { localFileUrl: url, localFileName: file.name })
    }
  }

  const stopPreview = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const playPreview = async () => {
    if (!scene.scriptText.trim()) return

    if (isPlaying) {
      stopPreview()
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scene.scriptText, voiceProfile: scene.selectedVoice }),
      })

      const data = await response.json()

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(data.text)
        utterance.pitch = data.settings?.pitch || 1
        utterance.rate = data.settings?.rate || 1
        utterance.volume = 1

        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0]
        if (preferredVoice) utterance.voice = preferredVoice

        utterance.onstart = () => {
          setIsLoading(false)
          setIsPlaying(true)
        }
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => {
          setIsLoading(false)
          setIsPlaying(false)
        }

        window.speechSynthesis.speak(utterance)
      }
    } catch {
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-200",
        isDragging && "scale-[1.02] opacity-50 shadow-xl shadow-primary/20",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-5" />
        </button>

        <div className="flex flex-1 items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Film className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{scene.title}</span>
            <span className="text-xs text-muted-foreground">
              {scene.type === "ai" ? "AI Generated" : "Local Media"} &bull; {scene.duration}s
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(scene.id)}
          className="size-8 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Media Type Tabs */}
        <Tabs value={scene.type} onValueChange={handleMediaTypeChange} className="w-full">
          <TabsList className="w-full bg-secondary/50">
            <TabsTrigger
              value="ai"
              className="flex-1 gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Sparkles className="size-4" />
              AI Generated
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="flex-1 gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Upload className="size-4" />
              Local Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-3 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Visual Prompt</Label>
              <Textarea
                placeholder="Describe the visual scene you want to generate..."
                value={scene.visualPrompt}
                onChange={(e) => onUpdate(scene.id, { visualPrompt: e.target.value })}
                className="min-h-[80px] resize-none border-border/50 bg-input/50 text-sm placeholder:text-muted-foreground/50 focus:border-primary/50"
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-3">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragActive(true)
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
              )}
            >
              {scene.localFileUrl ? (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  {scene.localFileName?.includes("video") ? (
                    <Video className="size-5 text-primary" />
                  ) : (
                    <ImageIcon className="size-5 text-primary" />
                  )}
                  <span className="max-w-[200px] truncate">{scene.localFileName}</span>
                </div>
              ) : (
                <>
                  <Upload className="size-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Drag & drop or click to upload</span>
                  <span className="text-xs text-muted-foreground/70">Supports images and videos</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </TabsContent>
        </Tabs>

        {/* Dialogue & Script Section */}
        <div className="space-y-3 rounded-lg border border-border/30 bg-secondary/20 p-3">
          <div className="flex items-center gap-2">
            <Mic className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Dialogue & Script
            </span>
          </div>

          <Textarea
            placeholder="Enter the dialogue or narration for this scene..."
            value={scene.scriptText}
            onChange={(e) => onUpdate(scene.id, { scriptText: e.target.value })}
            className="min-h-[100px] resize-none border-border/50 bg-input/50 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/50"
          />

          <button
            onClick={playPreview}
            disabled={!scene.scriptText.trim() || isLoading}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              scene.scriptText.trim()
                ? "text-primary hover:text-primary/80"
                : "cursor-not-allowed text-muted-foreground/50",
              isPlaying && "text-destructive hover:text-destructive/80"
            )}
          >
            {isLoading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : isPlaying ? (
              <Square className="size-3" />
            ) : (
              <Volume2 className="size-3" />
            )}
            {isLoading ? "Loading..." : isPlaying ? "Stop Preview" : "Preview Clear Voice"}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Voice Profile</Label>
              <Select
                value={scene.selectedVoice}
                onValueChange={(value) => onUpdate(scene.id, { selectedVoice: value as VoiceProfile })}
              >
                <SelectTrigger className="w-full border-border/50 bg-input/50">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_PROFILES.map((profile) => (
                    <SelectItem key={profile.value} value={profile.value}>
                      <div className="flex flex-col">
                        <span>{profile.label}</span>
                        <span className="text-xs text-muted-foreground">{profile.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Clock className="size-3" />
                  {scene.duration}s
                </span>
              </div>
              <Slider
                value={[scene.duration]}
                onValueChange={([value]) => onUpdate(scene.id, { duration: value })}
                min={1}
                max={30}
                step={1}
                className="py-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// PREVIEW PLAYER COMPONENT
// ============================================================================

interface PreviewPlayerProps {
  scenes: Scene[]
  isRendering: boolean
  renderStage: RenderStage | null
}

function PreviewPlayer({ scenes, isRendering, renderStage }: PreviewPlayerProps) {
  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0)

  return (
    <Card className="flex h-full flex-col border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Film className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Preview Player</span>
            <span className="text-xs text-muted-foreground">
              {scenes.length} scenes &bull; {totalDuration}s total
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
          <Maximize2 className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        {/* Video Preview Area */}
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black/60 ring-1 ring-border/30">
          {isRendering ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="size-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="size-6 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{renderStage?.message}</p>
                <p className="text-xs text-muted-foreground">{renderStage?.progress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30 transition-all hover:bg-primary/30 hover:ring-primary/50">
                <Play className="size-6 translate-x-0.5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Preview your masterpiece</p>
            </div>
          )}

          {/* Cinematic bars */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Playback Controls */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Slider defaultValue={[0]} max={100} step={1} disabled={isRendering} className="cursor-pointer" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>00:00</span>
              <span>
                {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-9" disabled={isRendering}>
                <Play className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-9" disabled>
                <Pause className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="size-4 text-muted-foreground" />
              <Slider defaultValue={[75]} max={100} step={1} className="w-20" />
            </div>

            <Button variant="ghost" size="icon" className="size-9" disabled={isRendering}>
              <Download className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scene Timeline Thumbnails */}
        <div className="mt-auto space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Scene Timeline</span>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                className="group relative flex-shrink-0 cursor-pointer"
                style={{ width: `${Math.max((scene.duration / totalDuration) * 100, 10)}%`, minWidth: 40 }}
              >
                <div className="h-10 rounded bg-secondary/50 ring-1 ring-border/30 transition-all group-hover:ring-primary/50">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">S{index + 1}</span>
                  </div>
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {scene.duration}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MASTER CONTROLLER COMPONENT
// ============================================================================

interface MasterControllerProps {
  scenes: Scene[]
  isRendering: boolean
  renderStage: RenderStage | null
  onStartRender: () => void
}

function MasterController({ scenes, isRendering, renderStage, onStartRender }: MasterControllerProps) {
  const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0)

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 ring-2 ring-primary/30">
            <Clapperboard className="size-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground">Studio Nexus</h1>
            <p className="text-xs text-muted-foreground">AI Movie Studio</p>
          </div>
        </div>

        {/* Project Stats */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-foreground">{scenes.length}</span>
            <span className="text-xs text-muted-foreground">Scenes</span>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-foreground">{totalDuration}s</span>
            <span className="text-xs text-muted-foreground">Duration</span>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-primary">4K</span>
            <span className="text-xs text-muted-foreground">Quality</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden size-9 md:flex">
            <FolderOpen className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden size-9 md:flex">
            <Save className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden size-9 md:flex">
            <Settings className="size-4" />
          </Button>
          <div className="mx-2 hidden h-8 w-px bg-border/50 md:block" />
          <Button
            onClick={onStartRender}
            disabled={isRendering || scenes.length === 0}
            className={cn(
              "gap-2 bg-primary px-6 text-primary-foreground transition-all hover:bg-primary/90",
              isRendering && "animate-pulse"
            )}
          >
            <Sparkles className="size-4" />
            {isRendering ? "Rendering..." : "Render Masterpiece"}
          </Button>
        </div>
      </div>

      {/* Render Progress Bar */}
      {isRendering && renderStage && (
        <div className="border-t border-border/30 bg-secondary/30 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{renderStage.message}</span>
                <span className="text-sm text-primary">{renderStage.progress}%</span>
              </div>
              <Progress value={renderStage.progress} className="h-2" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {RENDER_STAGES.map(({ stage, threshold }, index) => {
              const isActive = renderStage.progress >= threshold
              const isCurrent =
                renderStage.progress >= threshold &&
                (index === RENDER_STAGES.length - 1 || renderStage.progress < RENDER_STAGES[index + 1].threshold)

              return (
                <div
                  key={stage}
                  className={cn(
                    "flex-1 rounded-full px-3 py-1 text-center text-xs font-medium transition-all",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/30 text-primary"
                        : "bg-secondary/50 text-muted-foreground"
                  )}
                >
                  {stage}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}

// ============================================================================
// SCENE TIMELINE COMPONENT
// ============================================================================

interface SceneTimelineProps {
  scenes: Scene[]
  onAddScene: () => void
  onUpdateScene: (id: string, updates: Partial<Scene>) => void
  onDeleteScene: (id: string) => void
  onReorderScenes: (activeId: string, overId: string) => void
}

function SceneTimeline({
  scenes,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onReorderScenes,
}: SceneTimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorderScenes(active.id as string, over.id as string)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Layers className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Scene Timeline</span>
            <span className="text-xs text-muted-foreground">Drag to reorder</span>
          </div>
        </div>
        <Button
          onClick={onAddScene}
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
        >
          <Plus className="size-4" />
          Add Scene
        </Button>
      </div>

      {/* Scene List */}
      <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-2">
        {scenes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border/50 bg-secondary/20 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Layers className="size-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">No scenes yet</h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                Start building your masterpiece by adding your first scene
              </p>
            </div>
            <Button onClick={onAddScene} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" />
              Create First Scene
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {scenes.map((scene, index) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  index={index}
                  onUpdate={onUpdateScene}
                  onDelete={onDeleteScene}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer Stats */}
      {scenes.length > 0 && (
        <div className="flex items-center justify-between border-t border-border/30 pt-4">
          <span className="text-xs text-muted-foreground">
            {scenes.length} scene{scenes.length !== 1 ? "s" : ""} &bull;{" "}
            {scenes.reduce((acc, s) => acc + s.duration, 0)}s total
          </span>
          <Button
            onClick={onAddScene}
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <Plus className="size-3" />
            Add Scene
          </Button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function StudioNexusPage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [isRendering, setIsRendering] = useState(false)
  const [renderStage, setRenderStage] = useState<RenderStage | null>(null)

  const addScene = useCallback(() => {
    setScenes((prev) => [...prev, createNewScene(prev.length)])
  }, [])

  const updateScene = useCallback((id: string, updates: Partial<Scene>) => {
    setScenes((prev) => prev.map((scene) => (scene.id === id ? { ...scene, ...updates } : scene)))
  }, [])

  const deleteScene = useCallback((id: string) => {
    setScenes((prev) => prev.filter((scene) => scene.id !== id))
  }, [])

  const reorderScenes = useCallback((activeId: string, overId: string) => {
    setScenes((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === activeId)
      const newIndex = prev.findIndex((s) => s.id === overId)
      const newScenes = [...prev]
      const [removed] = newScenes.splice(oldIndex, 1)
      newScenes.splice(newIndex, 0, removed)
      return newScenes
    })
  }, [])

  const startRender = useCallback(() => {
    if (scenes.length === 0) return

    setIsRendering(true)
    setRenderStage({ message: "Generating Clear Audio...", progress: 0 })

    const stages = [
      { message: "Generating Clear Audio...", duration: 2000 },
      { message: "Synthesizing Visuals...", duration: 3000 },
      { message: "Final Composition...", duration: 2000 },
    ]

    let currentStage = 0
    let progress = 0

    const interval = setInterval(() => {
      progress += 2

      if (progress >= 100) {
        clearInterval(interval)
        setIsRendering(false)
        setRenderStage(null)
        return
      }

      if (progress >= 33 && currentStage === 0) currentStage = 1
      if (progress >= 66 && currentStage === 1) currentStage = 2

      setRenderStage({
        message: stages[currentStage].message,
        progress,
      })
    }, 100)
  }, [scenes.length])

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background">
      <MasterController
        scenes={scenes}
        isRendering={isRendering}
        renderStage={renderStage}
        onStartRender={startRender}
      />

      <main className="grid flex-1 grid-cols-1 gap-6 overflow-hidden p-6 lg:grid-cols-[1fr_400px]">
        {/* Scene Timeline - Top on mobile, Left on desktop */}
        <div className="min-h-0 min-w-0 overflow-y-auto">
          <SceneTimeline
            scenes={scenes}
            onAddScene={addScene}
            onUpdateScene={updateScene}
            onDeleteScene={deleteScene}
            onReorderScenes={reorderScenes}
          />
        </div>

        {/* Preview Player - Bottom on mobile, Right on desktop (fixed 400px width) */}
        <div className="min-h-0 min-w-0 lg:w-[400px]">
          <PreviewPlayer scenes={scenes} isRendering={isRendering} renderStage={renderStage} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-secondary/20 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Studio Nexus v1.0 &bull; AI Movie Studio</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="size-2 animate-pulse rounded-full bg-green-500" />
              AI Engine Online
            </span>
            <span>4K Export Ready</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
