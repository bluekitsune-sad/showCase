import { createHash } from "node:crypto";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

// Demo password shared by every seeded account. Auth (P04-2) verifies this
// scheme; it is deliberately weak and only for the local SQLite demo.
const DEMO_PASSWORD = "demo1234";
function demoHash(password: string): string {
  return `sha256:${createHash("sha256").update(password).digest("hex")}`;
}
const passwordHash = demoHash(DEMO_PASSWORD);

// Deterministic PRNG so reseeding produces identical data.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261031);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number): number =>
  min + Math.floor(rand() * (max - min + 1));

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

async function main() {
  console.log("Seeding Nexus Business Suite demo data...");

  // Wipe in reverse dependency order.
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.jobOpening.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // --- Departments ---
  const sales = await prisma.department.create({
    data: {
      name: "Sales",
      slug: "sales",
      description: "Pipeline, accounts and revenue.",
    },
  });
  const ops = await prisma.department.create({
    data: {
      name: "Operations",
      slug: "operations",
      description: "Delivery, logistics and internal systems.",
    },
  });
  const people = await prisma.department.create({
    data: {
      name: "People",
      slug: "people",
      description: "Hiring, culture and employee experience.",
    },
  });

  // --- Users (18) ---
  type SeedUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    departmentId: number | null;
  };

  const userSpecs: Omit<SeedUser, "id">[] = [
    { name: "Avery Nakamura", email: "avery@nexus.demo", role: "owner", departmentId: null },
    { name: "Jordan Ellis", email: "jordan@nexus.demo", role: "admin", departmentId: ops.id },
    { name: "Priya Raman", email: "priya@nexus.demo", role: "admin", departmentId: sales.id },
    { name: "Marcus Webb", email: "marcus@nexus.demo", role: "manager", departmentId: sales.id },
    { name: "Elena Voss", email: "elena@nexus.demo", role: "manager", departmentId: ops.id },
    { name: "Samir Haddad", email: "samir@nexus.demo", role: "manager", departmentId: people.id },
    { name: "Nora Kessler", email: "nora@nexus.demo", role: "manager", departmentId: sales.id },
    { name: "Diego Alvarez", email: "diego@nexus.demo", role: "staff", departmentId: sales.id },
    { name: "Hana Suzuki", email: "hana@nexus.demo", role: "staff", departmentId: sales.id },
    { name: "Oliver Brandt", email: "oliver@nexus.demo", role: "staff", departmentId: sales.id },
    { name: "Ivy Okonkwo", email: "ivy@nexus.demo", role: "staff", departmentId: sales.id },
    { name: "Leo Petrov", email: "leo@nexus.demo", role: "staff", departmentId: ops.id },
    { name: "Mia Castellanos", email: "mia@nexus.demo", role: "staff", departmentId: ops.id },
    { name: "Noah Fitzgerald", email: "noah@nexus.demo", role: "staff", departmentId: ops.id },
    { name: "Zara Ahmed", email: "zara@nexus.demo", role: "staff", departmentId: ops.id },
    { name: "Felix Moreau", email: "felix@nexus.demo", role: "staff", departmentId: people.id },
    { name: "Amara Diallo", email: "amara@nexus.demo", role: "staff", departmentId: people.id },
    { name: "Theo Lindqvist", email: "theo@nexus.demo", role: "staff", departmentId: null },
  ];

  const users: SeedUser[] = [];
  for (const spec of userSpecs) {
    const user = await prisma.user.create({
      data: { ...spec, passwordHash },
    });
    users.push(user);
  }
  const byEmail = (email: string) => users.find((u) => u.email === email)!;

  const owner = byEmail("avery@nexus.demo");
  const salesMgr = byEmail("marcus@nexus.demo");
  const opsMgr = byEmail("elena@nexus.demo");
  const peopleMgr = byEmail("samir@nexus.demo");

  // --- Employees (every user is an employee) ---
  const jobTitles: Record<string, string> = {
    "avery@nexus.demo": "Founder & CEO",
    "jordan@nexus.demo": "Head of Operations",
    "priya@nexus.demo": "Head of Sales",
    "marcus@nexus.demo": "Sales Manager",
    "elena@nexus.demo": "Operations Manager",
    "samir@nexus.demo": "People Manager",
    "nora@nexus.demo": "Account Manager",
    "diego@nexus.demo": "Account Executive",
    "hana@nexus.demo": "Account Executive",
    "oliver@nexus.demo": "Sales Development Rep",
    "ivy@nexus.demo": "Sales Development Rep",
    "leo@nexus.demo": "Operations Analyst",
    "mia@nexus.demo": "Logistics Coordinator",
    "noah@nexus.demo": "Systems Administrator",
    "zara@nexus.demo": "Operations Analyst",
    "felix@nexus.demo": "Recruiter",
    "amara@nexus.demo": "People Operations Specialist",
    "theo@nexus.demo": "Support Specialist",
  };
  const salaryByRole: Record<string, number> = {
    owner: 18500000,
    admin: 14500000,
    manager: 12000000,
    staff: 8500000,
  };

  const employeeByUser = new Map<number, { id: number; userId: number; departmentId: number }>();
  for (const user of users) {
    const deptId = user.departmentId ?? ops.id;
    const managerId =
      user.id === owner.id
        ? null
        : user.role === "admin"
          ? null
          : user.role === "manager"
            ? null
            : user.departmentId === sales.id
              ? employeeByUser.get(salesMgr.id)?.id ?? null
              : user.departmentId === people.id
                ? employeeByUser.get(peopleMgr.id)?.id ?? null
                : employeeByUser.get(opsMgr.id)?.id ?? null;
    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        departmentId: deptId,
        jobTitle: jobTitles[user.email] ?? "Team Member",
        managerId,
        hiredAt: daysAgo(int(60, 1400)),
        salaryMinor: salaryByRole[user.role] + int(-80, 80) * 10000,
        status: "active",
      },
    });
    employeeByUser.set(user.id, emp);
  }
  const employees = [...employeeByUser.values()];

  // --- Attendance: last 30 days for every employee ---
  const attendanceRows: {
    employeeId: number;
    date: Date;
    checkIn: Date | null;
    checkOut: Date | null;
    status: string;
  }[] = [];
  for (let day = 0; day < 30; day++) {
    const date = daysAgo(day);
    const weekday = date.getUTCDay();
    for (const emp of employees) {
      if (weekday === 0 || weekday === 6) continue; // weekend
      const roll = rand();
      let status: string;
      let checkIn: Date | null = null;
      let checkOut: Date | null = null;
      if (roll < 0.05) status = "holiday";
      else if (roll < 0.09) status = "leave";
      else if (roll < 0.13) status = "absent";
      else {
        status = roll < 0.35 ? "remote" : "present";
        const inH = int(8, 10);
        const inM = pick([0, 5, 10, 15, 30, 45]);
        checkIn = new Date(date);
        checkIn.setUTCHours(inH, inM, 0, 0);
        checkOut = new Date(date);
        checkOut.setUTCHours(int(16, 18), pick([0, 15, 30, 45]), 0, 0);
      }
      attendanceRows.push({ employeeId: emp.id, date, checkIn, checkOut, status });
    }
  }
  await prisma.attendance.createMany({ data: attendanceRows });

  // --- Leave requests (8) ---
  const leaveSpecs = [
    { email: "diego@nexus.demo", type: "annual", start: daysFromNow(7), end: daysFromNow(11), status: "pending", reason: "Family trip" },
    { email: "hana@nexus.demo", type: "sick", start: daysAgo(3), end: daysAgo(2), status: "approved", reason: "Flu" },
    { email: "leo@nexus.demo", type: "personal", start: daysFromNow(14), end: daysFromNow(15), status: "pending", reason: "Moving apartments" },
    { email: "ivy@nexus.demo", type: "annual", start: daysFromNow(21), end: daysFromNow(28), status: "pending", reason: "Holiday" },
    { email: "oliver@nexus.demo", type: "unpaid", start: daysAgo(10), end: daysAgo(8), status: "rejected", reason: "Extended break" },
    { email: "mia@nexus.demo", type: "annual", start: daysFromNow(3), end: daysFromNow(5), status: "approved", reason: "Wedding" },
    { email: "amara@nexus.demo", type: "sick", start: daysAgo(1), end: daysAgo(1), status: "approved", reason: "Migraine" },
    { email: "noah@nexus.demo", type: "personal", start: daysFromNow(10), end: daysFromNow(10), status: "pending", reason: "Appointment" },
  ];
  for (const spec of leaveSpecs) {
    const user = byEmail(spec.email);
    const emp = employeeByUser.get(user.id)!;
    const decider =
      spec.status === "pending"
        ? null
        : user.departmentId === sales.id
          ? salesMgr.id
          : user.departmentId === people.id
            ? peopleMgr.id
            : opsMgr.id;
    await prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        type: spec.type,
        startDate: spec.start,
        endDate: spec.end,
        status: spec.status,
        reason: spec.reason,
        decidedById: decider,
        decidedAt: spec.status === "pending" ? null : daysAgo(int(1, 5)),
      },
    });
  }

  // --- Job openings (5) + applicants ---
  const openingSpecs = [
    { title: "Senior Account Executive", dept: sales, description: "Own a mid-market book and hit quarterly targets." },
    { title: "Sales Development Rep", dept: sales, description: "Qualify inbound and outbound leads for the AE team." },
    { title: "Operations Analyst", dept: ops, description: "Model delivery capacity and report on SLAs." },
    { title: "Recruiter", dept: people, description: "Run full-cycle recruiting for engineering and sales." },
    { title: "Support Specialist", dept: ops, description: "First-line customer support and escalation routing." },
  ];
  const applicantNames = [
    "Riley Quinn", "Sasha Bergström", "Caleb Osei", "Yuki Tanaka", "Rosa Mendez",
    "Andre Kovacs", "Lena Fischer", "Tariq Rahman", "Bianca Rossi", "Ezra Goldstein",
    "Nadia Petrova", "Owen Clarke", "Fatima Nasser", "Jasper Vu", "Mina Choi",
    "Carlos Vega", "Talia Weiss", "Rohan Mehta",
  ];
  const applicantStages = ["applied", "screening", "interview", "offer", "hired", "rejected"];
  let nameIdx = 0;
  for (const spec of openingSpecs) {
    const opening = await prisma.jobOpening.create({
      data: {
        title: spec.title,
        departmentId: spec.dept.id,
        description: spec.description,
        status: "open",
      },
    });
    const count = int(2, 5);
    for (let i = 0; i < count; i++) {
      const name = applicantNames[nameIdx % applicantNames.length];
      nameIdx++;
      await prisma.applicant.create({
        data: {
          jobOpeningId: opening.id,
          name,
          email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@mail.demo`,
          phone: `+1-555-01${int(10, 99)}`,
          stage: pick(applicantStages),
          appliedAt: daysAgo(int(2, 45)),
        },
      });
    }
  }

  // --- Leads (40) across stages ---
  const companies = [
    "Northwind Analytics", "Baltic Freight", "Copperline Studios", "Harbor & Co",
    "Meridian Labs", "Pinecrest Retail", "Solstice Media", "Ironwood Manufacturing",
    "Bluepeak Software", "Verdant Foods", "Atlas Property Group", "Lumen Health",
    "Quarry Logistics", "Emberline Energy", "Kestrel Insurance", "Thistle Bakery",
    "Onyx Security", "Driftwood Hospitality", "Summit Robotics", "Cobalt Finance",
    "Willow & Fern", "Redstone Mining", "Nimbus Cloud", "Foxglove Pharma",
    "Trailhead Outfitters", "Granite Legal", "Saffron Kitchens", "Aurora Solar",
    "Cinder Media", "Halcyon Travel", "Moss & Timber", "Rivet Hardware",
    "Sable Analytics", "Tidewater Marine", "Juniper Software", "Foxglove Design",
    "Bright Harbor Clinic", "Northgate Academy", "Copperfield Press", "Larkspur Farms",
  ];
  const stageWeights: [string, number][] = [
    ["new", 8], ["contacted", 7], ["qualified", 6], ["proposal", 5],
    ["negotiation", 4], ["won", 6], ["lost", 4],
  ];
  const stagePool: string[] = [];
  for (const [stage, weight] of stageWeights) {
    for (let i = 0; i < weight; i++) stagePool.push(stage);
  }
  const leadSources = ["referral", "website", "outbound", "event", "partner", "other"];
  const salesUsers = users.filter((u) => u.departmentId === sales.id);

  const leads: { id: number; stage: string; ownerId: number | null; valueMinor: number }[] = [];
  for (let i = 0; i < 40; i++) {
    const company = companies[i];
    const stage = pick(stagePool);
    const owner = rand() < 0.85 ? pick(salesUsers) : null;
    const valueMinor = int(5, 480) * 10000;
    const lead = await prisma.lead.create({
      data: {
        name: `${company} — ${pick(["Platform", "Rollout", "Renewal", "Pilot", "Expansion"])}`,
        company,
        email: `hello@${company.toLowerCase().replace(/[^a-z]+/g, "")}.demo`,
        phone: `+1-555-02${int(10, 99)}`,
        source: pick(leadSources),
        stage,
        valueMinor,
        ownerId: owner?.id ?? null,
        createdAt: daysAgo(int(5, 120)),
      },
    });
    leads.push({ id: lead.id, stage, ownerId: owner?.id ?? null, valueMinor });
  }

  // --- Customers (25), some converted from won leads ---
  const wonLeads = leads.filter((l) => l.stage === "won");
  const customers: { id: number }[] = [];
  for (let i = 0; i < 25; i++) {
    const company = companies[i];
    const sourceLead = wonLeads[i] ?? null;
    const customer = await prisma.customer.create({
      data: {
        name: company,
        company,
        email: `accounts@${company.toLowerCase().replace(/[^a-z]+/g, "")}.demo`,
        phone: `+1-555-03${int(10, 99)}`,
        status: rand() < 0.1 ? "at_risk" : rand() < 0.04 ? "churned" : "active",
        sourceLeadId: sourceLead?.id ?? null,
        createdAt: daysAgo(int(20, 500)),
      },
    });
    customers.push({ id: customer.id });

    const contactCount = int(1, 3);
    const contactFirst = ["Alex", "Blair", "Casey", "Devon", "Emery", "Finley", "Gray", "Harper"];
    const contactLast = ["Ainsworth", "Blackwood", "Carrington", "Dunlap", "Everett", "Fairbanks"];
    for (let c = 0; c < contactCount; c++) {
      const first = pick(contactFirst);
      const last = pick(contactLast);
      await prisma.contact.create({
        data: {
          customerId: customer.id,
          name: `${first} ${last}`,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]+/g, "")}.demo`,
          phone: `+1-555-04${int(10, 99)}`,
          title: pick(["CEO", "COO", "Head of IT", "Finance Lead", "Operations Manager", "Procurement"]),
          isPrimary: c === 0,
        },
      });
    }
  }

  // --- Notes on leads and customers ---
  const noteBodies = [
    "Left voicemail; follow up early next week.",
    "Budget confirmed for this quarter — decision maker is the COO.",
    "Competitor mentioned in the last call; position on support SLAs.",
    "Wants a pilot with two teams before signing.",
    "Renewal at risk — usage dropped after the last release.",
    "Happy with onboarding; open to an expansion conversation.",
    "Legal reviewing the MSA; expect redlines by Friday.",
    "Champion moved roles; need a new contact.",
  ];
  for (const lead of leads.slice(0, 18)) {
    await prisma.note.create({
      data: {
        body: pick(noteBodies),
        authorId: lead.ownerId ?? salesMgr.id,
        leadId: lead.id,
        createdAt: daysAgo(int(1, 30)),
      },
    });
  }
  for (const customer of customers.slice(0, 12)) {
    await prisma.note.create({
      data: {
        body: pick(noteBodies),
        authorId: pick(salesUsers).id,
        customerId: customer.id,
        createdAt: daysAgo(int(1, 30)),
      },
    });
  }

  // --- Projects + Tasks (60) ---
  const projectSpecs = [
    { name: "Q4 Pipeline Push", description: "Close the top 10 negotiation-stage deals before year end." },
    { name: "Warehouse Reslayout", description: "Re-slot the main warehouse for faster pick paths." },
    { name: "Onboarding Revamp", description: "Cut new-hire ramp time from 6 weeks to 4." },
    { name: "Support Tiering", description: "Introduce severity tiers and escalation paths." },
    { name: "CRM Cleanup", description: "Deduplicate accounts and fix ownership gaps." },
  ];
  const projects: { id: number }[] = [];
  for (const spec of projectSpecs) {
    const project = await prisma.project.create({
      data: {
        ...spec,
        status: pick(["planning", "active", "active", "on_hold", "completed"]),
        startDate: daysAgo(int(10, 90)),
        endDate: rand() < 0.5 ? daysFromNow(int(10, 60)) : null,
      },
    });
    projects.push({ id: project.id });
  }

  const taskTitles = [
    "Follow up on proposal", "Draft renewal quote", "Update account plan", "Prepare QBR deck",
    "Reconcile last month's shipments", "Fix pick-path report", "Audit duplicate accounts",
    "Schedule discovery call", "Send security questionnaire", "Chase signed order form",
    "Write post-mortem", "Update runbook", "Reassign overdue tasks", "Close stale leads",
    "Review SLA breaches", "Prep interview loop", "Send offer letter", "Collect feedback survey",
    "Rebuild inventory forecast", "Rehearse escalation drill",
  ];
  const taskStatuses = ["todo", "todo", "in_progress", "in_progress", "blocked", "done", "done", "done"];
  const taskPriorities = ["low", "medium", "medium", "high", "urgent"];
  for (let i = 0; i < 60; i++) {
    const status = pick(taskStatuses);
    const assignee = pick(users.filter((u) => u.role !== "owner"));
    const overdue = rand() < 0.2 && status !== "done";
    await prisma.task.create({
      data: {
        title: `${pick(taskTitles)} — ${companies[int(0, companies.length - 1)]}`,
        description: null,
        status,
        priority: pick(taskPriorities),
        dueDate: overdue ? daysAgo(int(1, 14)) : daysFromNow(int(-3, 30)),
        completedAt: status === "done" ? daysAgo(int(1, 20)) : null,
        assigneeId: assignee.id,
        createdById: pick(users).id,
        leadId: rand() < 0.3 ? pick(leads).id : null,
        customerId: rand() < 0.3 ? pick(customers).id : null,
        projectId: rand() < 0.5 ? pick(projects).id : null,
        createdAt: daysAgo(int(1, 60)),
      },
    });
  }

  // --- Notifications ---
  for (const user of users) {
    const count = int(1, 4);
    for (let i = 0; i < count; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: pick([
            "New lead assigned",
            "Task due today",
            "Leave request pending",
            "You were mentioned",
            "Deal moved to negotiation",
          ]),
          body: pick([
            "A new lead was routed to you based on territory.",
            "One of your tasks is due before end of day.",
            "A teammate requested leave that needs your approval.",
            "You were mentioned in a customer note.",
            "A deal you own advanced a pipeline stage.",
          ]),
          type: pick(["task_assigned", "leave_decided", "lead_update", "mention", "system"]),
          readAt: rand() < 0.5 ? daysAgo(int(0, 5)) : null,
        },
      });
    }
  }

  // --- Activity log ---
  const activitySpecs = [
    { action: "lead.stage_changed", entityType: "lead", make: () => `Lead moved to ${pick(["qualified", "proposal", "negotiation"])}` },
    { action: "task.created", entityType: "task", make: () => "Task created and assigned" },
    { action: "task.completed", entityType: "task", make: () => "Task marked done" },
    { action: "leave.approved", entityType: "leave", make: () => "Leave request approved" },
    { action: "customer.created", entityType: "customer", make: () => "Customer record created from won lead" },
    { action: "note.added", entityType: "lead", make: () => "Note added to lead timeline" },
    { action: "attendance.checked_in", entityType: "employee", make: () => "Employee checked in" },
  ];
  for (let i = 0; i < 80; i++) {
    const spec = pick(activitySpecs);
    await prisma.activityLog.create({
      data: {
        actorId: pick(users).id,
        action: spec.action,
        entityType: spec.entityType,
        entityId: int(1, 40),
        summary: spec.make(),
        metadata: null,
        createdAt: daysAgo(int(0, 30)),
      },
    });
  }

  const counts = {
    departments: await prisma.department.count(),
    users: await prisma.user.count(),
    employees: await prisma.employee.count(),
    attendance: await prisma.attendance.count(),
    leaveRequests: await prisma.leaveRequest.count(),
    jobOpenings: await prisma.jobOpening.count(),
    applicants: await prisma.applicant.count(),
    leads: await prisma.lead.count(),
    customers: await prisma.customer.count(),
    contacts: await prisma.contact.count(),
    notes: await prisma.note.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    notifications: await prisma.notification.count(),
    activityLog: await prisma.activityLog.count(),
  };
  console.log("Seed complete:", counts);
  console.log(`Demo sign-in (once auth lands): any seeded email / "${DEMO_PASSWORD}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
