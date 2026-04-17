import type { DemoAccount } from "../common/type/app.type";

export const loginWithDemoAccount = async (
  accounts: DemoAccount[],
  email: string,
  password: string
): Promise<DemoAccount | null> => {
  const matched = accounts.find(
    (acc) => acc.email === email.trim() && acc.password === password
  );

  return matched ?? null;
};
