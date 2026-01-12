import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Role } from "./Role";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // INT AUTO_INCREMENT in database

  @Column({ unique: true })
  uuid!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "varchar", length: 36, nullable: true, name: "role_id" })
  roleId!: string | null;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: "role_id" })
  role!: Role | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}