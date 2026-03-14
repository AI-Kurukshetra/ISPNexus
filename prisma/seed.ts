import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  { name: "Starter", speedDown: 25, speedUp: 10, priceMonthly: 29.99, technology: "GPON" },
  { name: "Standard", speedDown: 100, speedUp: 25, priceMonthly: 49.99, technology: "GPON" },
  { name: "Pro", speedDown: 500, speedUp: 100, priceMonthly: 79.99, technology: "XGS_PON" },
  { name: "Gigabit", speedDown: 1000, speedUp: 500, priceMonthly: 99.99, technology: "XGS_PON" },
];

const users = [
  { email: "admin@ispnexus.demo", name: "Alex Rivera", role: "admin" },
  { email: "noc@ispnexus.demo", name: "Sam Chen", role: "noc" },
  { email: "noc2@ispnexus.demo", name: "Jordan Park", role: "noc" },
  { email: "csr@ispnexus.demo", name: "Casey Williams", role: "csr" },
  { email: "csr2@ispnexus.demo", name: "Morgan Taylor", role: "csr" },
];

const customers = [
  { firstName: "James", lastName: "Mitchell", email: "james.mitchell@maplewood.demo", city: "Maplewood", state: "CA", status: "ACTIVE" },
  { firstName: "Emily", lastName: "Davis", email: "emily.davis@ridgeview.demo", city: "Ridgeview", state: "TX", status: "ACTIVE" },
  { firstName: "David", lastName: "Martinez", email: "david.martinez@clearwater.demo", city: "Clearwater", state: "OH", status: "SUSPENDED" },
  { firstName: "Natalie", lastName: "Stewart", email: "natalie.stewart@clearwater.demo", city: "Clearwater", state: "OH", status: "TERMINATED" },
];

const devices = [
  {
    serialNumber: "CLX-E72-001A2B3C",
    model: "E7-2",
    vendor: "Calix",
    type: "OLT",
    technology: "GPON",
    status: "ONLINE",
    ipAddress: "10.0.1.1",
    firmwareVersion: "22.4.1",
    configVersion: "cfg-2026-03-10",
  },
  {
    serialNumber: "NOK-7360-002D4E5F",
    model: "7360 ISAM FX",
    vendor: "Nokia",
    type: "OLT",
    technology: "XGS_PON",
    status: "ONLINE",
    ipAddress: "10.0.1.2",
    firmwareVersion: "8.1.0",
    configVersion: "cfg-2026-03-10",
  },
  {
    serialNumber: "ONT-CAL-001P7Q2",
    model: "716GE-I",
    vendor: "Calix",
    type: "ONT",
    technology: "GPON",
    status: "DEGRADED",
    ipAddress: "192.168.1.17",
    firmwareVersion: "21.9.2",
    configVersion: "cfg-001",
  },
  {
    serialNumber: "ONT-NOK-002S8R3",
    model: "G-010S-A",
    vendor: "Nokia",
    type: "ONT",
    technology: "XGS_PON",
    status: "OFFLINE",
    ipAddress: "192.168.1.18",
    firmwareVersion: "3.4.0",
    configVersion: "cfg-002",
  },
];

