export const USER_ROLES = ["admin", "noc", "csr"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function normalizeUserRole(role?: string | null): UserRole {
  if (role === "noc" || role === "csr" || role === "admin") {
    return role;
  }

  return "admin";
}

export function getRoleLabel(role?: string | null) {
  const normalized = normalizeUserRole(role);

  if (normalized === "noc") {
    return "NOC Engineer";
  }

  if (normalized === "csr") {
    return "Customer Service Rep";
  }

  return "Admin";
}

export function canManageSubscribers(role?: string | null) {
  return normalizeUserRole(role) === "admin";
}

export function canManageTickets(role?: string | null) {
  const normalized = normalizeUserRole(role);
  return normalized === "admin" || normalized === "noc";
}

export function canManageWorkOrders(role?: string | null) {
  const normalized = normalizeUserRole(role);
  return normalized === "admin" || normalized === "noc";
}

export function canCollapseSidebar(role?: string | null) {
  const normalized = normalizeUserRole(role);
  return normalized === "admin" || normalized === "noc";
}
