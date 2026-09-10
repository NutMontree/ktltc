/**
 * Seed Master Knowledge Corpus into M1 Knowledge Base (MongoDB)
 * Covers:
 * 1. Programmer: Web (Front/Back), Mobile (iOS/Android), Systems, Game, Software Engineering, QA/Tester
 * 2. Engineering: Civil, Mechanical, Electrical, Computer, Industrial, Chemical
 * 3. Networking: Protocols, Switching/VLAN, Routing/OSPF/BGP, Firewall, Hardware Repair (UTP, Fiber, Splicing, Console, PoE), Troubleshooting, KTLTC Architecture
 */

const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://admin:ktltc%4033110@127.0.0.1:27017/ktltc_db?authSource=admin";

const MASTER_KNOWLEDGE = [
  // =========================================================================
  // 1. PROGRAMMER & SOFTWARE DEVELOPMENT
  // =========================================================================
  {
    topic: "Programmer: Web Developer (Front-End & Back-End Architecture)",
    content: `วิศวกรรมการพัฒนาเว็บแอปพลิเคชันแบ่งเป็น 2 ส่วนหลัก:
1. Front-End (ส่วนติดต่อผู้ใช้):
   - เทคโนโลยีหลัก: HTML5, CSS3, JavaScript (ESNext), TypeScript
   - Frameworks & UI: React 19, Next.js (App Router, Server Components), Vue.js, Tailwind CSS
   - สถาปัตยกรรม: State Management (Zustand, Redux Toolkit), Client-side Routing, React Query / SWR สำหรับ Caching
   - ประสิทธิภาพและมาตรฐาน: Core Web Vitals (LCP, FID/INP, CLS), Responsive Web Design, Web Accessibility (WCAG 2.1 / a11y), SEO Optimization
2. Back-End (ระบบหลังบ้านและการประมวลผล):
   - ภาษาและรันไทม์: Node.js (V8 Engine), Go (Goroutines/High Concurrency), Python (FastAPI, Django)
   - API Design: RESTful API (HTTP Verbs, Idempotency, Status Codes), GraphQL (Queries, Mutations), gRPC (Protobuf สำหรับ Microservices)
   - ฐานข้อมูล: Relational (PostgreSQL, MySQL พร้อม Indexing, Transaction ACID) และ NoSQL (MongoDB Document Model, Redis Key-Value Cache)
   - ความปลอดภัย: JWT (JSON Web Tokens), OAuth 2.0 / OpenID Connect, CSRF Protection, Rate Limiting, CORS, OWASP Top 10 Prevention`,
    tags: ["programmer", "web_developer", "frontend", "backend", "nextjs", "react", "nodejs", "database", "api"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Programmer: Mobile App Developer (iOS & Android Native & Cross-Platform)",
    content: `การพัฒนาแอปพลิเคชันสำหรับอุปกรณ์เคลื่อนที่:
1. iOS Development (Apple Ecosystem):
   - ภาษาและเครื่องมือ: Swift, SwiftUI (Declarative UI), UIKit, Xcode IDE
   - สถาปัตยกรรม: MVVM (Model-View-ViewModel), Clean Swift Architecture, Combine / Swift Concurrency (async/await)
   - ระบบจัดเก็บและ API: CoreData, SwiftData, URLSession, Push Notifications ผ่าน APNs
   - Deployment: App Store Connect, TestFlight, การจัดการ Signing & Provisioning Profiles
2. Android Development (Google Ecosystem):
   - ภาษาและเครื่องมือ: Kotlin, Jetpack Compose, Android Studio
   - สถาปัตยกรรม: MVVM, Android Architecture Components (ViewModel, LiveData, Flow, Navigation)
   - ระบบจัดเก็บและเน็ตเวิร์ก: Room Database, Retrofit 2, Coroutines, WorkManager
   - Deployment: Google Play Console, AAB (Android App Bundle), Target SDK 34+
3. Cross-Platform Solutions:
   - Flutter: ภาษา Dart, Skia / Impeller Rendering Engine, Widget Tree, BLoC / Riverpod State Management
   - React Native: TypeScript, Fabric Architecture, JSI (JavaScript Interface), TurboModules
   - ข้อควรระวัง: Offline-First Architecture, Local SQLite Sync, Biometric Auth (FaceID / Fingerprint)`,
    tags: ["programmer", "mobile_developer", "ios", "android", "swift", "kotlin", "flutter", "react_native"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Programmer: System Programmer (ระบบปฏิบัติการ, Low-Level & Kernel)",
    content: `การพัฒนาซอฟต์แวร์ระดับระบบ (System Programming):
1. ภาษาคอมไพเลอร์ระดับล่าง:
   - C (C11/C17/C23): ควบคุมฮาร์ดแวร์โดยตรง, Memory Pointers, Manual Memory Allocation (malloc, free)
   - C++ (C++20/C++23): RAII (Resource Acquisition Is Initialization), Smart Pointers (unique_ptr, shared_ptr), Zero-cost Abstractions
   - Rust: Memory Safety รับประกันความปลอดภัยของหน่วยความจำโดยไม่ต้องมี Garbage Collector ผ่านระบบ Ownership, Borrow Checker, Lifetimes
2. ระบบปฏิบัติการและ Kernel Internals (Linux/POSIX):
   - Process & Thread Management: System calls (fork, execve, waitpid, clone), Thread Scheduling (CFS), Thread Synchronization (Mutex, Semaphore, Spinlock, Conditional Variables)
   - Memory Management: Virtual Memory Architecture, MMU, Paging, Page Tables, Stack vs Heap, การป้องกัน Segmentation Fault และ Memory Leaks (ใช้ Valgrind, AddressSanitizer)
   - I/O & Networking Subsystems: POSIX File Descriptors, Non-blocking I/O, Event-driven I/O Multiplexing (select, poll, epoll, io_uring)
   - Device Drivers & Kernel Modules: การเขียน LKM (Loadable Kernel Modules), Interrupt Handling (Top-half/Bottom-half), Character & Block Drivers`,
    tags: ["programmer", "system_programmer", "c", "cpp", "rust", "linux_kernel", "posix", "memory_management", "os"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Programmer: Game Programmer (ฟิสิกส์, Shaders, AI และ Game Loop)",
    content: `การพัฒนาวิดีโอเกมและระบบประมวลผลอินเทอร์แอคทีฟ:
1. แกนหลักของเกม (Game Engine Core):
   - Game Loop Pattern: การแยกวงรอบ Input Processing -> Update Physics/Logic (Fixed Timestep) -> Render Frame (Variable Timestep)
   - Game Architecture: Entity-Component-System (ECS) เพื่อเพิ่ม Data Locality และ Cache Friendly, Scene Graph, Object Pooling
2. คณิตศาสตร์และฟิสิกส์ในเกม (Game Physics & Mathematics):
   - พีชคณิตเชิงเส้น: เวกเตอร์ 2D/3D (Dot Product, Cross Product, Normalization), เมทริกซ์การแปลงสภาพ (Translation, Rotation, Scale), ควอเทอร์เนียน (Quaternions เพื่อแก้ปัญหา Gimbal Lock)
   - การตรวจจับการชน (Collision Detection): Bounding Volumes (AABB, OBB, Bounding Sphere), Separating Axis Theorem (SAT), Raycasting
   - ฟิสิกส์วัตถุแข็ง (Rigid Body Dynamics): แรงโน้มถ่วง, แรงเสียดทาน, โมเมนตัม, การสะท้อนกลับ (Elastic/Inelastic Collisions)
3. Shaders และ Graphics Programming:
   - กราฟิกไปป์ไลน์: Vertex Shader, Rasterization, Fragment/Pixel Shader
   - Shading Languages: GLSL, HLSL, WGSL บน APIs เช่น Vulkan, DirectX 12, Metal, OpenGL
   - เทคนิคแสงเงา: PBR (Physically Based Rendering), Phong Illumination, Shadow Mapping, Normal Mapping
4. Game AI (ปัญญาประดิษฐ์ในเกม):
   - Pathfinding: A* Search Algorithm, Dijkstra, Navigation Mesh (NavMesh) Generation
   - พฤติกรรมตัวละคร: Finite State Machines (FSM), Behavior Trees, Utility AI, Goal-Oriented Action Planning (GOAP)`,
    tags: ["programmer", "game_programmer", "game_engine", "physics", "shaders", "game_ai", "a_star", "graphics"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Programmer: Software Engineer (สถาปัตยกรรมระบบ, Design Patterns & DevOps)",
    content: `วิศวกรรมซอฟต์แวร์ระดับมืออาชีพและการออกแบบระบบขนาดใหญ่:
1. หลักการออกแบบซอฟต์แวร์ (Software Design Principles):
   - SOLID Principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
   - Design Patterns (Gang of Four):
     * Creational: Singleton, Factory Method, Abstract Factory, Builder
     * Structural: Adapter, Decorator, Facade, Proxy
     * Behavioral: Observer, Strategy, Command, State
   - Architectural Styles: Monolithic, Modular Monolith, Microservices, Event-Driven Architecture, Hexagonal / Ports and Adapters, Domain-Driven Design (DDD)
2. การออกแบบระบบรองรับผู้ใช้จำนวนมหาศาล (System Design & Scalability):
   - Horizontal Scaling vs Vertical Scaling, Load Balancing (Round Robin, Least Connections, IP Hash)
   - Caching Strategies: Cache-Aside, Write-Through, Write-Back, Cache Invalidation, Redis Cluster
   - Message Queues & Streaming: Apache Kafka, RabbitMQ, Event Sourcing, CQRS Pattern
   - ฐานข้อมูลขั้นสูง: Database Sharding, Read Replicas, CAP Theorem, Database Index B-Tree / LSM-Tree
3. DevOps & CI/CD:
   - Containerization: Docker (Multi-stage Builds, Container Security)
   - Orchestration: Kubernetes (Pods, Services, Ingress, Deployments, ConfigMaps)
   - CI/CD Pipelines: Automated Testing, Static Analysis, Artifact Building, Zero-Downtime Deployment (Blue-Green, Canary)`,
    tags: ["programmer", "software_engineer", "system_design", "solid", "design_patterns", "microservices", "devops", "docker"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Programmer: Software Tester & QA (Quality Assurance, Automation Testing)",
    content: `การประกันคุณภาพซอฟต์แวร์และการทดสอบระบบ:
1. พีระมิดการทดสอบ (The Testing Pyramid):
   - Unit Testing: ทดสอบระดับฟังก์ชัน/คลาสโดดเดี่ยว รวดเร็ว ต้นทุนต่ำ (Jest, Vitest, PyTest, JUnit)
   - Integration Testing: ทดสอบการทำงานร่วมกันระหว่างโมดูล, ฐานข้อมูล, หรือ External APIs
   - End-to-End (E2E) Testing: จำลองพฤติกรรมผู้ใช้จริงตั้งแต่หน้าเว็บจนถึงหลังบ้าน (Playwright, Cypress, Selenium)
2. วิธีการและกระบวนการทดสอบ (Testing Methodologies):
   - Test-Driven Development (TDD): เขียน Test ให้ Fail -> เขียน Code ให้ Pass -> Refactor Code
   - Behavior-Driven Development (BDD): กำหนด Scenario ด้วยภาษาทางธุรกิจ Given-When-Then (Cucumber)
   - Black-Box Testing (Equivalence Partitioning, Boundary Value Analysis) vs White-Box Testing (Code Coverage, Branch Coverage, Mutation Testing)
3. การทดสอบแบบไม่เกี่ยวกับฟังก์ชัน (Non-Functional Testing):
   - Performance & Load Testing: การทดสอบขีดจำกัดระบบ, Stress Testing, Spike Testing (k6, Apache JMeter, Locust)
   - Security Testing: Dynamic Application Security Testing (DAST), Static Application Security Testing (SAST - SonarQube), OWASP ZAP
   - Bug Life Cycle: New -> Assigned -> Open -> Fixed -> Pending Retest -> Verified -> Closed`,
    tags: ["programmer", "software_tester", "qa", "tdd", "e2e", "cypress", "playwright", "load_testing", "k6"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },

  // =========================================================================
  // 2. ENGINEERING DISCIPLINES (สาขาวิชาหลักทางวิศวกรรมศาสตร์)
  // =========================================================================
  {
    topic: "Engineering: วิศวกรรมโยธา (Civil Engineering - โครงสร้าง, วัสดุ, บริหารการก่อสร้าง)",
    content: `หลักการและองค์ความรู้ทางวิศวกรรมโยธา:
1. การวิเคราะห์และออกแบบโครงสร้าง (Structural Analysis & Design):
   - กลศาสตร์วิศวกรรม (Engineering Mechanics): สถิตยศาสตร์ (Statics), ความแข็งแรงของวัสดุ (Strength of Materials), แรงดัด (Bending Moment), แรงเฉือน (Shear Force), การโก่งตัว (Deflection)
   - การออกแบบคอนกรีตเสริมเหล็ก (RC Design): ตามมาตรฐาน WSD (Working Stress Design) และ SDM (Strength Design Method - ACI 318 / วสท.), พฤติกรรมของเหล็กข้ออ้อยและคอนกรีตรับแรงอัด-แรงดึง
   - โครงสร้างเหล็ก (Structural Steel Design): AISC Standard, การเชื่อมต่อแบบสลักเกลียว (Bolted) และแบบเชื่อม (Welded), เสาและคานเหล็กรูปพรรณ
2. วิศวกรรมปฐพีและฐานราก (Geotechnical & Foundation Engineering):
   - กลศาสตร์ดิน (Soil Mechanics): การจำแนกชนิดดิน, การบดอัดดิน (Compaction), แรงเฉือนของดิน, แรงดันดินด้านข้าง (Lateral Earth Pressure)
   - ฐานราก (Foundations): ฐานรากแผ่ (Shallow Foundation) และฐานรากเสาเข็ม (Deep Foundation - เข็มตอก, เข็มเจาะ), การทดสอบการรับน้ำหนักเสาเข็ม (Pile Load Test, Dynamic Load Test)
3. การบริหารงานก่อสร้างและการสำรวจ (Construction Management & Surveying):
   - การวางแผนงาน: Critical Path Method (CPM), แผนภูมิ Gantt Chart, การจัดสรรทรัพยากร, การควบคุมต้นทุนและเวลา
   - เทคโนโลยี BIM (Building Information Modeling): การจำลองโมเดล 3D/4D/5D ด้วย Revit เพื่อลด Clash Detection
   - การสำรวจ (Surveying): การใช้กล้องระดับ (Leveling), กล้องวัดมุมและ Total Station, พิกัด GNSS / RTK ในการวางผังอาคารและถนน`,
    tags: ["engineering", "civil_engineering", "structures", "concrete", "soil_mechanics", "foundation", "bim", "surveying"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Engineering: วิศวกรรมเครื่องกล (Mechanical Engineering - ความร้อน, ของไหล, เครื่องยนต์, ออกแบบ)",
    content: `หลักการและองค์ความรู้ทางวิศวกรรมเครื่องกล:
1. อุณหพลศาสตร์และการถ่ายเทความร้อน (Thermodynamics & Heat Transfer):
   - กฎของอุณหพลศาสตร์: กฎข้อที่ 1 (อนุรักษ์พลังงาน), กฎข้อที่ 2 (เอนโทรปีและทิศทางของกระบวนการ), วัฏจักรการ์โนต์ (Carnot Cycle)
   - การถ่ายเทความร้อน: การนำความร้อน (Conduction - Fourier's Law), การพาความร้อน (Convection - Newton's Law of Cooling), การแผ่รังสีความร้อน (Radiation - Stefan-Boltzmann Law)
   - ระบบปรับอากาศและทำความเย็น (HVAC): วัฏจักรการอัดไอ (Vapor Compression Cycle: คอมเพรสเซอร์, คอนเดนเซอร์, วาล์วลดความดัน, อีวาพอเรเตอร์), ชิลเลอร์ (Chiller), การออกแบบท่อลมและโหลดทำความเย็น (Cooling Load Calculation)
2. กลศาสตร์ของไหลและเครื่องจักรกลของไหล (Fluid Mechanics & Turbomachinery):
   - พฤติกรรมของไหล: สมการความต่อเนื่อง (Continuity Equation), สมการแบร์นูลลี (Bernoulli's Equation), ตัวเลขเรย์โนลด์ (Laminar vs Turbulent Flow)
   - การออกแบบท่อและปั๊ม: การสูญเสียแรงดันในท่อ (Major/Minor Losses - Darcy-Weisbach), การเลือกปั๊มน้ำตามกราฟสมรรถนะ (Pump Performance Curve) และค่า NPSH (ป้องกัน Cavitation)
   - ระบบไฮดรอลิกส์และนิวแมติกส์: วาล์วควบคุมทิศทาง (Directional Control Valve), กระบอกสูบ, ปั๊มไฮดรอลิก, แรงดันน้ำมันและลมอัดในโรงงาน
3. การออกแบบทางกลและเครื่องยนต์ (Machine Design & Engines):
   - ทฤษฎีความเสียหาย (Failure Theories - Von Mises, Tresca), การล้าของโลหะ (Fatigue Life), ปัจจัยความปลอดภัย (Safety Factor)
   - ชิ้นส่วนเครื่องจักรกล: เพลา (Shafts), แบริ่ง (Bearings), เฟือง (Gears), สายพาน, สปริง
   - เครื่องยนต์สันดาปภายใน (ICE): วัฏจักรอ็อตโต (เครื่องยนต์เบนซิน 4 จังหวะ: ดูด-อัด-ระเบิด-คาย), วัฏจักรดีเซล, ระบบฉีดน้ำมันเชื้อเพลิง Common Rail`,
    tags: ["engineering", "mechanical_engineering", "thermodynamics", "fluid_mechanics", "hvac", "machine_design", "hydraulics", "engines"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Engineering: วิศวกรรมไฟฟ้า (Electrical Engineering - ไฟฟ้ากำลัง, หม้อแปลง, ตู้ MDB, ควบคุม)",
    content: `หลักการและองค์ความรู้ทางวิศวกรรมไฟฟ้า:
1. ทฤษฎีวงจรและระบบไฟฟ้ากำลัง (Circuit Theory & Power Systems):
   - ทฤษฎีพื้นฐาน: กฎของโอห์ม (V=IR), กฎของเคอร์ชอฟฟ์ (KCL/KVL), ไฟฟ้ากระแสตรง (DC) และกระแสสลับ (AC)
   - ระบบไฟฟ้า 3 เฟส 4 สาย (380V/220V 50Hz): การต่อแบบ Star (Y) และ Delta (Δ), การคำนวณกำลังไฟฟ้าจริง (kW), กำลังไฟฟ้าเสมือน (kVA), และกำลังไฟฟ้ารีแอกทีฟ (kVAR)
   - ตัวประกอบกำลัง (Power Factor - PF): การปรับปรุงค่า PF ให้มากกว่า 0.85 ด้วย Capacitor Bank เพื่อลดค่าปรับจากการไฟฟ้า
2. หม้อแปลงไฟฟ้าและระบบจ่ายไฟอาคาร (Transformers & Power Distribution):
   - หม้อแปลงไฟฟ้ากำลัง (Distribution Transformer): ชนิดน้ำมัน (Oil-immersed) และชนิดแห้ง (Dry-type Cast Resin), อัตราส่วนแรงดัน, แทปปรับแรงดัน (Tap Changer)
   - ตู้สวิตช์บอร์ดหลัก (MDB - Main Distribution Board): เบรกเกอร์ประธาน (Air Circuit Breaker - ACB, Molded Case Circuit Breaker - MCCB), บัสบาร์ทองแดง (Busbar Sizing)
   - ระบบสายดินและป้องกันฟ้าผ่า (Grounding & Lightning Protection): ค่าความต้านทานดินตามมาตรฐาน วสท. ไม่เกิน 5 โอห์ม, แท่งกราวด์ร็อด (Ground Rod Copper-bonded), ระบบล่อฟ้าฟาราเดย์ (Faraday Cage) หรือ ESE
3. ระบบควบคุมอัตโนมัติและอิเล็กทรอนิกส์ (Industrial Automation & Controls):
   - มอเตอร์ไฟฟ้าและการควบคุม: มอเตอร์เหนี่ยวนำ 3 เฟส (Induction Motor), การสตาร์ทแบบ Direct-On-Line (DOL), Star-Delta, ซอฟต์สตาร์ทเตอร์ (Soft Starter), และการควบคุมความเร็วรอบด้วย VFD (Variable Frequency Drive / Inverter)
   - PLC & Relay Control: Programmable Logic Controllers, การเขียนโปรแกรม Ladder Diagram, วงจรควบคุม Magnetic Contactor และ Overload Relay
   - แหล่งจ่ายไฟสำรอง: ระบบ UPS (True Online Double Conversion) สำหรับห้อง Server, เครื่องกำเนิดไฟฟ้าฉุกเฉิน (Diesel Generator) และสวิตช์สลับแหล่งจ่ายอัตโนมัติ (ATS - Automatic Transfer Switch)`,
    tags: ["engineering", "electrical_engineering", "power_systems", "transformer", "mdb", "grounding", "vfd", "plc", "ups"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Engineering: วิศวกรรมคอมพิวเตอร์ (Computer Engineering - ฮาร์ดแวร์, ชิปประมวลผล, Embedded, IoT)",
    content: `หลักการและองค์ความรู้ทางวิศวกรรมคอมพิวเตอร์:
1. การออกแบบวงจรดิจิทัลและสถาปัตยกรรมคอมพิวเตอร์ (Digital Logic & Computer Architecture):
   - วงจรตรรกะดิจิทัล: พีชคณิตบูลีน, ลอจิกเกต (AND, OR, NOT, NAND, NOR, XOR), วงจรเชิงจัดหมู่ (Multiplexer, Decoder, ALU), วงจรเชิงลำดับ (Flip-Flops, Registers, Counters, Finite State Machine - FSM)
   - สถาปัตยกรรมโปรเซสเซอร์: Von Neumann Architecture vs Harvard Architecture, สถาปัตยกรรมคำสั่ง (ISA: x86_64, ARM Cortex, RISC-V Open Standard)
   - CPU Pipeline & Memory Hierarchy: การทำงานของ Pipeline (Fetch, Decode, Execute, Memory, Write-back), ปัญหา Hazards (Data, Control, Structural), หน่วยความจำแคช (L1, L2, L3 Cache, Cache Coherence MESI Protocol)
2. ระบบสมองกลฝังตัวและอุปกรณ์ IoT (Embedded Systems & IoT):
   - ไมโครคอนโทรลเลอร์: Architecture ของ ARM Cortex-M, ESP32 (Wi-Fi/BLE), STM32, AVR (Arduino)
   - บัสสื่อสารระดับฮาร์ดแวร์:
     * UART: Serial Asynchronous สองสาย (TX/RX), กำหนด Baud Rate
     * I2C: Synchronous Two-Wire (SDA/SCL), รองรับ Multi-device ผ่าน 7-bit Address
     * SPI: Synchronous High-Speed 4-Wire (MOSI, MISO, SCK, CS/SS)
     * CAN Bus: Differential Signaling ทนสัญญาณรบกวนสูง ใช้ในรถยนต์และอุตสาหกรรม
   - ระบบปฏิบัติการเวลาจริง (RTOS): FreeRTOS, การจัดลำดับงานแบบ Preemptive Priority Scheduling, Tasks, Queues, Semaphores
3. การประมวลผล AI และฮาร์ดแวร์เร่งความเร็ว (Hardware AI Acceleration):
   - สถาปัตยกรรม GPU (CUDA Cores, Tensor Cores), NPU (Neural Processing Unit), TPU
   - เทคนิค Model Optimization: Quantization (FP32 -> FP16 -> INT8 -> INT4 GGUF/AWQ), Pruning, Knowledge Distillation เพื่อรันโมเดลบน Edge Devices`,
    tags: ["engineering", "computer_engineering", "digital_logic", "risc_v", "arm", "embedded", "iot", "i2c", "spi", "rtos"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Engineering: วิศวกรรมอุตสาหการ (Industrial Engineering - การผลิต, Lean, Six Sigma, โลจิสติกส์)",
    content: `หลักการและองค์ความรู้ทางวิศวกรรมอุตสาหการ:
1. การผลิตแบบลีนและการปรับปรุงงาน (Lean Manufacturing & Productivity):
   - การกำจัดความสูญเปล่า 7 ประการ (7 Wastes - TIMWOOD): Transport, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects
   - เสาหลักของ Lean: Just-In-Time (JIT), ไคเซ็น (Kaizen - การปรับปรุงต่อเนื่อง), ระบบคัมบัง (Kanban Pull System), โพคาโยเกะ (Poka-Yoke - ป้องกันข้อผิดพลาดจากมนุษย์), 5ส
   - การศึกษาการทำงาน (Work Study): Time Study (จับเวลาหาเวลามาตรฐาน Standard Time) และ Motion Study (วิเคราะห์การเคลื่อนไหว Therblig เพื่อลดความเมื่อยล้า)
2. การบริหารคุณภาพและซิกส์ซิกมา (Quality Management & Six Sigma):
   - ระเบียบวิธี DMAIC: Define (ระบุปัญหา), Measure (วัดข้อมูล), Analyze (วิเคราะห์สาเหตุ), Improve (ปรับปรุงกระบวนการ), Control (ควบคุมมาตรฐาน)
   - การควบคุมกระบวนการเชิงสถิติ (Statistical Process Control - SPC): แผนภูมิควบคุม (X-bar R Chart, P Chart), ดัชนีความสามารถของกระบวนการ (Process Capability: Cp, Cpk >= 1.33)
   - มาตรฐานสากล: ISO 9001 (ระบบบริหารงานคุณภาพ), ISO 14001 (สิ่งแวดล้อม), ISO 45001 (ความปลอดภัยอาชีวอนามัย)
3. การวิจัยดำเนินงานและการจัดการโลจิสติกส์ (Operations Research & Logistics):
   - แบบจำลองทางคณิตศาสตร์: กำหนดการเชิงเส้น (Linear Programming / Simplex Method) เพื่อหาจุดกำไรสูงสุดหรือต้นทุนต่ำสุด
   - ทฤษฎีแถวคอย (Queuing Theory) สำหรับจัดการคอขวด (Bottleneck Management / Theory of Constraints - TOC)
   - การจัดการสินค้าคงคลัง: Economic Order Quantity (EOQ), Safety Stock, ABC Analysis, Supply Chain Optimization`,
    tags: ["engineering", "industrial_engineering", "lean", "six_sigma", "dmaic", "spc", "kanban", "logistics", "supply_chain"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Engineering: วิศวกรรมเคมี (Chemical Engineering - มวลและพลังงาน, ปฏิกิริยา, การกลั่น, ความปลอดภัย)",
    content: `หลักการและองค์ความรู้ทางวิศวกรรมเคมี:
1. สมดุลมวลและพลังงาน (Mass & Energy Balances):
   - กฎการอนุรักษ์มวล: Inflow - Outflow + Generation - Consumption = Accumulation (สำหรับสถานะคงตัว Steady State ค่าสะสมเป็นศูนย์)
   - กฎการอนุรักษ์พลังงาน: สมดุลเอนทาลปี (Enthalpy Balance), การคำนวณความร้อนแฝง (Latent Heat), ความร้อนจำเพาะ (Sensible Heat), และความร้อนของปฏิกิริยา (Heat of Reaction ΔHr)
2. จลนศาสตร์และเครื่องปฏิกรณ์เคมี (Chemical Reaction Engineering & Kinetics):
   - อัตราการเกิดปฏิกิริยาเคมี: กฎอัตรา (Rate Law), สมการอาร์เรเนียส (Arrhenius Equation), พลังงานกระตุ้น (Activation Energy), บทบาทของตัวเร่งปฏิกิริยา (Catalyst)
   - ประเภทของเครื่องปฏิกรณ์: CSTR (Continuous Stirred-Tank Reactor), PFR (Plug Flow Reactor), Batch Reactor, PBR (Packed Bed Reactor)
3. กระบวนการแยกสารและอุตสาหกรรมปิโตรเคมี (Separation Processes & Petrochemical):
   - การกลั่นลำดับส่วน (Fractional Distillation): จุดสมดุลไอ-ของเหลว (Vapor-Liquid Equilibrium - VLE), กฎของราอูลต์ (Raoult's Law), การคำนวณจำนวนชั้นหอกลั่นด้วยวิธี McCabe-Thiele Method, จุดตัดรีฟลักซ์ (Reflux Ratio)
   - การสกัด (Extraction), การดูดซึม (Absorption), การตกผลึก (Crystallization), การแลกเปลี่ยนความร้อน (Shell-and-Tube Heat Exchanger)
   - อุตสาหกรรมปิโตรเลียม: กระบวนการกลั่นน้ำมันดิบ (Crude Distillation Unit - CDU), การแตกโมเลกุล (Catalytic Cracking), การรีฟอร์มิ่ง (Reforming)
4. การควบคุมกระบวนการและความปลอดภัย (Process Control & Safety):
   - ระบบควบคุมกระบวนการอัตโนมัติ: ลูปควบคุมแบบป้อนกลับ (Feedback Loop), PID Controller (Proportional, Integral, Derivative), Distributed Control System (DCS)
   - การวิเคราะห์ความปลอดภัยในโรงงาน: การชี้บ่งอันตราย HAZOP (Hazard and Operability Study) ด้วย Guide Words (No, More, Less, As well as), วาล์วระบายแรงดันฉุกเฉิน (Pressure Safety Valve - PSV)`,
    tags: ["engineering", "chemical_engineering", "thermodynamics", "reactor_design", "distillation", "petrochemical", "pid", "hazop"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },

  // =========================================================================
  // 3. NETWORKING, HARDWARE, MAINTENANCE & TROUBLESHOOTING
  // =========================================================================
  {
    topic: "Network: สถาปัตยกรรมเครือข่าย, โมเดล OSI และ โปรโตคอลหลัก",
    content: `พื้นฐานและโปรโตคอลระบบเครือข่ายคอมพิวเตอร์:
1. โมเดลอ้างอิง OSI 7 Layers และหน้าที่หลัก:
   - Layer 1 (Physical): ส่งสัญญาณบิตดิบผ่านตัวกลาง (สายทองแดง, แสง Fiber, คลื่นวิทยุ RF)
   - Layer 2 (Data Link): จัดการ Frame, ใช้ฮาร์ดแวร์แอดเดรส (MAC Address 48-bit), ตรวจจับความผิดพลาด (CRC)
   - Layer 3 (Network): จัดการ Packet, หาเส้นทาง (Routing), ใช้ Logical Address (IPv4 32-bit, IPv6 128-bit)
   - Layer 4 (Transport): ส่งข้อมูลแบบ End-to-End, ควบคุม Flow และตัดแบ่ง Segment (TCP มีความน่าเชื่อถือ 3-way handshake, UDP รวดเร็วไร้การเชื่อมต่อ)
   - Layer 5-7 (Session, Presentation, Application): จัดการเซสชัน, แปลงรหัส/เข้ารหัส (SSL/TLS), ให้บริการแอปพลิเคชัน (HTTP/HTTPS, SSH, DNS, DHCP, SNMP)
2. การคำนวณ IP Address และ Subnetting:
   - CIDR (Classless Inter-Domain Routing) และ Subnet Mask (/24 = 255.255.255.0 มี 254 Host, /29 = 255.255.255.248 มี 6 Host)
   - Private IP Address (RFC 1918): Class A (10.0.0.0/8), Class B (172.16.0.0/12), Class C (192.168.0.0/16)
3. โปรโตคอลโครงสร้างพื้นฐาน:
   - ARP (Address Resolution Protocol): แปลง IP เป็น MAC Address
   - DHCP (Dynamic Host Configuration Protocol): ขั้นตอน DORA (Discover, Offer, Request, Acknowledge)
   - DNS (Domain Name System): Recursive Resolver, Root Hints, TLD, Authoritative Nameserver, เรคคอร์ด A, AAAA, CNAME, PTR, MX, TXT`,
    tags: ["networking", "osi_model", "tcp_ip", "subnetting", "arp", "dhcp", "dns", "protocols"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Network: เทคโนโลยีสวิตชิ่ง (L2/L3 Switching, VLANs, STP, LACP)",
    content: `ระบบสวิตช์ในเครือข่ายระดับองค์กร:
1. การทำงานของสวิตช์ L2 และ L3:
   - L2 Switch: ตรวจสอบ Source MAC บันทึกลงตาราง CAM (MAC Address Table), ส่งต่อ Frame ตาม Destination MAC (หากไม่มีจะทำ Unknown Unicast Flooding)
   - L3 Switch (Core/Distribution): มี Routing Engine รองรับ Hardware ASIC Forwarding, ทำ Inter-VLAN Routing ผ่าน Switch Virtual Interface (SVI)
2. เทคโนโลยี VLAN (IEEE 802.1Q):
   - Access Port: ส่งสัญญาณ Untagged ไปยังอุปกรณ์ปลายทาง (PC, Printer)
   - Trunk Port: ใส่ Tag 802.1Q (VLAN ID 1-4094) เพื่อส่งข้อมูลหลาย VLAN ข้ามระหว่างสวิตช์
   - Native VLAN: กำหนด VLAN สำหรับทราฟฟิกที่ไม่มี Tag บนพอร์ต Trunk (ค่าตั้งต้นมักเป็น VLAN 1 ควรเปลี่ยนเพื่อความปลอดภัย)
3. Spanning Tree Protocol (STP) และการป้องกัน Loop:
   - ปัญหาบรอดคาสต์สตอร์ม (Broadcast Storm) จากการต่อสายสวิตช์วนลูป
   - การทำงานของ STP (IEEE 802.1D / Rapid STP 802.1w): การเลือก Root Bridge (จาก Priority ต่ำสุด และ MAC ต่ำสุด), กำหนด Root Port, Designated Port, และ Blocking/Alternate Port
   - คุณสมบัติความปลอดภัย: BPDU Guard (ตัดพอร์ตทันทีหากมีสวิตช์อื่นมาเสียบที่พอร์ต Access), Root Guard, Loop Guard
4. การรวมลิงก์ (Link Aggregation / LACP IEEE 802.3ad):
   - รวมสายสัญญาณหลายเส้นเข้าด้วยกันเพื่อเพิ่มแบนด์วิดท์และสำรองการเชื่อมต่อ (Failover) เช่น Aruba Link Aggregation (LAG) หรือ Cisco EtherChannel`,
    tags: ["networking", "switching", "vlan", "trunk", "stp", "rstp", "lacp", "lag", "core_switch"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Network: การจัดเส้นทางและการรักษาความปลอดภัย (Routing, OSPF, BGP, Firewalls, VPN)",
    content: `การกำหนดเส้นทางและความปลอดภัยเครือข่าย:
1. พื้นฐานการจัดเส้นทาง (Routing Principles):
   - ตารางเราติ้ง (Routing Table): การตัดสินใจเลือกเส้นทางตามหลัก Longest Prefix Match, ค่าน้ำหนักความน่าเชื่อถือ Administrative Distance (AD: Connected=0, Static=1, OSPF=110, BGP=20)
   - Default Route: 0.0.0.0/0 ชี้ไปยัง Next-hop Gateway ของ ISP
2. Dynamic Routing Protocols:
   - OSPF (Open Shortest Path First): Link-State Protocol ใช้ Dijkstra Algorithm, แบ่ง Area (Area 0 Backbone), แลกเปลี่ยน LSA (Link State Advertisement), ปรับตัวเมื่อลิงก์ขาดได้รวดเร็ว
   - BGP (Border Gateway Protocol): Path-Vector Protocol ขับเคลื่อนอินเทอร์เน็ตโลก, จัดการข้าม Autonomous System (AS Number), กำหนด Route Policy ตาม BGP Attributes (AS_PATH, Local Preference, MED)
3. ไฟร์วอลล์และความปลอดภัยระดับองค์กร (Next-Gen Firewalls):
   - Huawei USG Series, Cisco ASA, Fortinet FortiGate
   - สถาปัตยกรรม Security Zones: Trust (เครือข่ายภายใน), Untrust (อินเทอร์เน็ตภายนอก), DMZ (โซนเซิร์ฟเวอร์สาธารณะ)
   - Stateful Packet Inspection & Deep Packet Inspection (DPI): ตรวจสอบสถานะการเชื่อมต่อ TCP State (SYN, ACK, FIN) และเจาะดู Application Layer (ตรวจจับไวรัส, IPS/IDS)
   - การทำ NAT: Source NAT (SNAT / PAT สำหรับแชร์ Public IP ออกเน็ต), Destination NAT / Port Forwarding (DNAT หรือ Server Mapping ให้คนนอกเข้าถึง Server ภายใน)
4. Virtual Private Network (VPN):
   - Site-to-Site IPSec VPN: การเชื่อมต่อระหว่างสาขา เข้ารหัสด้วย AES-256 ผ่าน IKEv2 (Internet Key Exchange Phase 1 & 2)
   - Remote Access SSL VPN: ให้บุคลากรล็อกอินเข้าถึงเครือข่ายองค์กรจากภายนอกอย่างปลอดภัย`,
    tags: ["networking", "routing", "ospf", "bgp", "firewall", "huawei_usg", "nat", "vpn", "ipsec"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Network Hardware & Repair: สายแลน (UTP/STP), การเข้าหัว RJ45 และเครื่องมือซ่อมบำรุง",
    content: `มาตรฐานฮาร์ดแวร์สายทองแดงคู่ตีเกลียวและวิธีการเข้าหัว ซ่อมแซม:
1. ชนิดของสายคู่ตีเกลียว (Twisted Pair Cables):
   - Cat5e: แบนด์วิดท์ 100 MHz ความเร็วสูงสุด 1 Gbps ระยะทาง 100 เมตร
   - Cat6: แบนด์วิดท์ 250 MHz ความเร็วสูงสุด 1 Gbps (100 เมตร) หรือ 10 Gbps (ระยะทางไม่เกิน 37-55 เมตร)
   - Cat6A: แบนด์วิดท์ 500 MHz ความเร็ว 10 Gbps ได้เต็มระยะ 100 เมตร, ฉนวนป้องกันสัญญาณรบกวน (Shielded STP/FTP)
2. มาตรฐานการเรียงสีหัวต่อ RJ45 (Modular Plug 8P8C):
   - มาตรฐาน T568B (มาตรฐานที่นิยมใช้ที่สุดในประเทศไทยและเอเชีย):
     1: ขาวส้ม (White-Orange) [Tx+]
     2: ส้ม (Orange) [Tx-]
     3: ขาวเขียว (White-Green) [Rx+]
     4: น้ำเงิน (Blue)
     5: ขาวน้ำเงิน (White-Blue)
     6: เขียว (Green) [Rx-]
     7: ขาวน้ำตาล (White-Brown)
     8: น้ำตาล (Brown)
   - มาตรฐาน T568A: ขาวเขียว, เขียว, ขาวส้ม, น้ำเงิน, ขาวน้ำเงิน, ส้ม, ขาวน้ำตาล, น้ำตาล
   - สายตรง (Straight-Through): เข้าหัวทั้งสองฝั่งเป็นแบบเดียวกัน (B ทั้งคู่) สำหรับต่อ PC -> Switch, Switch -> Router
   - สายไขว้ (Crossover): ฝั่งหนึ่งเป็น A อีกฝั่งหนึ่งเป็น B (ปัจจุบันพอร์ตสมัยใหม่รองรับ Auto-MDIX หมดแล้ว)
3. ขั้นตอนการเข้าหัวและซ่อมแซม:
   - ปลอกฉนวนนอกออกประมาณ 2-3 ซม. คลายเกลียว จัดเรียงสายตามมาตรฐาน T568B รีดให้ตรง
   - ตัดปลายสายให้เรียบเสมอกันเหลือความยาวประมาณ 1.2 - 1.5 ซม. สอดเข้าหัว RJ45 ให้ทองแดงชนปลายสุด และให้ฉนวนนอกถูกหนีบโดยเดือยล็อค
   - ใช้คีมย้ำหัว RJ45 (Crimping Tool) บีบให้แน่นจนฟันทองแดงทะลุฉนวนสัมผัสแกนทองแดงครบ 8 เส้น
4. เครื่องมือทดสอบและอาการเสียพบบ่อย:
   - Network Cable Tester (เครื่องเช็คสายแลน): ไฟ LED 1 ถึง 8 ต้องติดเรียงลำดับพร้อมกันทั้งสองฝั่ง หากไฟไม่ติดแสดงว่าสายขาด (Open), ไฟสลับดวงแสดงว่าเรียงสายผิด (Miswire/Crossed)
   - อาการ Link วิ่งแค่ 100 Mbps แทนที่จะเป็น 1 Gbps: เกิดจากเส้นที่ 4, 5, 7 หรือ 8 ขาดหรือไม่แน่น (100 Mbps ใช้แค่คู่ 1, 2, 3, 6 ส่วน 1000 Mbps ต้องใช้ครบทั้ง 8 เส้น)`,
    tags: ["network_hardware", "cabling", "utp", "cat6", "rj45", "t568b", "cable_repair", "crimping"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Network Hardware & Repair: สายใยแก้วนำแสง (Fiber Optic), SFP Modules และการ Splicing",
    content: `เทคโนโลยีสายใยแก้วนำแสงและเทคนิคการซ่อมแซมบำรุงรักษา:
1. ประเภทของสาย Fiber Optic:
   - Singlemode (SMF - สายสีเหลือง OS1/OS2): แกนคอร์ขนาดเล็ก 9/125 ไมครอน แสงเดินทางในแนวตรง ไร้การกระจายตัวของแสง (No Modal Dispersion) ใช้ความยาวคลื่น 1310nm / 1550nm ส่งสัญญาณระยะไกล (10 - 40+ กิโลเมตร) เหมาะสำหรับสายแบ็คโบนระหว่างอาคารและโครงข่ายภายนอก
   - Multimode (MMF - สายสีส้ม OM1/OM2 หรือ สีฟ้าอมเขียว Aqua OM3/OM4): แกนคอร์ใหญ่ 50/125 หรือ 62.5/125 ไมครอน ใช้แหล่งกำเนิดแสง LED หรือ VCSEL 850nm / 1300nm ระยะทางสั้น (ไม่เกิน 300-550 เมตร) เหมาะสำหรับภายในห้อง Server Data Center
2. โมดูลรับส่งสัญญาณแสง (Transceivers):
   - SFP (1 Gbps) และ SFP+ (10 Gbps) และ QSFP+ (40 Gbps)
   - ประเภทพอร์ต:
     * 10GBASE-SR: Multimode ความยาวคลื่น 850nm ระยะทางสูงสุด 300 เมตร (หัวต่อ LC)
     * 10GBASE-LR: Singlemode ความยาวคลื่น 1310nm ระยะทางสูงสุด 10 กิโลเมตร
     * BiDi (Bidirectional SFP): รับและส่งข้อมูลบนสาย Fiber เพียงเส้นเดียว (Single Core) โดยใช้คนละความยาวคลื่น เช่น TX 1310nm / RX 1490nm
3. เครื่องมือและการต่อสาย Fiber Optic (Splicing):
   - Fusion Splicer (เครื่องสไปรท์สาย): ใช้ประกายไฟอาร์ก (Electric Arc) หลอมละลายปลายแก้วเข้าด้วยกัน ความสูญเสียสัญญาณต่ำมาก (< 0.02 dB)
   - ขั้นตอนการ Splicing:
     1. ปลอกฉนวนและสารเคลือบแก้ว (Buffer & Acrylate Coating) ด้วยคีม Miller Stripper
     2. เช็ดทำความสะอาดแก้วด้วยแอลกอฮอล์บริสุทธิ์ (Isopropyl Alcohol 99%)
     3. ตัดปลายแก้วด้วย Cleaver ให้ได้มุมฉาก 90 องศา (ไม่เกิน 0.5 - 1 องศา)
     4. วางแก้วลงในร่อง V-Groove ของเครื่อง ปรับแนวแกนคอร์อัตโนมัติ และกดเชื่อมต่อ
     5. นำปลอกหดความร้อน (Protection Sleeve) มาอบความร้อนเพื่อหุ้มรอยต่อป้องกันการหัก
4. เครื่องมือวัดและทดสอบความเสียหายของ Fiber:
   - Visual Fault Locator (VFL - ปากกาเลเซอร์สีแดง 650nm): ใช้ยิงแสงมองทะลุเพื่อหาจุดสายหัก สายโค้งงอเกินรัศมี (Micro-bend) หรือหัวต่อชำรุด
   - Optical Power Meter (OPM): วัดค่ากำลังแสง (dBm) ที่ปลายทาง เทียบกับค่ามาตรฐานของ Transceiver
   - OTDR (Optical Time Domain Reflectometer): ปล่อยพัลส์แสงเพื่อวาดกราฟสะท้อนกลับ บอกระยะทางจุดขาด (Fiber Break) และค่าลดทอน (Attenuation) อย่างแม่นยำ`,
    tags: ["network_hardware", "fiber_optic", "singlemode", "multimode", "sfp", "fusion_splicer", "otdr", "vfl", "fiber_repair"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Network Hardware & Repair: การกู้คืนอุปกรณ์สวิตช์, Console Port, Power Supply และ PoE",
    content: `การซ่อมบำรุง รักษา และกู้คืนอุปกรณ์เครือข่ายระดับฮาร์ดแวร์:
1. การเชื่อมต่อผ่าน Console Port และการกู้คืนระบบ (Console Recovery):
   - สายคอนโซล: สาย RJ45 to DB9 หรือ USB to RJ45 (FTDI Chipset)
   - พารามิเตอร์เชื่อมต่อ Serial (PuTTY / SecureCRT): Baud rate 9600, Data bits 8, Parity None, Stop bits 1, Flow Control None (สำหรับ Aruba บางรุ่นอาจใช้ 115200)
   - Password Recovery Procedure:
     * Cisco: รีสตาร์ทสวิตช์ กดปุ่ม Mode ค้างไว้เข้าสู่โหมด \`switch:\` เปลี่ยน Configuration Register เป็น 0x2142 เพื่อบายพาส startup-config แล้วรีบูต
     * Aruba / HP ProCurve: กดปุ่ม Clear ค้างไว้ขณะเปิดเครื่อง หรือเข้า ROMMON
     * Huawei: กด Ctrl+B ตอนบูตเข้า BootROM Menu เพื่อเคลียร์รหัสผ่านคอนโซล
2. แหล่งจ่ายไฟสำรองและโมดูลระบายความร้อน (Power Supply Units & Cooling):
   - Redundant Power Supply (RPS / PSU Dual Modules): สวิตช์ระดับ Core เช่น Aruba 8320 จะมี Power Supply 2 ตัวแบบ Hot-swappable เสียบคนละสายไฟ (UPS ตัวที่ 1 และ UPS ตัวที่ 2) หากตัวใดตัวหนึ่งพัง ไฟจะสลับอัตโนมัติโดยเครื่องไม่ดับ
   - Fan Trays: สวิตช์ระดับ Data Center ทิศทางลมมีทั้งแบบ Front-to-Back และ Back-to-Front หากพัดลมตัวใดความเร็วรอบตกหรือหยุดหมุน ระบบจะส่งแจ้งเตือน SNMP Trap
3. เทคโนโลยี Power over Ethernet (PoE) และการคำนวณกำลังไฟ:
   - PoE (IEEE 802.3af): จ่ายไฟสูงสุด 15.4W ต่อพอร์ต (สำหรับกล้อง CCTV ทั่วไป, IP Phone)
   - PoE+ (IEEE 802.3at): จ่ายไฟสูงสุด 30W ต่อพอร์ต (สำหรับ Access Point Wi-Fi 6, กล้อง PTZ)
   - PoE++ (IEEE 802.3bt Type 3 & 4): จ่ายไฟสูงสุด 60W - 90W (สำหรับอุปกรณ์ Smart Lighting, จอแสดงผล)
   - การบริหารจัดการ PoE Power Budget: ตรวจสอบกำลังไฟรวมของสวิตช์ เช่น 370W หากต่ออุปกรณ์เกินงบประมาณ พอร์ตลำดับหลังๆ จะถูกตัดไฟอัตโนมัติตามค่า Priority`,
    tags: ["network_hardware", "console_port", "password_recovery", "power_supply", "fan_tray", "poe", "poe_plus", "maintenance"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "Network Troubleshooting: ขั้นตอนการวิเคราะห์และแก้ไขปัญหาเครือข่ายตามแนวคิด Bottom-Up",
    content: `ระเบียบวิธีสากลในการแก้ปัญหาเครือข่าย (Troubleshooting Methodology):
1. ระเบียบวิธี Bottom-Up Approach (เริ่มต้นจาก Layer 1 ขึ้นสู่ Layer 7):
   - ตรวจสอบ Layer 1 (Physical):
     * ดูไฟสถานะ Link LED ที่พอร์ตสวิตช์และหลังการ์ดแลน (สีเขียวปกติ, สีส้มกระพริบ, ดับสนิท)
     * สายแลนหลุด หัก คมสายขาด หรือสาย Fiber หักงอเกินพิกัดหรือไม่
   - ตรวจสอบ Layer 2 (Data Link):
     * คำสั่ง \`show interface\` ดูสถานะพอร์ต (Up/Down, Admin Down)
     * ตรวจสอบ Duplex Mismatch (Half-Duplex vs Full-Duplex ส่งผลให้เกิด Late Collisions และความเร็วตกมหาศาล)
     * ตรวจสอบ CRC Errors, Input Errors (สัญญาณรบกวนหรือหัวต่อชำรุด)
     * ตรวจสอบ VLAN Tagging และพอร์ตว่าอยู่ใน VLAN ที่ถูกต้องหรือไม่
     * ตรวจสอบ STP Status ว่าพอร์ตถูก Block อยู่หรือไม่
   - ตรวจสอบ Layer 3 (Network):
     * คำสั่ง Ping:
       1) Ping Loopback 127.0.0.1 (ทดสอบ TCP/IP Stack ในเครื่อง)
       2) Ping IP ตนเอง (ทดสอบการ์ด NIC)
       3) Ping Default Gateway (ทดสอบการเชื่อมต่อไปยังเราเตอร์/สวิตช์)
       4) Ping Public IP 8.8.8.8 (ทดสอบการออกสู่อินเทอร์เน็ตจริง)
     * คำสั่ง Traceroute / Tracert: ดูว่าข้อมูลหลุดที่ Hop ลำดับใดเพื่อชี้เป้าเราเตอร์ที่มีปัญหา
     * ตรวจสอบ IP Conflict (ไอพีชนกัน) และ ARP Table
   - ตรวจสอบ Layer 4 (Transport) และ Layer 7 (Application):
     * ใช้ Telnet หรือ Netcat ทดสอบ TCP Port ปลายทาง เช่น \`nc -zv 192.168.6.3 22\`
     * ใช้ \`nslookup\` หรือ \`dig\` ตรวจสอบการแปลงชื่อโดเมนของ DNS Server
2. การตรวจจับและวิเคราะห์แพ็กเก็ต (Packet Analysis & Wireshark):
   - ตรวจจับ TCP Retransmissions และ Duplicate ACKs (บ่งชี้ Packet Loss ในเส้นทาง)
   - ตรวจจับ Broadcast Storm และ Broadcast Loops (ARP, DHCP Flooding)`,
    tags: ["networking", "troubleshooting", "bottom_up", "ping", "traceroute", "wireshark", "duplex_mismatch", "crc_errors"],
    source: "master_curriculum",
    confidence: 1.0,
    createdAt: new Date(),
  },
  {
    topic: "KTLTC Architecture: โครงสร้างระบบเครือข่ายวิทยาลัยเทคนิคกันทรลักษ์ และคำสั่งควบคุมจริง",
    content: `แผนผังและข้อกำหนดเฉพาะของระบบเครือข่าย วิทยาลัยเทคนิคกันทรลักษ์ (KTLTC):
1. อุปกรณ์แกนหลัก (Core Infrastructure):
   - Firewall: HUAWEI USG6525E (IP: 192.168.6.1) ควบคุม Gateway และความปลอดภัยออกสู่เครือข่ายภายนอก
   - Core Switch: Aruba 8320 (IP: 192.168.6.3) สวิตช์แกนหลัก 10G เชื่อมต่อ Backbone ทั่ววิทยาลัย
   - Distribution/Access: Cisco SG500-28 (IP: 192.168.6.210) ประจำอาคาร 4
   - Switch อาคารช่างยนต์ (IP: 192.168.6.13) เชื่อมต่อผ่าน Core Port 1/1/5
2. แผนผัง VLAN ภายในวิทยาลัย:
   - VLAN 10: ระบบบริหารจัดการเครือข่าย (Management VLAN)
   - VLAN 20: เครือข่ายครูและอาจารย์ (Teachers & Staff)
   - VLAN 30: เครือข่ายห้องเรียนและนักศึกษา (Students & Lab)
   - VLAN 40: ศูนย์ข้อมูลและห้องเซิร์ฟเวอร์ (Server Room & Data Center)
   - VLAN 50: กล้องวงจรปิดรักษาความปลอดภัย (CCTV System)
   - VLAN 60: อินเทอร์เน็ตสาธารณะ (Guest & Wi-Fi Hotspot)
3. กฎเหล็กของระบบและการเข้าถึง:
   - ห้ามสร้างหรือตอบข้อมูลหลอก (NO MOCK DATA) ต้องใช้ข้อมูลสถานะสด (Live Telemetry) ผ่าน ICMP และ SSH เท่านั้น
   - การสั่งการ Aruba 8320 ทำผ่าน SSH ด้วย NodeSSH (admin / Ktltc@33110)
   - คำสั่งตรวจสอบพอร์ตช่างยนต์: \`show interface 1/1/5 brief\` บน Aruba 8320`,
    tags: ["ktltc", "ktltc_network", "aruba_8320", "huawei_usg", "cisco_sg500", "vlan", "server_room"],
    source: "ktltc_system",
    confidence: 1.0,
    createdAt: new Date(),
  },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB at", MONGODB_URI.replace(/:[^:@]+@/, ":****@"));
    const db = client.db("ktltc_db");
    const col = db.collection("m1_knowledge_base");

    // Create Indexes for fast text and regex search
    await col.createIndex({ topic: "text", content: "text", tags: "text" });
    await col.createIndex({ topic: 1 });
    await col.createIndex({ tags: 1 });
    console.log("Indexes created/verified.");

    let insertedCount = 0;
    for (const item of MASTER_KNOWLEDGE) {
      // Upsert by topic
      const res = await col.updateOne(
        { topic: item.topic },
        { $set: item },
        { upsert: true }
      );
      if (res.upsertedCount > 0 || res.modifiedCount > 0) {
        insertedCount++;
        console.log(`+ Ingested: [${item.topic}]`);
      } else {
        console.log(`= Up to date: [${item.topic}]`);
      }
    }

    const total = await col.countDocuments();
    console.log(`\nDone! Total knowledge entries in M1 brain: ${total}`);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
