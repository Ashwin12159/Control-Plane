import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
import { Role } from "./Role";

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string; // e.g., "rabbitmq", "check-sync", "call-details", etc.

  @Column()
  displayName!: string; // e.g., "RabbitMQ Queue", "Check Sync", "Call Details"

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

