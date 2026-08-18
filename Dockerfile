# Stage 1: Build the JAR file
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy POM and download dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/banking-*.jar app.jar

# Expose port (Render automatically assigns PORT environment variable)
EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
