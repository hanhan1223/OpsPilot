#!/bin/bash
# 健康检查: nginx + backend 都要正常
nginx_ok=$(curl -sf http://localhost/ -o /dev/null && echo "ok" || echo "fail")
backend_ok=$(curl -sf http://localhost:8000/health -o /dev/null && echo "ok" || echo "fail")

if [ "$nginx_ok" = "ok" ] && [ "$backend_ok" = "ok" ]; then
    exit 0
else
    exit 1
fi
