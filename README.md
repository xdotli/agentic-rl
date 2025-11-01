# agentic-rl
Agentic data pipeline + training on any tasks.

For hackathon

https://docs.google.com/document/d/1cqfkTvexl31AF94Xd99kbXxZa8o0UPtTiaxmMM_hvQg/edit?tab=t.0

![Training Graph](pics/train-graph.png)

After just 100 steps of GRPO training (1 hour on a 32 x H100 GPU), Qwen-32B significantly improved its ability to terminal based tool calling tasks. (see tbench-agentic-data-pipeline). We haven't finished training on generative tasks like tool calling with AgentMail or Convex.
