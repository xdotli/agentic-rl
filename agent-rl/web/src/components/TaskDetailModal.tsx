"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Container, Lightbulb, CheckSquare, Settings, Play, Download, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'


interface TaskJson {
  task_name: string
  task_yaml: Record<string, unknown>
  dockerfile: string
  docker_compose: string
  solution_script: string
  run_tests_script: string
  test_file_content: string
}

interface Task {
  id: number
  name: string
  difficulty: string
  category: string
  tags: string[]
  instruction: string
  json_path: string
  task_json?: TaskJson
}

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (task: Task) => void
}


export function TaskDetailModal({ task, open, onOpenChange, onDownload }: TaskDetailModalProps) {
  if (!task) return null

  const taskJson = task.task_json

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <span>{task.name}</span>
            <span className="text-xs px-3 py-1 bg-gray-100 rounded-full font-normal">
              {task.difficulty}
            </span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-600">{task.category}</span>
            {task.tags.map((tag, idx) => (
              <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                {tag}
              </span>
            ))}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-hidden">
          <Tabs defaultValue="instruction" className="flex h-full flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100">
              <TabsTrigger value="instruction" className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instruction</span>
              </TabsTrigger>
              <TabsTrigger value="dockerfile" className="flex items-center gap-1.5">
                <Container className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dockerfile</span>
              </TabsTrigger>
              <TabsTrigger value="solution" className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Solution</span>
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tests</span>
              </TabsTrigger>
              <TabsTrigger value="compose" className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compose</span>
              </TabsTrigger>
              <TabsTrigger value="run" className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Run</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1">
              <TabsContent value="instruction" className="m-0">
                <div className="rounded-lg border border-gray-200 bg-white p-6 prose prose-sm max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
                  prose-pre:bg-gray-900 prose-pre:text-gray-100
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:text-gray-700
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic">
                  <ReactMarkdown>
                    {task.instruction || ""}
                  </ReactMarkdown>
                </div>
              </TabsContent>

              <TabsContent value="dockerfile" className="m-0">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                    {taskJson?.dockerfile || 'Loading...'}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="solution" className="m-0">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                    {taskJson?.solution_script || 'Loading...'}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="tests" className="m-0">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                    {taskJson?.test_file_content || 'Loading...'}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="compose" className="m-0">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                    {taskJson?.docker_compose || 'Loading...'}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="run" className="m-0">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                    {taskJson?.run_tests_script || 'Loading...'}
                  </pre>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={() => onDownload(task)}
            variant="outline"
            className="flex-1"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download JSON
            </span>
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            <span className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Close
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
