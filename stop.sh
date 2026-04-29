#!/bin/bash

# Beshe Backend 停止脚本

# 查找并杀死 Node.js 进程
echo "正在查找 Beshe Backend 进程..."

# 获取当前目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 查找在当前目录下运行的 node 进程
PIDS=$(ps aux | grep "node.*server.js" | grep "$SCRIPT_DIR" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "未找到正在运行的 Beshe Backend 进程"
else
    echo "找到进程: $PIDS"
    echo "正在停止进程..."
    kill $PIDS
    sleep 2
    
    # 检查是否还有残留进程
    PIDS_CHECK=$(ps aux | grep "node.*server.js" | grep "$SCRIPT_DIR" | grep -v grep | awk '{print $2}')
    if [ -z "$PIDS_CHECK" ]; then
        echo "Beshe Backend 已成功停止"
    else
        echo "强制停止残留进程..."
        kill -9 $PIDS_CHECK
        echo "Beshe Backend 已强制停止"
    fi
fi