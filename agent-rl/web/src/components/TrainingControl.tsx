"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface TrainingMetrics {
  epoch: number
  loss: number
  reward: number
  test_pass_rate: number
}

interface TrainingStatus {
  status: 'idle' | 'running' | 'completed' | 'failed'
  progress: number
  metrics: TrainingMetrics
}

interface TrainingConfig {
  learning_rate: number
  batch_size: number
  num_epochs: number
  use_wandb: boolean
}

interface TrainingControlProps {
  onStartTraining: (config: TrainingConfig) => void
  generationCompleted: boolean
}

export function TrainingControl({ onStartTraining, generationCompleted }: TrainingControlProps) {
  const [status, setStatus] = useState<TrainingStatus>({
    status: 'idle',
    progress: 0,
    metrics: {
      epoch: 0,
      loss: 0,
      reward: 0,
      test_pass_rate: 0
    }
  })
  const [polling, setPolling] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<TrainingConfig>({
    learning_rate: 3e-4,
    batch_size: 32,
    num_epochs: 10,
    use_wandb: false
  })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (polling) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/api/training-status')
          const data = await response.json()
          setStatus(data)

          if (data.status === 'completed' || data.status === 'failed') {
            setPolling(false)
          }
        } catch (error) {
          console.error('Failed to fetch training status:', error)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [polling])

  const handleStartTraining = () => {
    window.open('https://www.hyperbolic.ai/', '_blank')
  }

  return (
    <Card className="w-full border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">🚀</span>
          Start Training
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Launch RL training with generated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Configuration Panel */}
        {showConfig && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-sm text-gray-900">Configuration</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={config.learning_rate}
                  onChange={(e) => setConfig({ ...config, learning_rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">Batch Size</label>
                <input
                  type="number"
                  value={config.batch_size}
                  onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="block text-xs font-medium text-gray-700">Epochs</label>
                <input
                  type="number"
                  value={config.num_epochs}
                  onChange={(e) => setConfig({ ...config, num_epochs: parseInt(e.target.value) })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wandb"
                checked={config.use_wandb}
                onChange={(e) => setConfig({ ...config, use_wandb: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="wandb" className="text-xs text-gray-700">
                Enable Weights & Biases
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleStartTraining}
            disabled={!generationCompleted || status.status === 'running'}
            className="flex-1 h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {status.status === 'running' ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">🚀</span> Training...
              </span>
            ) : status.status === 'completed' ? (
              <span className="flex items-center gap-2">
                <span>🎉</span> Training Completed
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🚀</span> Start Training
              </span>
            )}
          </Button>
          <Button
            onClick={() => setShowConfig(!showConfig)}
            disabled={status.status === 'running'}
            variant="outline"
            className="h-12 px-5 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 text-sm font-semibold transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {showConfig ? '✕' : '⚙️'}
          </Button>
        </div>

        {/* Training Progress */}
        {status.status !== 'idle' && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="border border-gray-200 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Training Progress</span>
                <span className="font-medium text-gray-900">{status.progress}%</span>
              </div>

              {status.status === 'running' && (
                <Progress value={status.progress} className="w-full h-1" />
              )}
            </div>

            {/* Metrics Grid */}
            {status.metrics.epoch > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Epoch</div>
                  <div className="text-2xl font-semibold text-gray-900">{status.metrics.epoch}</div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Loss</div>
                  <div className="text-2xl font-semibold text-gray-900">{status.metrics.loss.toFixed(4)}</div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Reward</div>
                  <div className="text-2xl font-semibold text-gray-900">{status.metrics.reward.toFixed(4)}</div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Pass Rate</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {(status.metrics.test_pass_rate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}

            {/* Completion Message */}
            {status.status === 'completed' && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                Training completed successfully
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
