import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database/data-source";
import { AuditLog } from "@/lib/database/entities/AuditLog";
import { User } from "@/lib/database/entities/User";
import { getUserDetails } from "@/lib/utils";
import { ROLES } from "@/lib/permissions";

interface AuditLogWithUser extends AuditLog {
  username?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is super_admin
    const userDetails = await getUserDetails();
    
    if (userDetails.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized: Only super admins can view audit logs" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limitParam = searchParams.get("limit");
    const limit = limitParam 
      ? Math.max(1, Math.min(100, parseInt(limitParam, 10)))
      : 10; // Default to 10 if not provided
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const searchUsername = searchParams.get("searchUsername") || "";
    const filterRegion = searchParams.get("filterRegion") || "";
    const filterAction = searchParams.get("filterAction") || "";

    const skip = (page - 1) * limit;

    // Debug logging (remove in production)
    console.log("Audit logs API - Page:", page, "Limit:", limit, "Skip:", skip);

    const db = await getDataSource();
    const auditLogRepository = db.getRepository(AuditLog);
    const userRepository = db.getRepository(User);

    // Build query with join to User table for username sorting
    const queryBuilder = auditLogRepository
      .createQueryBuilder("audit_log")
      .leftJoin("users", "user", "user.email = audit_log.doneBy")
      .addSelect("user.username", "user_username");

    // Apply filters
    if (searchUsername) {
      queryBuilder.andWhere(
        "(user.username LIKE :searchUsername OR audit_log.doneBy LIKE :searchUsername)",
        { searchUsername: `%${searchUsername}%` }
      );
    }

    if (filterRegion) {
      queryBuilder.andWhere("audit_log.region = :filterRegion", { filterRegion });
    }

    if (filterAction) {
      queryBuilder.andWhere("audit_log.action = :filterAction", { filterAction });
    }

    // Sort by username or timestamp
    if (sortBy === "username") {
      queryBuilder.orderBy("user.username", sortOrder.toUpperCase() as "ASC" | "DESC");
    } else {
      queryBuilder.orderBy("audit_log.createdAt", sortOrder.toUpperCase() as "ASC" | "DESC");
    }

    // Always add secondary sort by timestamp
    queryBuilder.addOrderBy("audit_log.createdAt", "DESC");

    // Get total count (before pagination) - clone the query builder to avoid affecting the main query
    const countQueryBuilder = queryBuilder.clone();
    const total = await countQueryBuilder.getCount();

    // Apply pagination and get raw results
    // IMPORTANT: skip and take must be applied after all where clauses and ordering
    // Use limit() and offset() as an alternative to ensure pagination works
    const auditLogs = await queryBuilder
      .offset(skip)
      .limit(limit)
      .getRawMany();

    // Debug logging (remove in production)
    console.log("Audit logs API - Page:", page, "Limit:", limit, "Skip:", skip, "Returned:", auditLogs.length, "Total:", total);

    // Map results to include username
    const auditLogsWithUser: Partial<AuditLog>[] = auditLogs.map((row: any) => {
      return {
        id: row.audit_log_id,
        requestId: row.audit_log_request_id,
        action: row.audit_log_action,
        payload: row.audit_log_payload,
        doneBy: row.audit_log_doneBy,
        region: row.audit_log_region,
        createdAt: row.audit_log_createdAt,
        updatedAt: row.audit_log_updatedAt,
        username: row.user_username || row.audit_log_doneBy, // Fallback to email if username not found
      };
    });

    return NextResponse.json({
      data: auditLogsWithUser,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

