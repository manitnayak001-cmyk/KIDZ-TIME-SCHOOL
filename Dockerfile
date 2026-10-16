FROM node:22-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The secret here is only for the build step; the real one is supplied at run time.
RUN PAYLOAD_SECRET=build-only-secret npm run build
ENV NODE_ENV=production
RUN mkdir -p /data && chown -R node:node /data /app/.next
USER node
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
