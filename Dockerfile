FROM registry.cn-shanghai.aliyuncs.com/kolenz/nginx:1.22.1-alpine

LABEL maintainer=gaoolin@gmail.com

# 时区设置
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone

VOLUME /log

# 将dist目录内容复制到nginx容器html内部
COPY dist /usr/share/nginx/html/

# 删除官方nginx镜像默认的配置
RUN rm -rf /etc/nginx/conf.d/default.conf

# 配置文件nginx.conf是要放在/etc/nginx/目录下, 而用于独立配置server的配置文件，需要放在/etc/nginx/conf.d/目录下
ADD ./nginx.conf /etc/nginx/nginx.conf

# 将独立配置server的配置文件添加到默认配置目录下
# 注意：nginx.conf需要与Dockerfile在同一目录
# ADD ./nginx-server.conf /etc/nginx/conf.d/

# COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
