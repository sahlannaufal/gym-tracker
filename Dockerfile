# ---- deps: install all dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
# Pin npm ke versi yang sama dengan pembuat package-lock.json (npm 11).
# npm 10 bawaan image menolak lock ini (peer @swc/helpers), sedangkan npm 11 menerimanya.
RUN npm install -g npm@11.6.2 --no-audit --no-fund
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- build: compile the Next.js app ----
FROM node:22-alpine AS build
WORKDIR /app
# NEXT_PUBLIC_* di-inline saat build; isi lewat docker-compose build args (lihat docker-compose.yml)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_MIXPANEL_TOKEN
ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_MIXPANEL_TOKEN=$NEXT_PUBLIC_MIXPANEL_TOKEN
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: minimal production image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
