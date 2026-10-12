#Requires -Version 5.1
<#
.SYNOPSIS
    AI 开发环境一键初始化脚本。

.DESCRIPTION
    按顺序执行下列步骤，每一步对应一个独立函数：
      1.  如果没有 git，退出报错
      2.  如果没有 choco，提示用户安装(Y/N)，N退出，Y继续
      3.  如果没有 cc-switch，提示用户安装(Y/N)，N退出，Y继续
      4.  如果没有 uv，提示用户使用 choco 安装(Y/N)，N退出，Y继续
      5.  如果没有 make，提示用户使用 choco 安装(Y/N)，N退出，Y继续
      6.  如果没有 opencode，提示用户安装(Y/N)，N退出，Y继续
      7.  使用 uv pip install code-review-graph
      8.  运行命令初始化 crg: uv run code-review-graph install --platform qoder
      9.  将 qoder 的 crg skills 迁移到 cc-switch 中 (./.cc-switch/skills)
      10. 克隆 https://github.com/wshobson/agents 到 tmp
      11. cd 到刚刚克隆的 wshobson 的 agents，运行 make install-pi
      12. 将 pi 的 agents 迁移到 cc-switch 中
#>
