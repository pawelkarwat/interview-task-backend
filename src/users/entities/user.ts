import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment', { name: 'userid' })
  userId: number;

  @Column({ unique: true, name: 'login' })
  login: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'avatarimageurl' })
  avatarImageUrl: string;

  @Column({ nullable: true, name: 'refreshtoken' })
  refreshToken: string;

  @Column({ type: 'date', nullable: true, name: 'refreshtokenexp' })
  refreshTokenExp: string;
}
