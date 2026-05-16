#!/bin/bash
# Start script for Render deployment

echo "🚀 Starting GearFlow Backend..."

# Set Java options
export JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Find the jar file
JAR_FILE=$(find target -name "gearflow-api-*.jar" | head -n 1)

if [ -z "$JAR_FILE" ]; then
    echo "❌ JAR file not found!"
    exit 1
fi

echo "📦 Found JAR: $JAR_FILE"

# Start application
echo "▶️  Starting application..."
java $JAVA_OPTS -jar $JAR_FILE --spring.profiles.active=prod
