import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("audit_logs")
export class 
AuditLog {

  // ID AND UUID ARE AUTO GENERATED
  @PrimaryGeneratedColumn()
  id?: number | null = null;

  @Column()
  action!: string;

  @Column({ type: "text", nullable: true })
  payload!: string | null;

  @Column()
  doneBy!: string;

  @Column()
  region!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: false })
  request_id!: string;

}