# Backend Engineering — Learning Landscape (hybrid)

## About this journey
- **Learner context:** A working **machine learning engineer** who already programs well
  (Python, data, some infra/containers/serving) and now wants **comprehensive, systematic
  backend-engineering knowledge**. The trigger: a backend interview whose feedback was
  *"not enough evidence you can design and implement production-ready backend services."*
  So the real target is the **production-readiness muscle** — the breadth (APIs, data,
  distributed systems, reliability, security, ops) **and** the ability to *reason about
  trade-offs out loud* the way senior backend interviews demand. A secondary goal: this
  compounds with ML work, because a production ML system *is* a backend system plus models.
- **Level:** Strong programmer, not a beginner. We start above "what is an API" and aim at
  the systems-thinking and operational judgment that distinguish a *good* backend engineer.
  Math/jargon is fine; we define distributed-systems terms precisely rather than hand-waving.
- **Mode:** **hybrid** — a short ordered *Foundations* spine (mental models everything else
  needs), then a landscape of areas that can be explored with some flexibility, honoring
  prerequisites. It ends with a capstone that ties the field into an interview-ready method
  and a bridge that reframes ML systems as backend systems.
- **How this works:** ROADMAP.md is the plan. Deep-dives are standalone interactive HTML
  pages in `/content`, indexed by `content/manifest.json`, and shown by the app at
  `/index.html` (deployed to GitHub Pages). Each deep-dive is ~15–40 minutes of engaged study
  with at least one genuinely interactive element.

## Structure

The path has seven areas. **Foundations** (1) is an ordered spine — do it first, in order;
everything downstream assumes the request lifecycle, networking, and the concurrency/I-O
model live in your head. After that the areas form a landscape you can traverse with some
freedom, though prerequisites are marked so you never hit a topic unprepared:

- **APIs & Interfaces (2)** — how services expose themselves and talk to each other.
- **Data & Databases (3)** — the heart of most backends: modeling, SQL, indexes, transactions,
  choosing a store, and caching. This area is the deepest because *most* production
  incidents and design trade-offs are ultimately about data.
- **Distributed Systems & Scaling (4)** — what changes once one machine isn't enough:
  replication, partitioning, consistency/consensus, messaging, and distributed transactions.
  This is the area interviewers probe hardest for "have you actually operated this?"
- **Reliability & Operating in Production (5)** — resilience patterns, observability,
  performance/capacity, and deployment. This is literally what "production-ready" means.
- **Security & Quality (6)** — auth, the OWASP-class threats, and testing strategy.
- **Capstone & Bridge (7)** — a repeatable *system-design method* that assembles everything
  into interview- and design-doc-ready reasoning, then a reframing of **ML systems as
  backend systems** to fuse this with your existing expertise.

The dependency backbone: `anatomy-of-a-backend` → networking & concurrency → (data model +
API design) → scaling → replication/partitioning → consistency/consensus → messaging →
distributed transactions; reliability and security thread throughout; the capstone consumes
all of it.

## Sub-topics

### Foundations
1. **Anatomy of a Backend Service** (`anatomy-of-a-backend`)
   - **Covers:** The request lifecycle end to end (client → DNS → load balancer → app server →
     data stores → downstream services → response), the layers of a real service and what each
     is responsible for, stateless vs stateful, and a working definition of *production-ready*
     (reliable, observable, secure, operable, owned). Sets the vocabulary and the mental
     "map" every later topic pins onto.
   - **Prerequisites:** none
   - **Interactive idea:** An animated request-tracer: click "send request" and watch a packet
     travel the layers, with each hop expandable to show what happens (DNS resolve, TLS
     handshake, LB pick, app handler, DB query, cache hit/miss) and where latency accrues.

2. **Networking & Protocols for Backend Engineers** (`networking-for-backend`)
   - **Covers:** TCP vs UDP, the TCP handshake and its cost, TLS termination, DNS, HTTP/1.1
     vs HTTP/2 vs HTTP/3 (head-of-line blocking, multiplexing), connection pooling and
     keep-alive, and the timeouts/retries budget that governs every network call. Why "the
     network is not reliable" is the first fallacy of distributed computing.
   - **Prerequisites:** `anatomy-of-a-backend`
   - **Interactive idea:** A timeline visualizer comparing HTTP/1.1 (serial + head-of-line
     blocking) vs HTTP/2 multiplexing for N resources over one connection, with adjustable
     latency/packet-loss sliders showing total load time.

