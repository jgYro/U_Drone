# Build multi-architecture Docker images
echo "Building backend image..."
docker buildx build \
  --platform linux/amd64 \
  -t 127.0.0.1:5000/hackathon-backend:latest \
  -f ./backend/Dockerfile \
  ./backend \
  --push

#   -v "$(pwd)/backend/data:/app/data" \
#   -v "$(pwd)/backend/map_tiles:/app/map_tiles" \
#   -v "$(pwd)/backend/logs:/app/logs" \

echo "Building frontend image..."
docker buildx build \
  --platform linux/amd64 \
  -t 127.0.0.1:5000/hackathon-frontend:latest \
  -f ./frontend/Dockerfile \
  ./frontend \
  --push

echo "Creating AMD64 Zarf package..."
uds zarf package remove hackathon --confirm
kubectl delete ns hackathon 

uds zarf package create --confirm -a amd64 
uds zarf package deploy zarf-package-hackathon-amd64-1.0.0.tar.zst --confirm
