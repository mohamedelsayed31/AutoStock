import axiosInstance from "../api/axiosInstance";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/auth";


export async function login(
  data: LoginRequest
): Promise<LoginResponse> {

  const response =
    await axiosInstance.post<LoginResponse>(
      "/Auth/login",
      data
    );

  return response.data;
}


export async function register(
  data: RegisterRequest
): Promise<void> {

  await axiosInstance.post(
    "/Auth/register",
    data
  );
}