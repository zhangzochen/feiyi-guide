FROM eclipse-temurin:17-jre
WORKDIR /app
COPY feiyi-guide.jar app.jar
ENV PORT=8080
ENV JAVA_TOOL_OPTIONS="-Xmx384m"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java -jar app.jar --spring.profiles.active=deepseek --server.port=${PORT}"]
