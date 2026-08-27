import { apiFetch } from "./client";
import type {
  AuthResponse,
  MeResponse,
  GuaraníDataResponse,
  GuaraníStudent,
  GuaraníSubject,
  GuaraníSchedule,
  GuaraníCorrelativity,
} from "../types/portal";

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: { email, password },
    noAuth: true,
  });
}

export function register(name: string, email: string, password: string) {
  return apiFetch<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
      password_confirmation: password,
    },
    noAuth: true,
  });
}

export function logout() {
  return apiFetch<{ message: string }>("/v1/auth/logout", {
    method: "POST",
  });
}

export function getMe() {
  return apiFetch<MeResponse>("/v1/auth/me");
}

export function getGuaraníStudent() {
  return apiFetch<GuaraníDataResponse<GuaraníStudent>>("/v1/guarani/student");
}

export function getGuaraníSubjects() {
  return apiFetch<GuaraníDataResponse<GuaraníSubject[]>>(
    "/v1/guarani/subjects"
  );
}

export function getGuaraníSchedule() {
  return apiFetch<GuaraníDataResponse<GuaraníSchedule[]>>(
    "/v1/guarani/schedule"
  );
}

export function getGuaraníCorrelativities() {
  return apiFetch<GuaraníDataResponse<GuaraníCorrelativity[]>>(
    "/v1/guarani/correlativities"
  );
}
