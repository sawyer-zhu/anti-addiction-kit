#!/bin/bash

# 如 脚本文件 无法执行，终端跑一下👇
#chmod +x ./carthageBuildiOSFramework.sh

# 确保已经安装 Carthage 尽量升级到最新版
# brew install Carthage
# brew upgrade Carthage

# 查找脚本当前目录
work_path=$(dirname $0)
#echo ${work_path}
 
# 切换到工程目录，使用 Carthage 打包 release 动态库
# Framework产出目录 Carthage/Build/iOS/AntiAddictionKit.framework
cd ${work_path}/iOS/AntiAddictionKit && Carthage build --configuration release --no-skip-current --platform ios AntiAddictionKit