3. **Concurrency, Threads & Async I/O** (`concurrency-and-io`)
   - **Covers:** Blocking vs non-blocking I/O, threads vs event loops vs async/await,
     thread/connection pools, the C10k problem, CPU-bound vs I/O-bound work, and backpressure.
     Why a single slow downstream can exhaust a thread pool and take down a service. Directly
     relevant to ML serving (GIL, batching, worker models).
   - **Prerequisites:** `anatomy-of-a-backend`
   - **Interactive idea:** A concurrency sandbox: choose a model (thread-per-request pool vs
     event loop), set request rate and per-request I/O wait, and watch throughput, queue depth,
     and tail latency evolve — see pool exhaustion happen live.

### APIs & Interfaces
4. **Designing Clean REST APIs** (`rest-api-design`)
   - **Covers:** Resource modeling, correct HTTP verbs and status codes, idempotency (and
     idempotency keys), pagination strategies (offset vs cursor), filtering, error-contract
     design, and versioning/backward compatibility. What separates an API a team can live with
     from one that generates endless tickets.
   - **Prerequisites:** `networking-for-backend`
   - **Interactive idea:** An interactive API "linter": paste/pick an endpoint design and get
     graded feedback (wrong verb, non-idempotent PUT, leaking 500s, unbounded list) with
     before/after fixes.

5. **Beyond REST: gRPC, GraphQL & Streaming** (`rpc-graphql-streaming`)
   - **Covers:** When REST isn't the right tool — gRPC/protobuf for service-to-service (schema,
     codegen, streaming), GraphQL for client-shaped queries (and the N+1 trap), WebSockets and
     SSE for push. A decision framework for choosing a protocol, and the trade-offs each buys.
   - **Prerequisites:** `rest-api-design`
   - **Interactive idea:** A "pick-the-protocol" decision explorer: answer a few questions
     about a use case (internal vs public, latency, streaming, client diversity) and see which
     protocol the trade-offs favor and *why*, with counter-examples.

### Data & Databases
6. **Relational Data Modeling** (`relational-data-modeling`)
   - **Covers:** Entities, relationships, keys (natural vs surrogate), normalization (1NF–3NF)
     and *deliberate* denormalization, constraints/foreign keys, and modeling one-to-many and
     many-to-many. How a good schema prevents whole classes of bugs.
   - **Prerequisites:** `anatomy-of-a-backend`
   - **Interactive idea:** A schema-design canvas: drag entities and relationships, and watch
     the tool flag anomalies (update/insert/delete anomalies) and suggest normalization steps.

7. **SQL Deep-Dive & Query Performance** (`sql-and-query-performance`)
   - **Covers:** Joins and how they execute, the query planner, reading `EXPLAIN`/`EXPLAIN
     ANALYZE`, common anti-patterns (N+1, SELECT *, functions on indexed columns), and why the
     same query can be milliseconds or minutes. The single most transferable production skill.
   - **Prerequisites:** `relational-data-modeling`
   - **Interactive idea:** A mini query planner: pick a query and table sizes, toggle indexes,
     and watch the chosen plan (seq scan vs index scan vs hash join) and estimated cost change.

8. **Indexes & Storage Engines** (`indexing-and-storage-engines`)
   - **Covers:** How indexes actually work — B-trees vs LSM-trees, clustered vs secondary
     indexes, composite index column order, covering indexes, and the write-amplification vs
     read-latency trade-off that explains why Postgres and Cassandra feel so different.
   - **Prerequisites:** `sql-and-query-performance`
   - **Interactive idea:** A side-by-side visualizer: insert/lookup keys into a B-tree and an
     LSM-tree (memtable → SSTables → compaction), watching structure, read path, and write path.

9. **Transactions, ACID & Isolation Levels** (`transactions-and-isolation`)
   - **Covers:** ACID precisely, the isolation levels (read committed → serializable), the
     anomalies they permit (dirty/non-repeatable reads, phantoms, write skew), MVCC vs locking,
     and deadlocks. The knowledge that prevents silent data corruption under concurrency.
   - **Prerequisites:** `relational-data-modeling`
   - **Interactive idea:** A two-transaction stepper: interleave operations of T1 and T2 at a
     chosen isolation level and watch which anomaly appears (or is prevented), with the actual
     values each transaction sees.

10. **NoSQL & Choosing a Data Store** (`nosql-and-data-stores`)
    - **Covers:** The families — key-value, document, wide-column, graph — their data models and
      access patterns, when they beat a relational DB and when they're a trap, and how to choose
      a store from access patterns rather than hype. Polyglot persistence.
    - **Prerequisites:** `relational-data-modeling`
    - **Interactive idea:** A "match the workload to the store" game: given access patterns and
      constraints, choose a store and get scored with the reasoning behind the best fit.

11. **Caching Strategies** (`caching-strategies`)
    - **Covers:** Why and where to cache, cache-aside vs read-through vs write-through vs
      write-behind, invalidation (the hard part), TTLs, cache stampede/thundering herd and its
      mitigations, and consistency hazards. Redis in practice. The fastest, riskiest speed-up.
    - **Prerequisites:** `anatomy-of-a-backend`
    - **Interactive idea:** A cache simulator: set hit ratio, TTL, and backing-store latency,
      fire a request stream, and watch latency/DB-load — then trigger a stampede and try the
      fixes (locking, jittered TTL, request coalescing).

