# Enova Academy API — README

MVP de **Matrículas** em **NestJS** com autenticação, cursos, fluxo de pagamento simulado via **RabbitMQ** e envio assíncrono de “welcome_email”. Inclui **Redis** (cache), **PostgreSQL**, observabilidade (**/health**, **/metrics**), **Swagger**, **RBAC (student/admin)**, testes (unit/e2e) e **Docker Compose**.

> Porta padrão da API no host: **http://localhost:3000**

---

## 📦 Stack

- **Node/NestJS** (API + Worker)
- **PostgreSQL** (Prisma ORM)
- **Redis** (cache dos cursos)
- **RabbitMQ** (mensageria de pagamentos/e-mails)
- **Prometheus client** (métricas em `/metrics`)
- **Swagger** (docs em `/docs`)

---

## 🗂️ Estrutura (resumo)

```
src/
  auth/            # signup/login/JWT
  common/          # guards, decorators, interceptors (ex.: http metrics)
  config/          # app/auth/db/cache/queue (config via @nestjs/config)
  courses/         # CRUD e listagem com cache
  email/           # "envio" de e-mail (log estruturado)
  enrollments/     # matrículas e regras de negócio
  health/          # /health
  metrics/         # /metrics e serviço de métricas
  prisma/          # PrismaService
  queue/           # QueueService (publisher), QueueConsumer (worker), worker.main.ts
  webhooks/        # /webhooks/payment (quando APP_USE_WEBHOOK=true)
prisma/
  schema.prisma    # modelos Prisma
  migrations/      # migrações geradas
test/
  unit/            # testes unitários
  e2e/             # (se aplicável) testes fim-a-fim
```

---

## 🚀 Quickstart com Docker Compose

> Pré-requisitos: **Docker** e **Docker Compose** instalados.

1) **Variáveis de ambiente**
```bash
cp .env.sample .env
```

2) **Subir a stack**
```bash
docker compose up -d --build
```

3) **Aplicar migrações (Prisma)**
```bash
docker compose exec api npm run prisma:migrate
```

4) **Seed do admin**
```bash
docker compose exec api npm run seed:admin
```

A API ficará acessível em: **http://localhost:3000**  
Swagger: **http://localhost:3000/docs**  
Health: **http://localhost:3000/health**  
Metrics: **http://localhost:3000/metrics**  
RabbitMQ UI: **http://localhost:15672** (usuário/senha: `guest`/`guest`)

> O **worker** também sobe pelo compose. Se quiser desligar, veja as flags em **Execução por flags**.

---

## 🔧 Variáveis de ambiente (principais)

> O `.env.sample` já está pronto para Docker Compose.

```env
# App
APP_PORT=3000
APP_RATE_LIMIT_TTL=60
APP_RATE_LIMIT_LIMIT=5

# Auth
APP_JWT_SECRET=supersecret
APP_JWT_TTL=1h

# DB (serviço 'db' do compose)
DATABASE_URL=postgresql://postgres:postgres@db:5432/enova?schema=public

# Redis (serviço 'cache')
REDIS_URL=redis://cache:6379

# RabbitMQ (serviço 'rabbitmq')
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_EXCHANGE=enova.exchange
RABBITMQ_PAYMENT_KEY=payment.requested
RABBITMQ_WELCOME_KEY=welcome.email

# Flags de execução
APP_WORKER=true             # worker processa fila (via QueueConsumer)
APP_USE_WEBHOOK=false       # quando true, o webhook decide o pagamento (ignora worker)
```

---

## 🗄️ Banco, Migrações & Seed

### Rodar migrações
```bash
# via Docker
docker compose exec api npm run prisma:migrate

# local (fora do Docker), com .env apontando para localhost
npm run prisma:migrate
```

### Gerar Prisma Client (opcional)
```bash
# via Docker
docker compose exec api npx prisma generate

# local
npx prisma generate
```

