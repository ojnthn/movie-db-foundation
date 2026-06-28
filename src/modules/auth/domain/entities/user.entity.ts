import { fail, ok, Result } from '../../../../shared/types/result';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';

export type UserStatus = 'active' | 'inactive' | 'deleted';

export interface UserProps {
  id: string;
  name: string;
  email: Email;
  password: Password;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: Email;
  readonly password: Password;
  readonly status: UserStatus;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    id: string;
    name: string;
    email: string;
    password: string;
    status?: UserStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<User> {
    const emailResult = Email.create(props.email);
    if (!emailResult.ok) return fail(emailResult.error);

    const passwordResult = Password.create(props.password);
    if (!passwordResult.ok) return fail(passwordResult.error);

    return ok(
      new User({
        id: props.id,
        name: props.name,
        email: emailResult.value,
        password: passwordResult.value,
        status: props.status ?? 'active',
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      }),
    );
  }

  isActive(): boolean {
    return this.status === 'active';
  }
}
