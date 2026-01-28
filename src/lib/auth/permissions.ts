import { getSession } from './jwt';

export type UserRole = 'ADMIN' | 'SHIPPING' | 'ACCOUNTING' | 'OPERATOR';

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  if (!roles.includes(session.role as UserRole)) {
    throw new Error('Forbidden');
  }
  return session;
}

export const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ['*'],
  SHIPPING: [
    'view:orders',
    'view:deliveries',
    'view:schedules',
    'update:deliveries',
    'create:comments',
    'view:arvento',
    'view:pricing',
  ],
  ACCOUNTING: [
    'view:orders',
    'create:orders',
    'update:orders',
    'view:customers',
    'create:customers',
    'update:customers',
    'view:contracts',
    'create:contracts',
    'update:contracts',
    'view:pricing',
    'update:pricing',
    'view:deliveries',
  ],
  OPERATOR: [
    'view:orders',
    'view:production',
    'update:production',
    'create:comments',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}
