
export class UserRegisterModel {
    firstName!: string;
    lastName!: string;
    email?: string;
    phone!: string;
    password!: string;
    role: string = 'User';
    token?: string; 
}