### Distributed Systems & Scaling
12. **Scaling & Load Balancing** (`scaling-and-load-balancing`)
    - **Covers:** Vertical vs horizontal scaling, why statelessness is what makes horizontal
      scaling possible, load-balancing algorithms (round-robin, least-connections, hashing),
      health checks, sticky sessions, and where shared state has to go when the app tier is
      stateless. Back-of-the-envelope scaling limits.
    - **Prerequisites:** `concurrency-and-io`
    - **Interactive idea:** A load-balancer playground: add/remove backends, choose an algorithm,
      vary per-backend capacity, and watch request distribution, a hot spot forming, and a
      health-check eviction rebalance traffic.

13. **Replication & Partitioning** (`replication-and-partitioning`)
    - **Covers:** Replication (single-leader, multi-leader, leaderless), replication lag and
      read-your-writes, failover; partitioning/sharding strategies (range vs hash), consistent
      hashing, rebalancing, and the hot-partition problem. How data survives one machine.
    - **Prerequisites:** `scaling-and-load-balancing`, `transactions-and-isolation`
    - **Interactive idea:** A consistent-hashing ring: add/remove nodes and virtual nodes and
      watch which keys move (and how few, vs naive modulo hashing), plus a replication-lag
      timeline showing a stale read.

14. **Consistency Models, CAP & Consensus** (`consistency-and-consensus`)
    - **Covers:** The consistency spectrum (linearizable → causal → eventual), what CAP really
      says (and its PACELC refinement), quorums (R + W > N), and consensus (Raft: leader
      election, log replication) — the machinery behind "the cluster agrees." The vocabulary
      interviewers use to probe depth.
    - **Prerequisites:** `replication-and-partitioning`
    - **Interactive idea:** A Raft-in-miniature: a small cluster where you can drop messages
      and kill the leader, watching election, log replication, and how a partition stalls
      progress to preserve safety.

15. **Messaging, Queues & Event-Driven Architecture** (`messaging-and-event-driven`)
    - **Covers:** Async decoupling, queues vs logs (RabbitMQ vs Kafka mental models),
      topics/partitions/consumer groups, delivery semantics (at-most/at-least/exactly-once and
      why exactly-once is subtle), ordering, idempotent consumers, dead-letter queues, and the
      transactional outbox pattern. The backbone of scalable, resilient systems.
    - **Prerequisites:** `scaling-and-load-balancing`
    - **Interactive idea:** A message-flow simulator: producers, a partitioned log, and consumer
      groups; inject a consumer crash and a redelivery and watch duplicates appear — then add an
      idempotency key and see them absorbed.

16. **Distributed Transactions, Sagas & Idempotency** (`distributed-transactions-sagas`)
    - **Covers:** Why cross-service ACID doesn't exist for free, two-phase commit and its costs,
      the saga pattern (orchestration vs choreography, compensating actions), idempotency keys,
      and achieving effective exactly-once via at-least-once + dedup. The senior-interview
      classic: "distributed transactions without 2PC."
    - **Prerequisites:** `consistency-and-consensus`, `messaging-and-event-driven`
    - **Interactive idea:** A saga stepper for an order flow (payment → inventory → shipping):
      trigger a mid-saga failure and watch compensating transactions unwind, contrasted with a
      naive no-compensation version leaving inconsistent state.

### Reliability & Operating in Production
17. **Resilience Patterns** (`resilience-patterns`)
    - **Covers:** Timeouts (always), retries with exponential backoff + jitter, the retry-storm
      hazard, circuit breakers, bulkheads, load shedding, graceful degradation, and idempotency
      as a prerequisite for safe retries. How systems bend instead of break under stress.
    - **Prerequisites:** `scaling-and-load-balancing`
    - **Interactive idea:** A failure-injection dashboard: a service calling a flaky dependency;
      toggle timeout/retry/circuit-breaker/bulkhead and watch how each changes tail latency and
      whether a downstream outage cascades or is contained.

18. **Observability: Logs, Metrics & Traces** (`observability`)
    - **Covers:** The three pillars (structured logs, metrics, distributed traces) and what each
      is for, the RED/USE methods, cardinality pitfalls, SLIs/SLOs/error budgets, and alerting
      on user-facing symptoms rather than noise. How you understand a system you can't see into.
    - **Prerequisites:** `anatomy-of-a-backend`
    - **Interactive idea:** An incident console: a latency spike appears; use logs, a metrics
      dashboard, and a trace waterfall to localize the culprit service — a guided "which signal
      tells you what" diagnostic exercise.

