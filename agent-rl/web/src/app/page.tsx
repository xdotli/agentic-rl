"use client";

import { useState } from "react";
import { ScenarioInput } from "@/components/ScenarioInput";
import { SeedTaskUpload } from "@/components/SeedTaskUpload";
import { TaskGenerationPanel } from "@/components/TaskGenerationPanel";
import { TrainingControl } from "@/components/TrainingControl";

type Step = "scenario" | "upload" | "generate" | "training" | "complete";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("scenario");
  const [scenarioSubmitted, setScenarioSubmitted] = useState(false);
  const [generationCompleted, setGenerationCompleted] = useState(false);

  const handleScenarioSubmit = async (
    scenario: string,
    config: { multiplier: number; num_agents: number; max_iterations: number },
  ) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/submit-scenario",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario, config }),
        },
      );

      if (response.ok) {
        setScenarioSubmitted(true);
        setTimeout(() => setCurrentStep("upload"), 500);
      }
    } catch (error) {
      console.error("Failed to submit scenario:", error);
    }
  };

  const handleSeedTaskUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "http://localhost:8000/api/upload-seed-tasks",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }
  };

  const handleSkipUpload = () => {
    setCurrentStep("generate");
  };

  const handleUploadComplete = () => {
    setTimeout(() => setCurrentStep("generate"), 500);
  };

  const handleGenerate = async () => {
    const response = await fetch(
      "http://localhost:8000/api/generate-seed-tasks",
      {
        method: "POST",
      },
    );

    if (response.ok) {
      // Will be tracked by polling in TaskGenerationPanel
      setTimeout(() => {
        setGenerationCompleted(true);
        // Don't auto-jump to training, let user download first
      }, 26000); // Mock: set after ~26 seconds
    }
  };

  const handleContinueToTraining = () => {
    setCurrentStep("training");
  };

  const handleStartTraining = async (config: {
    learning_rate: number;
    batch_size: number;
    num_epochs: number;
    use_wandb: boolean;
  }) => {
    const response = await fetch("http://localhost:8000/api/start-training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error("Failed to start training");
    }
  };

  const steps = [
    { id: "scenario", label: "📝 Task Scenario", icon: "📝" },
    { id: "upload", label: "📦 Seed Tasks", icon: "📦" },
    { id: "generate", label: "⚙️ Generate Data", icon: "⚙️" },
    { id: "training", label: "🚀 Train Model", icon: "🚀" },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex((s) => s.id === currentStep);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto py-8 px-4 relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-3 bg-black text-white text-xs font-medium rounded-full">
            Powered by Terminal Bench & Hyperbolics
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 tracking-tight">
            Agentic RL
          </h1>
          <p className="text-gray-600 text-base">
            Agentic data pipeline + training on any tasks
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {/* Progress Line */}
            <div className="absolute top-[46px] left-6 right-6 h-0.5 bg-gray-100">
              <div
                className="h-full bg-gradient-to-r from-black to-gray-700 transition-all duration-500 ease-out shadow-lg"
                style={{
                  width: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = index < getCurrentStepIndex();

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`
                        w-11 h-11 rounded-lg flex items-center justify-center text-base font-semibold
                        transition-all duration-300 transform relative
                        ${
                          isActive
                            ? "bg-black text-white shadow-lg scale-105 ring-4 ring-black/10"
                            : isCompleted
                              ? "bg-black text-white shadow-md"
                              : "bg-gray-50 text-gray-300 border-2 border-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      {isCompleted ? "✓" : step.icon}
                      {isActive && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-black via-gray-800 to-black animate-pulse opacity-20" />
                      )}
                    </div>
                    <div
                      className={`
                      mt-2 text-xs font-semibold transition-all duration-300 text-center
                      ${isActive ? "text-gray-900" : isCompleted ? "text-gray-700" : "text-gray-400"}
                    `}
                    >
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content - Step by Step */}
        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[450px]">
            {/* Step 1: Scenario */}
            {currentStep === "scenario" && (
              <div className="transition-opacity duration-300">
                <ScenarioInput
                  onSubmit={handleScenarioSubmit}
                  disabled={scenarioSubmitted}
                />
              </div>
            )}

            {/* Step 2: Upload */}
            {currentStep === "upload" && (
              <div className="transition-opacity duration-300">
                <SeedTaskUpload
                  onUpload={handleSeedTaskUpload}
                  onSkip={handleSkipUpload}
                  onComplete={handleUploadComplete}
                />
              </div>
            )}

            {/* Step 3: Generate */}
            {currentStep === "generate" && (
              <div className="transition-opacity duration-300">
                <TaskGenerationPanel
                  onGenerate={handleGenerate}
                  scenarioSubmitted={scenarioSubmitted}
                  onContinue={handleContinueToTraining}
                />
              </div>
            )}

            {/* Step 4: Training */}
            {currentStep === "training" && (
              <div className="space-y-6 transition-opacity duration-300">
                <TrainingControl
                  onStartTraining={handleStartTraining}
                  generationCompleted={generationCompleted}
                />
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-10">
          Built with Claude Code
        </div>
      </div>
    </main>
  );
}
