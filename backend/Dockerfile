FROM golang:1.24-alpine

WORKDIR /app
COPY . .
RUN go mod download

CMD ["go", "run", "./cmd/server/main.go"]