#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting GearFlow Backend Build..."

# Set Java version
echo "☕ Setting Java version..."
export JAVA_HOME=/opt/render/project/.render/java/17
export PATH=$JAVA_HOME/bin:$PATH

# Verify Java version
java -version

# Clean and build
echo "🔨 Building application..."
./mvnw clean package -DskipTests

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    ls -lh target/*.jar
else
    echo "❌ Build failed!"
    exit 1
fi
