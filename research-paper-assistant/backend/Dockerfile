# Use Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user and set ownership
RUN addgroup -S nodeapp && \
    adduser -S -G nodeapp nodeapp && \
    chown -R nodeapp:nodeapp /app

# Switch to non-root user
USER nodeapp

# Copy package files with correct ownership
COPY --chown=nodeapp:nodeapp package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy project files with correct ownership
COPY --chown=nodeapp:nodeapp . .

# Create .env file from build args
ARG OPENAI_API_KEY
ARG FIREBASE_PROJECT_ID
ARG GROQ_API_KEY
ARG BASE_URL
ARG MODEL
ARG GROQ_MODEL
ARG PINECONE_API_KEY
ARG PINECONE_ENVIRONMENT
ARG PINECONE_INDEX_NAME
ARG PINECONE_HOST
ARG PINECONE_DIMENSIONS
ARG PINECONE_METRIC
ARG EMBEDDING_MODEL

RUN printf "OPENAI_API_KEY=${OPENAI_API_KEY}\n\
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}\n\
GROQ_API_KEY=${GROQ_API_KEY}\n\
BASE_URL=${BASE_URL}\n\
MODEL=${MODEL}\n\
GROQ_MODEL=${GROQ_MODEL}\n\
PINECONE_API_KEY=${PINECONE_API_KEY}\n\
PINECONE_ENVIRONMENT=${PINECONE_ENVIRONMENT}\n\
PINECONE_INDEX_NAME=${PINECONE_INDEX_NAME}\n\
PINECONE_HOST=${PINECONE_HOST}\n\
PINECONE_DIMENSIONS=${PINECONE_DIMENSIONS}\n\
PINECONE_METRIC=${PINECONE_METRIC}\n\
EMBEDDING_MODEL=${EMBEDDING_MODEL}" > .env

# Set Node environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "start"]