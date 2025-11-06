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
  preset: 'test' | 'single_8_gpu' | 'multi_node_16' | 'multi_node_32'
  max_seq_length: number
  n_rollouts: number
}

interface TrainingControlProps {
  onStartTraining: (config: TrainingConfig) => void
  generationCompleted: boolean
}

type ConfigPreset = {
  name: string
  description: string
  learning_rate: number
  n_rollouts: number
  gpus: string
  recommended: boolean
}

const TRAINING_PRESETS: Record<string, ConfigPreset> = {
  test: {
    name: 'Test Run',
    description: 'Quick validation with minimal resources',
    learning_rate: 1e-5,
    n_rollouts: 4,
    gpus: '1x GPU',
    recommended: false
  },
  single_8_gpu: {
    name: 'Production (8x GPU)',
    description: 'Single node training with 8 GPUs',
    learning_rate: 1e-6,
    n_rollouts: 16,
    gpus: '8x H100',
    recommended: true
  },
  multi_node_16: {
    name: 'Multi-Node (16x GPU)',
    description: 'Distributed training across 2 nodes',
    learning_rate: 1e-6,
    n_rollouts: 24,
    gpus: '2 nodes × 8 H100',
    recommended: false
  },
  multi_node_32: {
    name: 'Full Scale (32x GPU)',
    description: 'Maximum scale distributed training',
    learning_rate: 1e-6,
    n_rollouts: 32,
    gpus: '4 nodes × 8 H100',
    recommended: false
  }
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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof TRAINING_PRESETS>('single_8_gpu')
  const [config, setConfig] = useState<TrainingConfig>({
    learning_rate: 1e-6,
    batch_size: 32,
    num_epochs: 10,
    use_wandb: true,
    preset: 'single_8_gpu',
    max_seq_length: 32768,
    n_rollouts: 16
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

  const handlePresetChange = (preset: keyof typeof TRAINING_PRESETS) => {
    setSelectedPreset(preset)
    const presetConfig = TRAINING_PRESETS[preset]
    setConfig({
      ...config,
      preset: preset as TrainingConfig['preset'],
      learning_rate: presetConfig.learning_rate,
      n_rollouts: presetConfig.n_rollouts
    })
  }

  const handleStartTraining = () => {
    window.open('https://www.hyperbolic.ai/', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Training Method Overview */}
      <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span>🎯</span> Training Method: GRPO with Rejection Sampling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Training Pipeline Visualization */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="flex-1 text-center">
                <div className="bg-blue-100 rounded px-2 py-1.5 mb-1 font-medium">📋 Tasks</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex-1 text-center">
                <div className="bg-purple-100 rounded px-2 py-1.5 mb-1 font-medium">🐳 Docker</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex-1 text-center">
                <div className="bg-green-100 rounded px-2 py-1.5 mb-1 font-medium">🤖 Rollouts</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex-1 text-center">
                <div className="bg-yellow-100 rounded px-2 py-1.5 mb-1 font-medium">🎁 Reward</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex-1 text-center">
                <div className="bg-red-100 rounded px-2 py-1.5 mb-1 font-medium">📈 Update</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="text-[11px] text-gray-500">Max Seq</div>
              <div className="text-xs font-semibold text-gray-900">32K tokens</div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="text-[11px] text-gray-500">Learning Rate</div>
              <div className="text-xs font-semibold text-gray-900">1e-6</div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-2">
              <div className="text-[11px] text-gray-500">Precision</div>
              <div className="text-xs font-semibold text-gray-900">bfloat16</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Design Card */}
      <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-green-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span>🎁</span> Reward Design: Dual-Component Scoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Two Components */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border-2 border-blue-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-blue-900">✅ Answer Verification</div>
                <div className="text-sm font-bold text-blue-700">65%</div>
              </div>
              <ul className="text-[11px] text-gray-600 space-y-1">
                <li>• Python unit tests verify completion</li>
                <li>• Weighted scoring for partial credit</li>
                <li>• Tests run in isolated Docker</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border-2 border-purple-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-purple-900">🤖 LLM-as-a-Judge</div>
                <div className="text-sm font-bold text-purple-700">35%</div>
              </div>
              <ul className="text-[11px] text-gray-600 space-y-1">
                <li>• Claude-4-Sonnet evaluates behavior</li>
                <li>• Scores HOW agent worked</li>
                <li>• Not WHETHER task completed</li>
              </ul>
            </div>
          </div>

          {/* Judge Components */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">🤖 Judge Evaluation Components</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-600">Action Output Success</span>
                <span className="font-semibold text-gray-900">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Todo Usage & Planning</span>
                <span className="font-semibold text-gray-900">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phase Adherence</span>
                <span className="font-semibold text-gray-900">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tool Usage Effectiveness</span>
                <span className="font-semibold text-gray-900">15%</span>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Final Reward</div>
            <div className="font-mono text-sm font-semibold text-gray-900">
              0.65 × Test_Score + 0.35 × Judge_Score
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
        <CardHeader className="space-y-1 border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">🚀</span>
            Training Configuration
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Choose a training preset or customize configuration parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* Preset Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">Training Preset</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(TRAINING_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key as keyof typeof TRAINING_PRESETS)}
                  className={`
                    relative text-left p-3 rounded-lg border-2 transition-all duration-200
                    ${selectedPreset === key 
                      ? 'border-black bg-gray-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {preset.recommended && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      Recommended
                    </span>
                  )}
                  <div className="font-semibold text-sm text-gray-900">{preset.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {preset.gpus}
                    </span>
                    <span className="text-xs text-gray-600">
                      {preset.n_rollouts} rollouts
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
              <h4 className="font-semibold text-sm text-gray-900">Advanced Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">Learning Rate</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={config.learning_rate}
                    onChange={(e) => setConfig({ ...config, learning_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">N Rollouts</label>
                  <input
                    type="number"
                    value={config.n_rollouts}
                    onChange={(e) => setConfig({ ...config, n_rollouts: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">Batch Size</label>
                  <input
                    type="number"
                    value={config.batch_size}
                    onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">Epochs</label>
                  <input
                    type="number"
                    value={config.num_epochs}
                    onChange={(e) => setConfig({ ...config, num_epochs: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="block text-xs font-medium text-gray-700">Max Sequence Length</label>
                  <input
                    type="number"
                    value={config.max_seq_length}
                    onChange={(e) => setConfig({ ...config, max_seq_length: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="wandb"
                  checked={config.use_wandb}
                  onChange={(e) => setConfig({ ...config, use_wandb: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="wandb" className="text-xs text-gray-700">
                  Enable Weights & Biases monitoring
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
                  <span className="animate-pulse">🚀</span> Training in Progress...
                </span>
              ) : status.status === 'completed' ? (
                <span className="flex items-center gap-2">
                  <span>🎉</span> Training Completed
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🚀</span> Start Training on Hyperbolic
                </span>
              )}
            </Button>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={status.status === 'running'}
              variant="outline"
              className="h-12 px-5 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 text-sm font-semibold transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {showAdvanced ? '✕ Close' : '⚙️ Advanced'}
            </Button>
          </div>

          {/* Training Progress */}
          {status.status !== 'idle' && (
            <div className="space-y-4 pt-2">
              {/* Progress Bar */}
              <div className="border border-gray-200 rounded-lg p-3 space-y-2.5 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Training Progress</span>
                  <span className="font-semibold text-gray-900">{status.progress}%</span>
                </div>

                {status.status === 'running' && (
                  <Progress value={status.progress} className="w-full h-2" />
                )}
              </div>

              {/* Metrics Grid */}
              {status.metrics.epoch > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-blue-50 to-white">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Epoch</div>
                    <div className="text-2xl font-bold text-gray-900">{status.metrics.epoch}</div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-purple-50 to-white">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Loss</div>
                    <div className="text-2xl font-bold text-gray-900">{status.metrics.loss.toFixed(4)}</div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-green-50 to-white">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Avg Reward</div>
                    <div className="text-2xl font-bold text-gray-900">{status.metrics.reward.toFixed(4)}</div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-yellow-50 to-white">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Test Pass Rate</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {(status.metrics.test_pass_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Message */}
              {status.status === 'completed' && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 font-medium">
                  ✅ Training completed successfully! Model checkpoints saved.
                </div>
              )}
              
              {status.status === 'failed' && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 font-medium">
                  ❌ Training failed. Please check logs for details.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Info Card */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>ℹ️</span> Key Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
            <div>• Docker isolation per rollout</div>
            <div>• Gradient clipping (norm 0.1)</div>
            <div>• Parallel rollouts (N=16)</div>
            <div>• Auto tensor parallelism</div>
            <div>• WandB monitoring</div>
            <div>• Checkpoint saving</div>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <a 
              href="https://github.com/Danau5tin/terminal-bench-rl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              📖 terminal-bench-rl docs
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
