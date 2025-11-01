# Testing Guide for email-automation-agentmail Task

本文档说明如何运行和测试 `email-automation-agentmail` seed task。

## 任务概述

**任务名称**: Email Automation with AgentMail
**难度**: Medium
**类别**: Software Engineering
**目标**: 创建使用 agentmail.to API 的 Python 邮件自动化脚本

---

## 文件结构

```
email-automation-agentmail/
├── task.yaml              # 任务配置和指令
├── Dockerfile             # Python 3.12 + agentmail 环境
├── docker-compose.yaml    # Docker 容器编排
├── solution.sh            # Oracle 参考解决方案
├── run-tests.sh           # 测试执行脚本
├── TESTING.md            # 本文档
└── tests/
    └── test_outputs.py    # pytest 测试套件（8个测试）
```

---

## 测试方法

### 方法 1: 使用 Terminal Bench CLI（推荐）

#### 前置条件

```bash
# 确保已安装 Terminal Bench
pip install terminal-bench
# 或使用 uv
uv tool install terminal-bench
```

#### 使用 Oracle Agent 测试

```bash
# 进入 Terminal Bench 任务目录
cd /Users/liugary/Research/agent_rl/terminal-bench

# 运行任务（使用 oracle agent 自动执行 solution.sh）
tb run --task-id email-automation-agentmail --agent oracle

# 查看结果
tb runs summarize --run-id <run-id>
```

#### 使用 AI Agent 测试

```bash
# 使用 Claude 代理运行任务
tb run \
    --task-id email-automation-agentmail \
    --agent terminus \
    --model anthropic/claude-3-7-sonnet

# 或使用其他模型
tb run \
    --task-id email-automation-agentmail \
    --agent claude-code \
    --model anthropic/claude-sonnet-4-5
```

---

### 方法 2: 交互式容器调试（推荐用于调试）

#### 进入交互式 Shell

```bash
# 基本交互模式
tb tasks interact --task-id email-automation-agentmail

# 包含所有文件（solution, tests 等）
tb tasks interact --task-id email-automation-agentmail --include-all

# 不重建容器（加快速度）
tb tasks interact --task-id email-automation-agentmail --no-rebuild
```

#### 容器内操作

```bash
# 1. 查看任务说明
cat /app/task.yaml

# 2. 执行 oracle solution
bash solution.sh

# 3. 验证文件创建
ls -lh /home/tbuser/email_automation.py

# 4. 查看生成的代码
cat /home/tbuser/email_automation.py

# 5. 运行测试
cd /tests
python3 -m pytest test_outputs.py -rA

# 6. 运行特定测试
python3 -m pytest test_outputs.py::test_script_exists -v

# 7. 查看详细错误信息
python3 -m pytest test_outputs.py -vv
```

---

### 方法 3: 手动 Docker 操作（完全手动控制）

#### 构建和运行

```bash
# 1. 进入任务目录
cd /Users/liugary/Research/agent_rl/tbench-agentic-data-pipeline/seed_tasks/email-automation-agentmail

# 2. 构建 Docker 镜像
docker build -t email-automation-test .

# 3. 运行容器（交互式）
docker run -it --rm \
    -v $(pwd)/tests:/tests \
    -e TEST_DIR=/tests \
    email-automation-test bash

# 在容器内：
# 4. 执行 solution
bash solution.sh

# 5. 运行测试
bash run-tests.sh
```

#### 使用 Docker Compose

```bash
# 1. 设置环境变量
export T_BENCH_TASK_DOCKER_CLIENT_IMAGE_NAME="email-automation-client"
export T_BENCH_TASK_DOCKER_CLIENT_CONTAINER_NAME="email-automation-container"
export T_BENCH_TEST_DIR="/tests"
export T_BENCH_TASK_LOGS_PATH="./logs"
export T_BENCH_CONTAINER_LOGS_PATH="/logs"
export T_BENCH_TASK_AGENT_LOGS_PATH="./agent-logs"
export T_BENCH_CONTAINER_AGENT_LOGS_PATH="/agent-logs"

# 2. 创建日志目录
mkdir -p logs agent-logs

# 3. 启动服务
docker compose up -d

# 4. 进入容器
docker exec -it email-automation-container bash

# 5. 在容器内测试
bash solution.sh
cd /tests && python3 -m pytest test_outputs.py -rA

# 6. 清理
docker compose down
```

---

## 测试说明

### 测试内容

测试套件包含 8 个测试，验证：

