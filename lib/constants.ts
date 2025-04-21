export const isProductionEnvironment = process.env.NODE_ENV === 'production';

export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const truncateWalletAddress = (address: string) => {
  return address.length > 2
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";
};