export const verifyAdmin = (password: string): boolean => {
  return password === process.env.ADMIN_PASSWORD;
};