1. ✅ **test_script_exists** - 脚本文件存在
2. ✅ **test_imports_successfully** - agentmail SDK 和脚本可导入
3. ✅ **test_required_functions_exist** - 三个核心函数存在
4. ✅ **test_function_signatures** - 函数参数签名正确
5. ✅ **test_functions_have_docstrings** - 所有函数有文档字符串
6. ✅ **test_type_hints_present** - 使用类型提示
7. ✅ **test_no_hardcoded_api_keys** - 无硬编码 API 密钥
8. ✅ **test_script_is_importable** - 有 `if __name__ == "__main__"` 保护

### 关键特性

- **无需真实 API**: 测试验证代码结构和质量，不需要真实的 AGENTMAIL_API_KEY
- **代码质量导向**: 重点检查类型提示、文档、安全实践等
- **快速执行**: 所有测试在几秒内完成

---

## 常见问题

### Q1: 测试失败怎么办？

```bash
# 查看详细错误信息
python3 -m pytest test_outputs.py -vv

# 运行单个测试
python3 -m pytest test_outputs.py::test_function_signatures -vv

# 显示 print 输出
python3 -m pytest test_outputs.py -s
```

### Q2: 需要真实的 API Key 吗？

**不需要**。测试仅验证代码结构，不调用真实 API。如果要测试真实功能：

```bash
# 在 docker-compose.yaml 中取消注释：
# - AGENTMAIL_API_KEY=${AGENTMAIL_API_KEY}

# 然后设置环境变量
export AGENTMAIL_API_KEY="your-api-key"

# 运行容器时传入
docker run -it --rm \
    -e AGENTMAIL_API_KEY=$AGENTMAIL_API_KEY \
    email-automation-test bash
```

### Q3: 如何验证 solution.sh 是否正确？

```bash
# 方法 1: 在容器内直接执行
bash solution.sh
python3 -m pytest /tests/test_outputs.py -rA

# 方法 2: 使用 TB CLI oracle agent
tb run --task-id email-automation-agentmail --agent oracle

# 检查所有测试是否通过
```

### Q4: 如何修改任务配置？

编辑 `task.yaml` 文件后，需要重建容器：

```bash
# 使用 TB CLI 重建
tb tasks build --task-id email-automation-agentmail --rebuild

# 或手动重建 Docker 镜像
docker build -t email-automation-test . --no-cache
```

---

## 调试技巧

### 1. 检查 Python 导入

```bash
# 在容器内
python3 -c "import agentmail; print('agentmail version:', agentmail.__version__)"
python3 -c "import sys; print('Python version:', sys.version)"
```

### 2. 验证文件权限

```bash
ls -lh /home/tbuser/email_automation.py
file /home/tbuser/email_automation.py
```

### 3. 测试代码语法

```bash
python3 -m py_compile /home/tbuser/email_automation.py
```

### 4. 手动导入测试

```bash
python3 << 'EOF'
import sys
sys.path.insert(0, '/home/tbuser')
import email_automation

print("Functions:", dir(email_automation))
print("create_inbox:", email_automation.create_inbox.__doc__)
EOF
```

---

## 输出结果说明

### 成功输出示例

```
============================= test session starts ==============================
collected 8 items

test_outputs.py::test_script_exists PASSED                               [ 12%]
test_outputs.py::test_imports_successfully PASSED                        [ 25%]
test_outputs.py::test_required_functions_exist PASSED                    [ 37%]
test_outputs.py::test_function_signatures PASSED                         [ 50%]
test_outputs.py::test_functions_have_docstrings PASSED                   [ 62%]
test_outputs.py::test_type_hints_present PASSED                          [ 75%]
test_outputs.py::test_no_hardcoded_api_keys PASSED                       [ 87%]
test_outputs.py::test_script_is_importable PASSED                        [100%]

============================== 8 passed in 0.52s ===============================
```

### 失败输出示例

```
FAILED test_outputs.py::test_type_hints_present - AssertionError: send_email must have a return type hint
```

---

## 集成到数据 Pipeline

如果要将此任务集成到 tbench-agentic-data-pipeline：

```bash
cd /Users/liugary/Research/agent_rl/tbench-agentic-data-pipeline

# 运行 init_seed_tasks.py 添加任务
python init_seed_tasks.py /path/to/terminal-bench/tasks

# 或手动添加单个任务
python data_pipeline.py add-seed --task-path seed_tasks/email-automation-agentmail
```

---

## 参考资源

- **AgentMail 文档**: https://docs.agentmail.to
- **Terminal Bench**: https://github.com/laude-institute/terminal-bench
- **Pytest 文档**: https://docs.pytest.org

---

## 贡献者

如有问题或改进建议，请提交 issue 或 pull request。
