export interface NewUser {
  name: string;
  uuid: string | null;
  flow: "xtls-rprx-vision" | null;
  password: string | null;
}

export interface User extends NewUser {
  path: string;
}

export interface UserDiff {
  name?: string;
  uuid?: string | null;
  flow?: "xtls-rprx-vision" | null;
  password?: string | null;
}
