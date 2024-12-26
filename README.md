# Weather API Service

Project based on: "https://roadmap.sh/projects/weather-api-wrapper-service"

## Project Overview

A weather API wrapper service that provides cached weather data using Redis and handles requests with rate limiting.

## Features

- Weather data fetching from Visual Crossing API
- Redis caching with configurable TTL
- Rate limiting
- Error handling and logging
- Health check endpoint
- Security middleware
- Request validation

## Project Structure

### Main Components

- `src/index.js` - Application entry point and Express server setup
- `src/controllers/weatherController.js` - Request handling and response formatting
- `src/services/weatherService.js` - Weather API integration
- `src/services/cacheService.js` - Redis caching implementation
- `src/middleware/errorHandler.js` - Global error handling
- `src/config/logger.js` - Winston logger configuration

### API Endpoints

- `GET /health` - Service health check
- `GET /api/v1/weather/:city` - Get weather data for a city

### Key Dependencies

- Express.js - Web framework
- Redis (ioredis) - Caching
- Axios - HTTP client
- Winston - Logging
- Helmet - Security headers
- Rate-limit - Request limiting

## Configuration

The service uses environment variables for configuration:

- `PORT` - Server port
- `REDIS_URL` - Redis connection string
- `CACHE_TTL` - Cache time-to-live in seconds
- `VISUAL_CROSSING_API_KEY` - Weather API key
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window

## Error Handling

- Custom ApiError class for consistent error responses
- Comprehensive error types:
  - 404: City not found
  - 429: Rate limit exceeded
  - 502: Weather service unavailable
  - 503: Cache service unavailable
  - 504: Weather service timeout

## Caching Strategy

- Redis cache with configurable TTL
- Cache-first approach with fallback to API
- Automatic cache invalidation

## Security Features

- Rate limiting
- Helmet security headers
- Request validation
- Error logging
- API key validation

## Monitoring

- Winston logging setup
- Health check endpoint
- Error tracking
- Request logging

// ...existing code...
