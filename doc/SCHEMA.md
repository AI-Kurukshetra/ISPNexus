# SCHEMA

## Prisma Schema (Initial)
- Added core tables: `User`, `ServicePlan`, `Customer`, `Subscription`, `NetworkDevice`, `PerformanceMetric`, `FaultTicket`, `TicketComment`, `WorkOrder`, `InventoryItem`, `AlertRule`, `AlertEvent`.
- Added key indexes:
  - `PerformanceMetric(deviceId, metricName, timestamp)`
  - `FaultTicket(status)`
  - `FaultTicket(severity)`
  - `AlertEvent(deviceId, createdAt)`

## Notes
- Migration files are pending until a live `DATABASE_URL` is configured and `prisma migrate dev` is run.
