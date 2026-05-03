# SeekhoYaar
SeekhoYaar -AI Learning Saathi




src/
├── config/
│   ├── env.ts
│   ├── database.ts
│   ├── redis.ts
│   ├── swagger.ts
│   └── ai.config.ts
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.model.ts
│   │   └── auth.schema.ts
│   ├── user/
│   │   ├── user.routes.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.model.ts
│   │   └── user.schema.ts
│   ├── student-profile/
│   │   ├── profile.routes.ts
│   │   ├── profile.controller.ts
│   │   ├── profile.service.ts
│   │   ├── profile.repository.ts
│   │   ├── profile.model.ts
│   │   └── profile.schema.ts
│   ├── topic/
│   │   ├── topic.routes.ts
│   │   ├── topic.controller.ts
│   │   ├── topic.service.ts
│   │   ├── topic.repository.ts
│   │   ├── topic.model.ts
│   │   └── topic.schema.ts
│   ├── ai-tutor/
│   │   ├── ai-tutor.routes.ts
│   │   ├── ai-tutor.controller.ts
│   │   ├── ai-tutor.service.ts
│   │   ├── ai-tutor.repository.ts
│   │   ├── ai-tutor.model.ts
│   │   └── ai-tutor.schema.ts
│   ├── progress/
│   │   ├── progress.routes.ts
│   │   ├── progress.controller.ts
│   │   ├── progress.service.ts
│   │   ├── progress.repository.ts
│   │   ├── progress.model.ts
│   │   └── progress.schema.ts
│   └── analytics/
│       ├── analytics.routes.ts
│       ├── analytics.controller.ts
│       ├── analytics.service.ts
│       ├── analytics.repository.ts
│       └── analytics.model.ts
├── ai/
│   ├── agents/
│   │   ├── languageDetector.agent.ts
│   │   ├── questionAnalyzer.agent.ts
│   │   ├── personalization.agent.ts
│   │   └── responseGenerator.agent.ts
│   ├── prompts/
│   │   ├── hinglish.prompt.ts
│   │   └── tutor.prompt.ts
│   └── orchestrator.ts
├── queue/
│   ├── kafka/
│   │   ├── kafka.client.ts
│   │   ├── kafka.producer.ts
│   │   └── kafka.consumer.ts
│   ├── rabbitmq/
│   │   ├── rabbitmq.client.ts
│   │   ├── rabbitmq.producer.ts
│   │   └── rabbitmq.consumer.ts
│   └── queue.types.ts
├── shared/
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── rateLimiter.ts
│   │   ├── requestId.ts
│   │   └── validate.ts
│   ├── utils/
│   │   ├── response.utils.ts
│   │   ├── jwt.utils.ts
│   │   ├── hinglish.utils.ts
│   │   ├── hash.utils.ts
│   │   └── logger.ts
│   ├── errors/
│   │   └── AppError.ts
│   └── types/
│       ├── koa.types.ts
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── app.ts
└── server.ts




Quick Start
# 1. Clone & Install
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your OpenAI API key and DB credentials

# 3. Start Docker services
docker-compose up -d postgres redis rabbitmq

# 4. Run DB migrations
npx prisma migrate dev --name init
npx prisma generate

# 5. Start development server
npm run dev

# 6. Run tests
npm test

# 7. Production with Docker
docker-compose up --build -d


Architecture Summary

Student: "yeh recursion kya hota hai samjhao"
         │
         ▼
[Koa Route] → [authenticate] → [rateLimiter] → [validate(Zod)]
         │
         ▼
[AiTutorController] → extracts ctx.request.body
         │
         ▼
[AiTutorService] → business orchestration
         │
         ├──► [AiTutorRepository] → saves Question(PENDING) to PostgreSQL
         │
         ├──► [AIOrchestrator]
         │         ├── Agent 1: LanguageDetector  → "hinglish" detected
         │         ├── Agent 2: QuestionAnalyzer  → subject: CS, topic: Recursion
         │         ├── Agent 3: PersonalizationAgent → level: beginner, lang: hinglish
         │         └── Agent 4: ResponseGenerator → bilingual explanation via OpenAI
         │
         └──► [AiTutorRepository] → saves AIResponse + updates status ANSWERED
                    │
                    ▼
         ctx.body = { explanation, examples, followUpQuestions }