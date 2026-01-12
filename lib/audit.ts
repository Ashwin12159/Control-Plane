import { getDataSource } from "./database/data-source";
import { AuditLog } from "./database/entities/AuditLog";
import { getUserDetails } from "./utils";

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  action: string,
  region: string,
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    const userDetails = await getUserDetails();
    const db = await getDataSource();
    const auditLogRepository = db.getRepository(AuditLog);

    const auditLog: AuditLog = {
      action,
      region,
      payload: payload ? JSON.stringify(payload) : null,
      doneBy: userDetails.email,
    };

    await auditLogRepository.save(auditLog);
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw - audit logging should not break the main flow
  }
}