async function main() {
  console.log("Seeding ISPNexus...");

  await prisma.alertEvent.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.faultTicket.deleteMany();
  await prisma.performanceMetric.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.networkDevice.deleteMany();
  await prisma.servicePlan.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Demo1234!", 10);

  const createdUsers = await Promise.all(
    users.map((user) =>
      prisma.user.create({
        data: {
          ...user,
          passwordHash,
        },
      }),
    ),
  );

  const createdPlans = await Promise.all(
    plans.map((plan) => prisma.servicePlan.create({ data: plan })),
  );

  const createdCustomers = await Promise.all(
    customers.map((customer) => prisma.customer.create({ data: customer })),
  );

  const createdDevices = await Promise.all(
    devices.map((device) => prisma.networkDevice.create({ data: device })),
  );

  await Promise.all(
    createdCustomers
      .filter((customer) => customer.status !== "TERMINATED")
      .map((customer, index) =>
        prisma.subscription.create({
          data: {
            customerId: customer.id,
            planId: createdPlans[index % createdPlans.length].id,
            status: customer.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
            deviceId: createdDevices[index % createdDevices.length]?.id,
          },
        }),
      ),
  );

  const ticket = await prisma.faultTicket.create({
    data: {
      title: "OLT port saturation on Calix E7-2 — SLOT-3 at 94% capacity",
      description:
        "Port utilization on SLOT-3 has exceeded 90% threshold for the past 2 hours.",
      severity: "CRITICAL",
      status: "OPEN",
      deviceId: createdDevices[0]?.id,
      customerId: createdCustomers[0]?.id,
      assigneeId: createdUsers[1]?.id,
    },
  });

  await prisma.ticketComment.create({
    data: {
      ticketId: ticket.id,
      authorId: createdUsers[1]?.id ?? createdUsers[0]!.id,
      body: "Initial triage started. Monitoring OLT load.",
    },
  });

  await Promise.all([
    prisma.workOrder.create({
      data: {
        title: "Inspect OLT SLOT-3 utilization",
        type: "REPAIR",
        status: "IN_PROGRESS",
        ticketId: ticket.id,
        assigneeId: createdUsers[1]?.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        notes: "Validate splitter load and shift heavy ONTs to secondary segment if required.",
      },
    }),
    prisma.workOrder.create({
      data: {
        title: "Fiber survey for Ridgeview expansion",
        type: "SURVEY",
        status: "PENDING",
        assigneeId: createdUsers[0]?.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        notes: "Collect path feasibility for 12 new subscriber drops.",
      },
    }),
  ]);

  await prisma.inventoryItem.createMany({
    data: [
      {
        name: "Calix 716GE ONT",
        type: "ONT",
        serialNumber: "INV-ONT-001",
        status: "AVAILABLE",
        location: "Warehouse A",
      },
      {
        name: "Nokia G-010S ONT",
        type: "ONT",
        serialNumber: "INV-ONT-002",
        status: "IN_USE",
        assignedDevice: createdDevices[2]?.id,
        location: "Field Site",
      },
      {
        name: "SFP+ Transceiver",
        type: "TRANSCEIVER",
        serialNumber: "INV-SFP-009",
        status: "AVAILABLE",
        location: "Warehouse B",
      },
      {
        name: "Patch Cable 50m",
        type: "CABLE",
        serialNumber: "INV-CBL-014",
        status: "AVAILABLE",
        location: "Warehouse A",
      },
      {
        name: "OTDR Tester",
        type: "TOOL",
        serialNumber: "INV-TL-001",
        status: "MAINTENANCE",
        location: "Lab Bench",
      },
    ],
  });

  const now = Date.now();
  for (const device of createdDevices) {
    const metrics: Array<{ metricName: string; value: number; unit: string; timestamp: Date }> = [];

    for (let i = 0; i < 24; i += 1) {
      const pointTime = new Date(now - i * 60 * 60 * 1000);
      metrics.push(
        { metricName: "bandwidth_down", value: 80 + Math.random() * 300, unit: "Mbps", timestamp: pointTime },
        { metricName: "bandwidth_up", value: 20 + Math.random() * 120, unit: "Mbps", timestamp: pointTime },
        {
          metricName: "latency",
          value: device.status === "DEGRADED" ? 90 + Math.random() * 80 : 8 + Math.random() * 15,
          unit: "ms",
          timestamp: pointTime,
        },
        {
          metricName: "packet_loss",
          value: device.status === "DEGRADED" ? 2 + Math.random() * 4 : Math.random() * 0.5,
          unit: "%",
          timestamp: pointTime,
        },
      );
    }

    await prisma.performanceMetric.createMany({
      data: metrics.map((metric) => ({ ...metric, deviceId: device.id })),
    });
  }

  const alertRule = await prisma.alertRule.create({
    data: {
      deviceId: createdDevices[0]?.id ?? createdDevices[1]!.id,
      metricName: "bandwidth_down",
      threshold: 250,
      operator: "GT",
      severity: "HIGH",
    },
  });

  await prisma.alertEvent.createMany({
    data: [
      {
        ruleId: alertRule.id,
        deviceId: alertRule.deviceId,
        value: 312.4,
        severity: "HIGH",
        acknowledged: false,
        createdAt: new Date(Date.now() - 12 * 60 * 1000),
      },
      {
        ruleId: alertRule.id,
        deviceId: alertRule.deviceId,
        value: 287.9,
        severity: "HIGH",
        acknowledged: true,
        createdAt: new Date(Date.now() - 42 * 60 * 1000),
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