### Seed de admin
```bash
# via Docker
docker compose exec api npm run seed:admin

# local
npm run seed:admin
```

**Admin padrão (seed):**
- **email:** `admin@enova.dev`
- **senha:** `admin123`

---

## ▶️ Executar localmente (sem Docker)

> Útil para desenvolvimento isolado.

**Pré-requisitos**: Node 18+, npm/pnpm/yarn; Docker para subir DB/Redis/RabbitMQ *ou* serviços nativos instalados.

1) Suba **Postgres/Redis/RabbitMQ** via docker:
```bash
docker run --name enova-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=enova -p 5432:5432 -d postgres:15
docker run --name enova-redis -p 6379:6379 -d redis:7
docker run --name enova-rabbit -p 5672:5672 -p 15672:15672 -d rabbitmq:3-management
```

2) Ajuste **.env** local:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/enova?schema=public
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
APP_PORT=3000
APP_WORKER=true
APP_USE_WEBHOOK=false
```

3) Instale deps e rode
```bash
npm ci        # ou npm install
npm run prisma:migrate
npm run start:dev
# (opcional) worker em outro terminal:
npm run start:worker
```

---

## ⚙️ Execução por flags (Worker x Webhook)

- **APP_WORKER=true** e **APP_USE_WEBHOOK=false** → Worker consome a fila:
  1. `POST /enrollments` publica `payment.requested`
  2. Worker espera ~3-5s, marca `paid` e publica `welcome.email`
  3. EmailService faz **log estruturado**
- **APP_WORKER=false** e **APP_USE_WEBHOOK=true** → Fluxo por webhook (`/webhooks/payment`):
  - Você manda `{ enrollment_id, status: "paid" }` e o sistema marca `paid`

> Não use os dois como `true` ao mesmo tempo (o esperado é escolher **um caminho**).

---

## 🔐 Auth & RBAC (resumo)

- `POST /auth/signup` — cria usuário (role **student** por padrão).
- `POST /auth/login` — retorna **JWT**.
- `GET /me` — perfil autenticado.

**Roles:**
- **student** — matricular e listar próprias matrículas.
- **admin** — criar cursos, ver usuários, consultar matrículas de qualquer aluno.

Header:
```
Authorization: Bearer <token>
```

---

## 📚 Cursos (com Cache Redis)

- `POST /courses` (**admin**) — `{ title, slug, price_cents, capacity? }`
- `GET /courses` — `page`, `limit`, `q`, `min_price`, `max_price`
- `GET /courses/{id|slug}` — detalhe

Cache:
- Primeira chamada de uma combinação de filtros → **MISS**
- Próximas chamadas com os **mesmos filtros** → **HIT**

Logs/metrics:
- Logs: `CACHE MISS ...` / `CACHE HIT ...`
- `/metrics`: `cache_courses_misses_total` / `cache_courses_hits_total`

---

## 🎓 Matrículas

- `POST /enrollments` — `{ "course_id": "<id>" }`
  - evita duplicidade (mesmo aluno/curso) → **409/400**
  - respeita `capacity` → **422** se lotado
  - status inicial: **`pending_payment`**
  - publica `payment.requested`

- `GET /students/me/enrollments` — aluno autenticado
- `GET /students/{id}/enrollments` — admin
- `DELETE /enrollments/{id}` — cancela se **`pending_payment`** (aluno dono ou admin)

---

## 💌 Mensageria (RabbitMQ)

Exchange topic: `enova.exchange`  
Routing keys:  
- `payment.requested` (publisher na matrícula)  
- `welcome.email` (publisher após pagamento)

**UI RabbitMQ**: `http://localhost:15672` (guest / guest)

---

## 🔁 Webhook (alternativa)

```bash
curl -X POST http://localhost:3000/webhooks/payment   -H "Content-Type: application/json"   -d '{"enrollment_id":"<ID_DA_MATRICULA>","status":"paid"}'
```

> Requer `APP_USE_WEBHOOK=true` (e o worker **desligado**).

