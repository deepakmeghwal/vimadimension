# ArchiEase Project Tracker

## Backend Implementation with Docker

The backend is a Spring Boot application containerized using Docker. It connects to a MySQL database also running in a Docker container.

### Prerequisites
- Docker and Docker Compose installed on your machine.

### How to Run (Local Development)

1.  **Build and Start the Application:**
    ```bash
    docker-compose up --build
    ```
    This will:
    - Start a MySQL 8.0 container.
    - Build the Spring Boot backend application.
    - Start the backend on port 8080.

2.  **Access the Application:**
    - API Health Check: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
    - API Endpoints: `http://localhost:8080/api/...`

3.  **Stop the Application:**
    ```bash
    docker-compose down
    ```
    To remove volumes (and database data):
    ```bash
    docker-compose down -v
    ```

### How to Run (Production Simulation)

To run with production settings (using `env.local` for environment variables):

```bash
docker-compose -f docker-compose.prod.yml --env-file env.local up --build
```

### Project Structure for Docker

- **Dockerfile**: Multi-stage build file for the Spring Boot application.
- **docker-compose.yml**: Docker Compose configuration for local development.
- **docker-compose.prod.yml**: Docker Compose configuration for production.
- **.dockerignore**: Excludes unnecessary files from the Docker build context.
- **mysql/init/**: Directory for SQL scripts to initialize the database (executed on first startup).

### Configuration

- **Local:** configured in `docker-compose.yml` and `src/main/resources/application.properties`.
- **Production:** configured in `docker-compose.prod.yml` (using environment variables) and `src/main/resources/application-prod.properties`.
