"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ScenarioConfig {
  total_tasks: number
  parallelism: number
}

interface ScenarioInputProps {
  onSubmit: (scenario: string, config: ScenarioConfig) => void
  disabled?: boolean
}

export function ScenarioInput({ onSubmit, disabled = false }: ScenarioInputProps) {
  const [scenario, setScenario] = useState('')
  const [totalTasks, setTotalTasks] = useState(10)
  const [parallelism, setParallelism] = useState(3)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!scenario.trim()) {
      setError('Please enter a task scenario')
      return
    }

    const config = {
      total_tasks: totalTasks,
      parallelism: parallelism
    }

    onSubmit(scenario, config)
    setError('')
  }

  return (
    <Card className="w-full border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">📝</span>
          Define Task Scenario
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Describe the task scenario that you want your agents to be good at
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="space-y-2">
          <label htmlFor="scenario" className="block text-sm font-medium text-gray-700">
            Task Description
          </label>
          <textarea
            id="scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            disabled={disabled}
            placeholder="Example: Train an agent to fix authentication bugs in web applications..."
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="totalTasks" className="block text-sm font-medium text-gray-700">
              Total Tasks
            </label>
            <input
              id="totalTasks"
              type="number"
              min="1"
              max="100"
              value={totalTasks}
              onChange={(e) => setTotalTasks(parseInt(e.target.value) || 10)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors text-sm"
            />
            <p className="text-xs text-gray-500">Number of tasks to generate</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="parallelism" className="block text-sm font-medium text-gray-700">
              Parallelism
            </label>
            <input
              id="parallelism"
              type="number"
              min="1"
              max="10"
              value={parallelism}
              onChange={(e) => setParallelism(parseInt(e.target.value) || 3)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors text-sm"
            />
            <p className="text-xs text-gray-500">Concurrent task generation</p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={disabled || !scenario.trim()}
          className="w-full h-11 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {disabled ? (
            <span className="flex items-center gap-2">
              <span>✓</span> Submitted
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue <span>→</span>
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
