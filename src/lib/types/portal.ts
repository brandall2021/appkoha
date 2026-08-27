export interface PortalUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin";
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: PortalUser;
  token: string;
}

export interface MeResponse {
  data: PortalUser;
}

export interface PortalError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface GuaraníStudent {
  id: number;
  padron: number;
  nombre: string;
  carrera: string;
  estado: string;
}

export interface GuaraníSubject {
  materia_codigo: string;
  materia_nombre: string;
  correlativas: string[];
}

export interface GuaraníSchedule {
  materia_codigo: string;
  materia_nombre: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  aula: string;
}

export interface GuaraníCorrelativity {
  materia_codigo: string;
  materia_nombre: string;
  correlativas: string[];
  aprobada: boolean;
  habilitada: boolean;
}

export interface GuaraníDataResponse<T> {
  data: T;
}
