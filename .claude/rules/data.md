# Data

- Prisma only. No raw SQL except the health check.
- Wrap multi-row writes in `prisma.$transaction`.
- Change the schema only via `prisma migrate dev --name <change>`.
- Never edit an applied migration.