19. **Performance, Profiling & Capacity Planning** (`performance-and-capacity`)
    - **Covers:** Latency vs throughput, percentiles (why p99 matters and averages lie), tail
      latency and fan-out amplification, Little's Law, back-of-the-envelope capacity estimation,
      load testing, and reading a profile/flame graph to find the real bottleneck.
    - **Prerequisites:** `concurrency-and-io`
    - **Interactive idea:** A latency-percentile explorer: generate a request-latency
      distribution, watch how mean vs p50/p95/p99 diverge, and see how fan-out to N services
      makes the *slowest-of-N* dominate the user-visible latency.

20. **Deployment, CI/CD & Release Strategies** (`deployment-and-cicd`)
    - **Covers:** The 12-factor app, containers and why they exist, immutable infrastructure and
      IaC, CI/CD pipelines and quality gates, and safe release strategies (blue-green, canary,
      rolling, feature flags) with fast rollback. Getting change into production without fear.
    - **Prerequisites:** `anatomy-of-a-backend`
    - **Interactive idea:** A rollout simulator: push a bad version and compare blue-green vs
      canary vs rolling — watch error rate, blast radius, and rollback time for each strategy.

### Security & Quality
21. **Authentication & Authorization Done Right** (`auth-and-access`)
    - **Covers:** AuthN vs AuthZ, password hashing (bcrypt/argon2, never plaintext), sessions vs
      tokens, JWT (structure, validation, revocation limits), OAuth2/OIDC flows, API keys, and
      access models (RBAC vs ABAC). The stuff that, done wrong, is the breach.
    - **Prerequisites:** `rest-api-design`
    - **Interactive idea:** An OAuth2 authorization-code flow walkthrough: step through the
      redirects, codes, and token exchange between user, client, auth server, and resource
      server — then a JWT decoder that flags an unvalidated/expired/none-alg token.

22. **Backend Security & the OWASP Top 10** (`backend-security`)
    - **Covers:** Injection (SQL and friends) and parameterized queries, broken access control,
      secrets management (never in code), transport security, input validation and output
      encoding, rate limiting and abuse prevention, and the principle of least privilege. A
      practical threat model for a service.
    - **Prerequisites:** `rest-api-design`
    - **Interactive idea:** A vulnerable-endpoint lab: exploit a SQL-injection and a
      broken-access-control bug in a simulated API, then apply the fix (parameterization,
      authorization check) and watch the exploit stop working.

23. **Testing Backend Systems** (`testing-backend`)
    - **Covers:** The testing pyramid for services, unit vs integration vs contract vs
      end-to-end, test doubles (mock/stub/fake) and when each fits, testing against real
      dependencies (containers), contract testing across services, flakiness, and CI gates.
      How you change code fast *without* breaking production.
    - **Prerequisites:** `rest-api-design`
    - **Interactive idea:** A "place the test" exercise: given a change, decide which layer of
      the pyramid should cover it and why, with feedback on over-mocking and the ice-cream-cone
      anti-pattern.

### Capstone & Bridge
24. **The System Design Method** (`system-design-method`)
    - **Covers:** A repeatable method that assembles the whole roadmap into an answer: clarify
      requirements and constraints → estimate scale (QPS, data, bandwidth) → sketch a high-level
      design → pick data stores and communication → *drill into* one or two components →
      surface bottlenecks and state trade-offs explicitly. Worked end to end on a real prompt
      (e.g. "design a URL shortener / a rate limiter / a news feed"). Directly targets the
      interview gap: showing *evidence* of production-ready design thinking.
    - **Prerequisites:** `scaling-and-load-balancing`, `caching-strategies`,
      `replication-and-partitioning`, `messaging-and-event-driven`
    - **Interactive idea:** A guided design canvas for one prompt: make choices at each stage
      (store, cache, sharding, sync vs async) and get a running critique of the trade-offs and
      the failure modes your choices imply — a rehearsal of the interview conversation.

25. **ML Systems as Backend Systems** (`ml-systems-as-backends`)
    - **Covers:** Reframing everything above for ML in production: model serving as just another
      low-latency service (batch vs online, dynamic batching), feature stores as a
      caching/consistency problem, training-serving skew as a data-consistency bug, pipelines as
      event-driven workflows, and monitoring models with the same observability toolkit. Turns
      your existing ML expertise into evidence of backend judgment.
    - **Prerequisites:** `scaling-and-load-balancing`, `caching-strategies`,
      `messaging-and-event-driven`
    - **Interactive idea:** An inference-service capacity planner: set model latency, batch size,
      and request rate, and watch throughput, queue depth, and p99 — then map each knob back to
      the backend concept (batching = throughput/latency trade-off, queue = backpressure).
