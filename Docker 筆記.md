# Docker 命令

## Build

- 基本 build 命令

```bash
docker build -t your-image-name .
```

- 指定 Dockerfile

```bash
docker build -t your-image-name -f /path/to/your/Dockerfile .
```

- 不使用缓存

```bash
docker build --no-cache -t your-image-name .
```

- 添加參數

```bash
docker build --build-arg ARG_NAME=value -t your-image-name .
```

## Docker Run

- 基本運行命令
  - -d : 表示以“守護程序”模式運行容器，這意味著容器將在後台運行。
  - -p 用於映射容器的端口到主機的端口。在這個例子中，我們映射容器的 80 和 443 端口到主機的 80 和 443 端口。
  - --name 用於為你的容器命名，以便於未來容易地管理它。
  - your-image-name 是你之前使用 docker build 命令建立的映像的名字。

```bash
docker run -d -p 80:80 -p 443:443 --name your-container-name your-image-name
```

- 檢查日誌

```bash
docker logs your-container-name
```

- 進入容器

```bash
docker exec -it your-container-name /bin/sh
```

- 停止和刪除容器
  - 當你想要停止容器時，你可以使用 docker stop 命令：
    ```bash
    docker stop your-container-name
    ```
  - 如果你想要刪除容器，你可以使用 docker rm 命令：
    ```bash
    docker rm your-container-name
    ```

## DockerHub

- 登入 DockerHub

```bash
docker login
```

- 標記你的映像

  - username 是你的 DockerHub 用戶名。
  - repository 是你想要推送到的 DockerHub 倉庫名。
  - tag 是你想要給你的映像設定的標籤（例如：latest）。

  ```bash
  docker tag your-image-name username/repository:tag
  ```

- 推送映像到 DockerHub

```bash
docker push username/repository:tag
```
