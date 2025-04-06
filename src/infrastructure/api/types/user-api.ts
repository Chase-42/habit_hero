export interface UserApi {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserApiRequest {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserApiRequest {
  email?: string;
  name?: string;
  password?: string;
}

export interface UserApiResponse {
  data: UserApi;
  message: string;
}

export interface UserListApiResponse {
  data: UserApi[];
  message: string;
}

export interface LoginApiRequest {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  data: {
    user: UserApi;
    token: string;
  };
  message: string;
}
