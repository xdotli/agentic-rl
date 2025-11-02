"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, PlayCircle } from "lucide-react";

interface ValidationResult {
  round: number;
  status: "pending" | "running" | "passed" | "failed";
  quality?: "low" | "med" | "high";
  difficulty?: "low" | "med" | "high";
  error?: string;
}

interface ValidationPanelProps {
  onComplete: () => void;
}

export function ValidationPanel({ onComplete }: ValidationPanelProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStarted, setValidationStarted] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([
    { round: 1, status: "pending" },
    { round: 2, status: "pending" },
    { round: 3, status: "pending" },
    { round: 4, status: "pending" },
    { round: 5, status: "pending" },
  ]);
  const [currentRound, setCurrentRound] = useState(0);

  const mockValidateRound = async (
    round: number
  ): Promise<{ 
    passed: boolean; 
    quality?: "low" | "med" | "high";
    difficulty?: "low" | "med" | "high";
  }> => {
    // Simulate 1.5 second loading
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 10% chance to fail
    const passed = Math.random() > 0.1;

    // Always generate random quality and difficulty rating with LLM reviewer
    let quality: "low" | "med" | "high" | undefined;
    let difficulty: "low" | "med" | "high" | undefined;
    if (passed) {
      const qualityRand = Math.random();
      quality = qualityRand < 0.33 ? "low" : qualityRand < 0.67 ? "med" : "high";
      
      const difficultyRand = Math.random();
      difficulty = difficultyRand < 0.33 ? "low" : difficultyRand < 0.67 ? "med" : "high";
    }

    return { passed, quality, difficulty };
  };

  const startValidation = async () => {
    setIsValidating(true);
    setValidationStarted(true);

    for (let i = 0; i < 5; i++) {
      setCurrentRound(i + 1);

      // Update to running
      setResults((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: "running" as const } : r
        )
      );

      try {
        const result = await mockValidateRound(i + 1);

        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: result.passed ? ("passed" as const) : ("failed" as const),
                  quality: result.quality,
                  difficulty: result.difficulty,
                  error: result.passed ? undefined : "Solution validation failed",
                }
              : r
          )
        );
      } catch (error) {
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "failed" as const,
                  error: "Validation error occurred",
                }
              : r
          )
        );
      }
    }

    setIsValidating(false);
  };

  const completedRounds = results.filter((r) => r.status !== "pending").length;
  const passedRounds = results.filter((r) => r.status === "passed").length;
  const failedRounds = results.filter((r) => r.status === "failed").length;
  const progress = (completedRounds / 5) * 100;

  const getQualityBadge = (quality?: "low" | "med" | "high") => {
    if (!quality) return null;
    const colors = {
      low: "bg-yellow-100 text-yellow-800 border-yellow-300",
      med: "bg-blue-100 text-blue-800 border-blue-300",
      high: "bg-green-100 text-green-800 border-green-300",
    };
    const labels = {
      low: "Low",
      med: "Med",
      high: "High",
    };
    return (
      <span
        className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full border ${colors[quality]}`}
      >
        Task Quality: {labels[quality]}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty?: "low" | "med" | "high") => {
    if (!difficulty) return null;
    const colors = {
      low: "bg-emerald-100 text-emerald-800 border-emerald-300",
      med: "bg-orange-100 text-orange-800 border-orange-300",
      high: "bg-red-100 text-red-800 border-red-300",
    };
    const labels = {
      low: "Low",
      med: "Med",
      high: "High",
    };
    return (
      <span
        className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full border ${colors[difficulty]}`}
      >
        Task Difficulty: {labels[difficulty]}
      </span>
    );
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          ✅ Validation Tasks
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Validate generated tasks with oracle solutions and reviewer agents.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!validationStarted && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Run 5 rounds of validation to verify task quality before
                training. Each round will test the generated tasks against
                oracle solutions and rate quality and difficulty with LLM reviewer.
              </AlertDescription>
            </Alert>

            <Button
              onClick={startValidation}
              disabled={isValidating}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Validation
            </Button>
          </div>
        )}

        {validationStarted && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>
                  Progress: Round {currentRound} of 5
                </span>
                <span className="text-gray-600">
                  {passedRounds} passed, {failedRounds} failed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.round}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${
                      result.status === "running"
                        ? "border-black bg-gray-50 shadow-sm"
                        : result.status === "passed"
                          ? "border-green-200 bg-green-50"
                          : result.status === "failed"
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200 bg-white"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {result.status === "pending" && (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      {result.status === "running" && (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      )}
                      {result.status === "passed" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {result.status === "failed" && (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          result.status === "running"
                            ? "text-gray-900"
                            : result.status === "pending"
                              ? "text-gray-500"
                              : result.status === "passed"
                                ? "text-green-700"
                                : "text-red-700"
                        }`}
                      >
                        Round {result.round}
                      </span>
                      {result.error && (
                        <span className="text-xs text-red-600">
                          {result.error}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center flex-wrap gap-1">
                      {result.status === "running" && (
                        <span className="text-xs text-gray-600">
                          Validating...
                        </span>
                      )}
                      {result.quality && getQualityBadge(result.quality)}
                      {result.difficulty && getDifficultyBadge(result.difficulty)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isValidating && (
              <div className="pt-4">
                <Alert
                  className={
                    failedRounds === 0
                      ? "border-green-200 bg-green-50"
                      : "border-yellow-200 bg-yellow-50"
                  }
                >
                  <AlertDescription>
                    {failedRounds === 0 ? (
                      <span className="text-green-800 font-medium">
                        ✓ All validations passed (passed 5 rounds of oracle solution runs)! Ready to proceed to training.
                      </span>
                    ) : (
                      <span className="text-yellow-800 font-medium">
                        ⚠ {failedRounds} validation(s) failed (passed {passedRounds} rounds of oracle solution runs). You can still
                        proceed, but task quality may be affected.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={onComplete}
                  className="w-full mt-4 bg-black hover:bg-gray-800 text-white"
                >
                  Continue to Training →
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

