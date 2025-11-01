"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TaskDetailModal } from "@/components/TaskDetailModal"
import { Download, Eye, Zap, CheckCircle, Loader2, FileJson } from 'lucide-react'

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

interface TaskGenerationPanelProps {
  onContinue: () => void
  scenarioSubmitted: boolean
  config: { total_tasks: number; parallelism: number }
}

export function TaskGenerationPanel({ onContinue, scenarioSubmitted, config }: TaskGenerationPanelProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle')
  const [progress, setProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleGenerate = useCallback(async () => {
    try {
      setStatus('running')
      setProgress(0)
      setCurrentTask(0)
      setTasks([])
      setLogs([])

      // Use new SSE streaming endpoint with user config
      const response = await fetch('http://localhost:8000/api/generate-tasks-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          num_tasks: config.total_tasks, 
          parallelism: config.parallelism,
          model: 'gpt-5' 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start generation')
      }

      // Read streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let buffer = ''

      // Process streaming data
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        // Decode chunk and append to buffer
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              // Handle different event types
              switch (data.type) {
                case 'start':
                  setTotalTasks(data.total)
                  setLogs(prev => [...prev, data.message])
                  break
                
                case 'info':
                  setLogs(prev => [...prev, data.message])
                  break
                
                case 'progress':
                  setCurrentTask(data.current)
                  setProgress(Math.round((data.current / data.total) * 100))
                  setLogs(prev => [...prev, data.message])
                  break
                
                case 'success':
                  setTasks(prev => [...prev, data.task])
                  setLogs(prev => [...prev, data.message])
                  break
                
                case 'error':
                  setLogs(prev => [...prev, `❌ ${data.message}`])
                  break
                
                case 'complete':
                  setStatus('completed')
                  setProgress(100)
                  setLogs(prev => [...prev, data.message])
                  break
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }

    } catch (error) {
      console.error('Generation failed:', error)
      setStatus('failed')
      setLogs(prev => [...prev, `❌ Error: ${error}`])
    }
  }, [config])

  const handleDownloadAll = () => {
    // Download as JSONL (one JSON object per line)
    const jsonl = tasks.map(task => JSON.stringify(task.task_json || task)).join('\n')
    const blob = new Blob([jsonl], { type: 'application/jsonl' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated_tasks_${Date.now()}.jsonl`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadTask = (task: Task) => {
    const blob = new Blob([JSON.stringify(task.task_json || task, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${task.name}_${task.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setModalOpen(true)
  }

  return (
    <Card className="w-full border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          Generate Training Data
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Real-time task generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <Button
          onClick={handleGenerate}
          disabled={!scenarioSubmitted || status === 'running'}
          className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {status === 'running' ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating... ({currentTask}/{totalTasks})
            </span>
          ) : status === 'completed' ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Generation Completed
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Start Generation
            </span>
          )}
        </Button>

        {status !== 'idle' && (
          <div className="space-y-4">
            {/* Progress Section */}
            <div className="border border-gray-200 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Progress</span>
                <span className="font-medium text-gray-900">{progress}%</span>
              </div>

              {status === 'running' && (
                <Progress value={progress} className="w-full h-1" />
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Tasks Generated</span>
                <span className="font-medium">{currentTask} / {totalTasks}</span>
              </div>
            </div>

            {/* Real-time Logs */}
            {logs.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                <h4 className="text-sm font-medium mb-2 text-gray-700">
                  📋 Live Logs
                </h4>
                <div className="space-y-1 text-xs font-mono">
                  {logs.slice(-10).map((log, idx) => (
                    <div key={idx} className="text-gray-600">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Tasks List */}
            {tasks.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium mb-3 text-gray-700">
                  Generated Tasks ({tasks.length})
                </h4>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="bg-white rounded-md text-sm border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => handleViewTask(task)}
                            className="flex-1 min-w-0 text-left hover:bg-gray-50 -m-3 p-3 rounded transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">{task.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded flex-shrink-0">{task.difficulty}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1">{task.category}</div>
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.tags.slice(0, 4).map((tag, idx) => (
                                  <span key={idx} className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {task.tags.length > 4 && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    +{task.tags.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadTask(task)
                              }}
                              className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
                              title="Download as JSON"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleViewTask(task)}
                              className="px-2 py-1.5 text-xs bg-black hover:bg-gray-800 text-white rounded transition-colors flex items-center gap-1"
                              title="View Details"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Actions */}
            {status === 'completed' && (
              <div className="space-y-3">
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                  ✅ Generated {tasks.length} training tasks successfully
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadAll}
                    variant="outline"
                    className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-lg transition-all duration-200 text-sm transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-2">
                      <FileJson className="w-4 h-4" />
                      Download All (JSONL)
                    </span>
                  </Button>
                  
                  <Button
                    onClick={onContinue}
                    className="flex-1 h-11 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 text-sm shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-2">
                      Continue to Training <span>→</span>
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDownload={handleDownloadTask}
      />
    </Card>
  )
}
