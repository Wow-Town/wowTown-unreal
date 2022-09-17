FROM nginx:stable-alpine
COPY ./build/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]