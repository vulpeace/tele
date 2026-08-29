export interface AdminHashed {
  username: string;
  pwdHash: string;
  tokenId?: string;
}

export interface AdminPlaintext {
  username: string;
  password: string;
}
