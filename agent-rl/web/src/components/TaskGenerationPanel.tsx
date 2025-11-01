"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface Task {
  id: string
  name: string
  type: string
  status: string
  created_at: string
}

interface GenerationStatus {
  status: 'idle' | 'running' | 'completed' | 'failed'
  progress: number
  tasks_generated: number
  total_tasks: number
  tasks: Task[]
}

interface TaskGenerationPanelProps {
  onGenerate: () => void
  onContinue: () => void
  scenarioSubmitted: boolean
}

export function TaskGenerationPanel({ onGenerate, onContinue, scenarioSubmitted }: TaskGenerationPanelProps) {
  const [status, setStatus] = useState<GenerationStatus>({
    status: 'idle',
    progress: 0,
    tasks_generated: 0,
    total_tasks: 50,
    tasks: []
  })
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (polling) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/api/generation-status')
          const data = await response.json()
          setStatus(data)

          if (data.status === 'completed' || data.status === 'failed') {
            setPolling(false)
          }
        } catch (error) {
          console.error('Failed to fetch status:', error)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [polling])

  const handleGenerate = async () => {
    try {
      await onGenerate()
      setPolling(true)
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  const handleDownload = () => {
    // Mock download - create a blob with sample data
    const sampleData = {
      generated_tasks: status.generated_tasks,
      total: status.tasks_generated,
      timestamp: new Date().toISOString(),
      tasks: status.tasks
    }
    
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated_tasks_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          Generate Training Data
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Start the multi-agent data generation pipeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <Button
          onClick={handleGenerate}
          disabled={!scenarioSubmitted || status.status === 'running'}
          className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {status.status === 'running' ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span> Generating...
            </span>
          ) : status.status === 'completed' ? (
            <span className="flex items-center gap-2">
              <span>✓</span> Generation Completed
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>⚡</span> Start Generation
            </span>
          )}
        </Button>

        {status.status !== 'idle' && (
          <div className="space-y-4">
            {/* Progress Section */}
            <div className="border border-gray-200 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Progress</span>
                <span className="font-medium text-gray-900">{status.progress}%</span>
              </div>

              {status.status === 'running' && (
                <Progress value={status.progress} className="w-full h-1" />
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Tasks Generated</span>
                <span className="font-medium">{status.tasks_generated} / {status.total_tasks}</span>
              </div>
            </div>

            {/* Recently Generated Tasks */}
            {status.tasks.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 max-h-52 overflow-y-auto">
                <h4 className="text-sm font-medium mb-3 text-gray-700">
                  Recent Tasks
                </h4>
                <div className="space-y-2">
                  {status.tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="bg-gray-50 p-3 rounded-md text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{task.name}</span>
                        <span className="text-xs text-gray-500">{task.type}</span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{task.id}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Message */}
            {status.status === 'completed' && (
              <div className="space-y-3">
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                  Generated {status.tasks_generated} training tasks successfully
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-lg transition-all duration-200 text-sm transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-2">
                      <span>⬇️</span> Download Tasks
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
    </Card>
  )
}
