"use client";

import { Card, CardContent } from "@/components/ui/card";

export function DemoLoop() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Self-Improving Agent Training Loop
            </h2>
            <p className="text-gray-600 text-lg">
              A continuous cycle of synthetic task generation, validation, and training
            </p>
          </div>

          {/* Loop Diagram */}
          <div className="relative flex items-center justify-center min-h-[500px]">
            {/* Central Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-black via-gray-800 to-gray-700 flex items-center justify-center shadow-2xl ring-4 ring-gray-200">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🔄</div>
                  <div className="text-lg font-bold tracking-tight">Self-Evolve</div>
                </div>
              </div>
            </div>

            {/* Three Steps in Circle */}
            <div className="relative w-full h-[500px]">
              {/* Step 1: Top - Generate */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72">
                <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-black to-gray-700 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md">
                      1
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      Agent Generate<br/>Synthetic Tasks
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-16">
                    AI agents create diverse training scenarios automatically
                  </p>
                </div>
                {/* Arrow pointing down-right */}
                <div className="absolute -bottom-20 right-4 text-5xl text-gray-300 animate-bounce-slow">
                  ↘
                </div>
              </div>

              {/* Step 2: Bottom Right - Validate */}
              <div className="absolute bottom-0 right-0 w-72">
                <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-black to-gray-700 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md">
                      2
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      Self-Review &<br/>Validate in Sandbox
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-16">
                    Automated testing ensures task quality and correctness
                  </p>
                </div>
                {/* Arrow pointing left */}
                <div className="absolute top-1/2 -left-16 text-5xl text-gray-300 animate-bounce-slow">
                  ←
                </div>
              </div>

              {/* Step 3: Bottom Left - Train */}
              <div className="absolute bottom-0 left-0 w-72">
                <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-black to-gray-700 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md">
                      3
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      Train Agents on<br/>Validated Tasks
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-16">
                    Fine-tune models on high-quality validated data
                  </p>
                </div>
                {/* Arrow pointing up-right */}
                <div className="absolute -top-20 right-12 text-5xl text-gray-300 animate-bounce-slow">
                  ↗
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-16 grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold text-base text-gray-900 mb-2">Automated</h4>
              <p className="text-sm text-gray-600 leading-relaxed">End-to-end pipeline with minimal human intervention</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold text-base text-gray-900 mb-2">High Quality</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Sandbox validation ensures task correctness</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-3">📈</div>
              <h4 className="font-bold text-base text-gray-900 mb-2">Scalable</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Generate unlimited training data on demand</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-5px);
            opacity: 0.6;
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

