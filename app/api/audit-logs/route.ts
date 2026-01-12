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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const searchUsername = searchParams.get("searchUsername") || "";
    const filterRegion = searchParams.get("filterRegion") || "";

    const skip = (page - 1) * limit;

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

    // Sort by username or timestamp
    if (sortBy === "username") {
      queryBuilder.orderBy("user.username", sortOrder.toUpperCase() as "ASC" | "DESC");
    } else {
      queryBuilder.orderBy("audit_log.createdAt", sortOrder.toUpperCase() as "ASC" | "DESC");
    }

    // Always add secondary sort by timestamp
    queryBuilder.addOrderBy("audit_log.createdAt", "DESC");

    // Get total count (before pagination)
    const total = await queryBuilder.getCount();

    // Apply pagination and get raw results
    const auditLogs = await queryBuilder
      .skip(skip)
      .take(limit)
      .getRawMany();

    // Map results to include username
    const auditLogsWithUser: AuditLogWithUser[] = auditLogs.map((row: any) => {
      return {
        id: row.audit_log_id,
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

