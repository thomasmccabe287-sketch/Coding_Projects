/**
 * Tenant-scoped API layer for multi-tenant data access.
 *
 * All queries are automatically scoped to the current user's school_id.
 * Super admins can bypass scoping by passing { bypassTenant: true } in options.
 *
 * Usage:
 *   const api = createTenantApi(schoolId, isSuperAdmin);
 *   const patients = await api.list('Patient');
 *   const active = await api.filter('Patient', { status: 'Full Go' });
 *   await api.create('Patient', { name: 'John', sport: 'Football', ... });
 *   await api.update('Patient', id, { status: 'Out' });
 *   await api.delete('Patient', id);
 */

import { base44 } from '@/api/base44Client';

/**
 * Entities that are global / not tenant-scoped.
 * Queries to these entities will not have school_id injected.
 */
const GLOBAL_ENTITIES = ['AuditLog'];

/**
 * Log a cross-tenant access attempt (super admin override).
 */
function logCrossTenantAccess(entityName, schoolId, action) {
  base44.entities.AuditLog.create({
    user_id: 'superadmin',
    user_name: 'Super Admin',
    user_role: 'superadmin',
    action: `cross_tenant_${action}`,
    entity_type: entityName,
    school_id: schoolId || 'ALL',
    field_name: 'tenant_bypass',
    new_value: `Superadmin bypassed tenant scoping for ${entityName}`,
  }).catch(() => {});
}

export function createTenantApi(schoolId, isSuperAdmin = false) {
  /**
   * Build a filter that always includes school_id unless:
   * - The entity is global
   * - bypassTenant is explicitly true AND user is superadmin
   */
  function scopedFilter(entityName, extraFilter = {}, { bypassTenant = false } = {}) {
    if (GLOBAL_ENTITIES.includes(entityName)) return extraFilter;
    if (bypassTenant && isSuperAdmin) return extraFilter;

    if (!schoolId) {
      console.warn(`[TenantAPI] No school_id available for query on ${entityName}. Aborting.`);
      return null; // signals caller to skip the query
    }

    return { ...extraFilter, school_id: schoolId };
  }

  function getEntity(entityName) {
    const entity = base44.entities[entityName];
    if (!entity) throw new Error(`[TenantAPI] Unknown entity: ${entityName}`);
    return entity;
  }

  return {
    /**
     * List all records for the current tenant.
     * @param {string} entityName
     * @param {string} [sort] - e.g. '-created_date'
     * @param {number} [limit]
     * @param {{ bypassTenant?: boolean }} [opts]
     */
    async list(entityName, sort, limit, opts = {}) {
      const filter = scopedFilter(entityName, {}, opts);
      if (filter === null) return [];
      if (opts.bypassTenant && isSuperAdmin) logCrossTenantAccess(entityName, schoolId, 'list');
      return getEntity(entityName).filter(filter, sort, limit);
    },

    /**
     * Filter records with additional conditions, always scoped to tenant.
     * @param {string} entityName
     * @param {object} conditions - additional filter fields
     * @param {string} [sort]
     * @param {number} [limit]
     * @param {{ bypassTenant?: boolean }} [opts]
     */
    async filter(entityName, conditions = {}, sort, limit, opts = {}) {
      const filter = scopedFilter(entityName, conditions, opts);
      if (filter === null) return [];
      if (opts.bypassTenant && isSuperAdmin) logCrossTenantAccess(entityName, schoolId, 'filter');
      return getEntity(entityName).filter(filter, sort, limit);
    },

    /**
     * Get a single record by ID (still validates tenant via RLS, but logs if superadmin bypass).
     */
    async get(entityName, id, opts = {}) {
      if (opts.bypassTenant && isSuperAdmin) logCrossTenantAccess(entityName, schoolId, 'get');
      return getEntity(entityName).get(id);
    },

    /**
     * Create a record, automatically injecting school_id.
     * @param {string} entityName
     * @param {object} data
     */
    async create(entityName, data) {
      if (GLOBAL_ENTITIES.includes(entityName)) {
        return getEntity(entityName).create(data);
      }
      if (!schoolId) {
        throw new Error(`[TenantAPI] Cannot create ${entityName}: no school_id in context.`);
      }
      return getEntity(entityName).create({ ...data, school_id: schoolId });
    },

    /**
     * Update a record by ID.
     */
    async update(entityName, id, data) {
      return getEntity(entityName).update(id, data);
    },

    /**
     * Delete a record by ID.
     */
    async delete(entityName, id) {
      return getEntity(entityName).delete(id);
    },

    /**
     * Expose raw base44 entity for escape hatch (avoid unless necessary).
     */
    raw(entityName) {
      return getEntity(entityName);
    },

    /** The active schoolId for this context */
    schoolId,
    isSuperAdmin,
  };
}