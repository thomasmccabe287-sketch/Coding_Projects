import { base44 } from '@/api/base44Client';

export async function logDisclosure({
  patientId,
  patientName,
  user,
  recordType,
  recordId = '',
  purpose = 'direct_care',
  disclosureType = 'internal_view',
  recipientName = '',
  recipientOrganization = '',
  notes = '',
}) {
  if (!patientId || !user?.id) return;

  try {
    await base44.entities.FerpaDisclosureLog.create({
      patient_id: patientId,
      patient_name: patientName || '',
      accessed_by_user_id: user.id,
      accessed_by_name: user.full_name || '',
      accessed_by_role: user.role || '',
      record_type: recordType,
      record_id: recordId,
      purpose,
      disclosure_type: disclosureType,
      recipient_name: recipientName,
      recipient_organization: recipientOrganization,
      notes,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Disclosure logging must never crash the app — fail silently
  }
}