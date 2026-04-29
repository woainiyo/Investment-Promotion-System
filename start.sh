#!/bin/bash

# Beshe Backend 启动脚本

# 设置工作目录
cd "$(dirname "$0")"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "警告: pnpm 未安装，尝试使用 npm"
    if ! command -v npm &> /dev/null; then
        echo "错误: npm 也未安装"
        exit 1
    fi
    INSTALL_CMD="npm install"
    START_CMD="npm start"
else
    INSTALL_CMD="pnpm install"
    START_CMD="pnpm start"
fi

# 安装依赖（如果 node_modules 不存在）
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    $INSTALL_CMD
    if [ $? -ne 0 ]; then
        echo "依赖安装失败"
        exit 1
    fi
fi

# 创建日志目录
mkdir -p logs

# 启动应用
echo "启动 Beshe Backend 应用..."
$START_CMD