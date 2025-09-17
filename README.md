# Enova Academy API — README

MVP de **Matrículas** em **NestJS** com autenticação, cursos, fluxo de pagamento simulado via **RabbitMQ** e envio assíncrono de “welcome_email”. Inclui **Redis** (cache), **PostgreSQL**, observabilidade (**/health**, **/metrics**), **Swagger**, **RBAC (student/admin)**, testes unit/e2e e **Docker Compose**.

---

## 📦 Stack

- **Node/NestJS** (API + Worker)
- **PostgreSQL** (Prisma ORM)
- **Redis** (cache dos cursos)
- **RabbitMQ** (mensageria de pagamentos/e-mails)
- **Prometheus client** (métricas em `/metrics`)
- **Swagger** (docs em `/docs`)

---

## 🚀 TL;DR (Docker Compose)

> Pré-requisitos: **Docker** e **Docker Compose**.

```bash
# 1) copie as variáveis de ambiente
cp .env.sample .env

# 2) suba tudo
docker compose up -d --build

# 3) rode migrações (dentro do container da API)
docker compose exec api npm run prisma:migrate

# 4) seed do admin (dentro do container da API)
docker compose exec api npm run seed:admin
```

A API ficará acessível em: **http://localhost:3000**  
Swagger: **http://localhost:3000/docs**  
Health: **http://localhost:3000/health**  
Metrics: **http://localhost:3000/metrics**  
RabbitMQ UI: **http://localhost:15672** (usuário/senha: `guest`/`guest`)

---

## 🔧 Variáveis de ambiente (principais)

> O `.env.sample` já vem preenchido para rodar com o `docker-compose.yml`.

```env
# App
APP_PORT=3000
APP_RATE_LIMIT_TTL=60
APP_RATE_LIMIT_LIMIT=5

# Auth
APP_JWT_SECRET=supersecret
APP_JWT_TTL=1h

# DB (apontando para o serviço 'db' do compose)
DATABASE_URL=postgresql://postgres:postgres@db:5432/enova?schema=public

# Redis (serviço 'cache')
REDIS_URL=redis://cache:6379

# RabbitMQ (serviço 'rabbitmq')
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_EXCHANGE=enova.exchange
RABBITMQ_PAYMENT_KEY=payment.requested
RABBITMQ_WELCOME_KEY=welcome.email

# Flags de execução
APP_WORKER=true             # worker processa fila
APP_USE_WEBHOOK=false       # quando true, o webhook decide o pagamento (ignora worker)
```

---

## ✅ Checklist de Aceitação

- [x] **Docker Compose**: `docker compose up` e API pronta em **http://localhost:3000**
- [x] **Fluxo básico**: criar **student** (`/auth/signup`), **login**, **criar curso** (admin seed), **listar** e **detalhar** curso
- [x] **Matrícula**: criar `/enrollments` → `pending_payment` → **worker** altera para `paid` e loga **welcome_email**
- [x] **Duplicidade**: impedir matrícula duplicada (retorno **409/400** com mensagem clara)
- [x] **Capacidade**: respeitar `capacity` (retornar **422** quando lotado)
- [x] **Cache**: `/courses` mostrando **MISS/HIT** em log e contadores no `/metrics`
- [x] **RBAC**: endpoints protegidos (admin vs student)
- [x] **Testes**: `npm run test:cov` ok; pipeline de **CI** passando
