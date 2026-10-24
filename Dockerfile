# From node:20-alpine

# copy ./Backend .

# RUN npm install

# CMD ["node", "server.js"]






from node:20-alpine as frontend-builder

COPY ./frontend /app

WORKDIR /app

RUN npm install

RUN npm run build




from node:20-alpine

copy ./Backend /app

WORKDIR /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public

CMD ["node", "server.js"]