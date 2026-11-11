# 正式部署说明

这个项目已经准备好 Docker 部署文件，DeepSeek Key 通过环境变量注入，不写进镜像。

## 方案一：Render（有 GitHub 账号即可，免费）

1. 把整个 feiyi-guide 目录推到 GitHub 仓库。
2. 打开 https://render.com ，新建 Blueprint，选择该仓库。
3. Render 会自动读取 render.yaml，创建 Web Service。
4. 在 Environment 中填写 DEEPSEEK_API_KEY，值用你自己的 Key。
5. 部署完成后得到 https://feiyi-guide.onrender.com 之类的固定地址。

注意：Render 免费实例 15 分钟无访问会休眠，下次打开需要几十秒冷启动。正式答辩建议提前打开一次，或升级到付费实例。

## 方案二：Railway（部署快，需要账号）

1. 安装 Railway CLI，登录。
2. 在 feiyi-guide 目录执行 railway init。
3. 执行 railway up。
4. 在 Variables 中添加 DEEPSEEK_API_KEY。
5. 生成公网域名。

## 方案三：自己的云服务器（最稳定）

服务器要求：Linux、JDK 17、可开放 80/443 端口。

1. 上传 feiyi-guide.jar 到服务器。
2. 用 systemd 启动：
   java -jar /opt/feiyi-guide/feiyi-guide.jar --spring.profiles.active=deepseek --server.port=8082
   并通过 Environment=DEEPSEEK_API_KEY=... 注入 Key。
3. 用 Nginx 反向代理到 127.0.0.1:8082。
4. 绑定域名并申请 HTTPS 证书。
5. 国内服务器绑定域名通常需要备案。

## 关键环境变量

DEEPSEEK_API_KEY=你的 DeepSeek Key

## 不要提交的文件

deepseek-key.txt、任何包含 Key 的启动脚本、tunnel-*.log。

## 验证

部署后访问：

https://你的域名/api/health

正常返回 exhibits=9、documents=16、chunks=54。

再问一句“青花瓷的蓝色从哪里来？”，回答旁应显示 DeepSeek。