---

## 🧪 Testes

### Unit + Coverage
```bash
npm run test
npm run test:cov
```

### E2E
```bash
npm run test:e2e
```

> Cobertura alvo ≥ **70%**.

---

## 🧰 Scripts úteis (npm)

```bash
npm run start:dev        # Nest dev (API)
npm run start:worker     # Worker (fila) em processo separado
npm run build            # build de produção

npm run prisma:migrate   # migrações (deploy/dev conforme script)
npm run seed:admin       # cria admin padrão

npm run test             # unit
npm run test:cov         # unit + cobertura
npm run test:e2e         # e2e
npm run lint             # lint (se configurado)
```

---

## 🩺 Observabilidade

- `GET /health` → `{ "status":"ok" }`
- `GET /metrics` → Prometheus (default + domínio):
  - `http_requests_total`
  - `http_request_duration_seconds`
  - `cache_courses_hits_total`
  - `cache_courses_misses_total`
  - `queue_events_published_total{type}`
  - `queue_events_consumed_total{type}`

---

## 🧪 Coleção Insomnia (opcional)

Se existir `enova-insomnia.json` no repo, basta importar.  
Variáveis comuns na coleção:
- `base_url` = `http://localhost:3000`
- `student_token` / `admin_token`
- `course_id` / `enrollment_id`

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

---

## 🛠️ Troubleshooting

**`P1001 Can't reach database` (Prisma)**
- `docker compose ps` para conferir o serviço **db**
- `DATABASE_URL` no `.env` (host `db` em Docker, `localhost` fora)
- `docker compose exec api npm run prisma:migrate`

**RabbitMQ `ENOTFOUND rabbitmq`**
- Suba o serviço: `docker compose ps`
- `RABBITMQ_URL` → `amqp://rabbitmq:5672` (Docker) ou `amqp://localhost:5672` (local)
- Cheque exchange/queues na UI (15672)

**`UnknownDependenciesException` (Nest)**
- O módulo que **usa** um provider deve **importar** o módulo que o **exporta** (ex.: `WebhooksModule` importa `QueueModule` e `EnrollmentsModule`)

**Cache sem HIT**
- Use **exatamente** os mesmos filtros na listagem
- Verifique `REDIS_URL` e se o serviço está UP

**/metrics sem métricas de domínio**
- Verifique se o `MetricsModule` está importado (ou global)
- Faça algumas requisições antes de consultar `/metrics`

---

## 🗣️ Exemplos rápidos (cURL)

### Signup (student)
```bash
curl -X POST http://localhost:3000/auth/signup   -H "Content-Type: application/json"   -d '{"email":"aluno@enova.dev","name":"Aluno","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"aluno@enova.dev","password":"123456"}'
```

### Criar curso (admin)
```bash
curl -X POST http://localhost:3000/courses   -H "Content-Type: application/json"   -H "Authorization: Bearer <ADMIN_TOKEN>"   -d '{"title":"React Avançado","slug":"react-avancado","price_cents":9900,"capacity":2}'
```

### Listar cursos (cache)
```bash
curl "http://localhost:3000/courses?page=1&limit=10&q=react"
```

### Matricular
```bash
curl -X POST http://localhost:3000/enrollments   -H "Content-Type: application/json"   -H "Authorization: Bearer <STUDENT_TOKEN>"   -d '{"course_id":"<COURSE_ID>"}'
```

### Minhas matrículas
```bash
curl -H "Authorization: Bearer <STUDENT_TOKEN>"   http://localhost:3000/students/me/enrollments
```

---

## 📌 Notas

- Não exponha **secrets** reais em repositórios públicos.
- Rate limiting aplicado em `/auth/login` (TTL/limit configuráveis).
- OWASP básico: validação de input (DTOs), JWT, RBAC, sem SQL injection (Prisma).

---

Bom uso! Qualquer dúvida, abra uma issue com os comandos executados e os logs correspondentes 😉
