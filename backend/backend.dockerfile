# Backend Dockerfile

# Use the official Node.js image as the base image
# Specify the Node.js version (LTS recommended for stability)
FROM node:22

RUN apt-get update && apt-get install -y curl

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/kubectl

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the container
# This step ensures dependencies are installed correctly
COPY package*.json ./

# Install the necessary dependencies
RUN npm install

# Ensure @octokit/rest is installed
RUN npm install @octokit/rest

#Copy the prisma schema to the container 
COPY prisma ./prisma

# Generate the Prisma client
RUN npx prisma generate

# Copy the rest of the application code to the working directory
COPY . .

# Install nodemon globally for hot reloading
RUN npm install -g nodemon

# Expose the application port (4000 in this case)
EXPOSE 4000

# Define the command to start the application
CMD ["npm", "run", "dev"]
