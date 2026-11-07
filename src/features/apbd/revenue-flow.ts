export interface RevenueAccountInput {
  row_index: number;
  akun: string;
  anggaran: number | string;
  realisasi: number | string;
}

export type RevenueCategoryId = "pad" | "transfer" | "other";

export interface RevenueFlowChild {
  id: string;
  label: string;
  amount: number;
}

export interface RevenueFlowCategory {
  id: RevenueCategoryId;
  label: string;
  description: string;
  amount: number | null;
  children: RevenueFlowChild[];
}

function toAmount(value: number | string | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function toChild(account: RevenueAccountInput): RevenueFlowChild {
  return {
    id: `${account.row_index}-${account.akun}`,
    label: account.akun,
    amount: toAmount(account.anggaran),
  };
}

export function buildRevenueFlowCategories(
  inputAccounts: readonly RevenueAccountInput[],
): RevenueFlowCategory[] {
  const accounts = [...inputAccounts].sort((a, b) => a.row_index - b.row_index);
  const incomeEndIndex = accounts.findIndex((account) => account.akun === "Belanja Daerah");
  const incomeAccounts = incomeEndIndex < 0 ? accounts : accounts.slice(0, incomeEndIndex);
  const padIndex = incomeAccounts.findIndex((account) => account.akun === "PAD");
  const transferIndex = incomeAccounts.findIndex(
    (account, index) => index > padIndex && account.akun === "TKDD",
  );
  const otherIndex = incomeAccounts.findIndex(
    (account, index) => index > transferIndex && account.akun === "Pendapatan Lainnya",
  );

  const padAccount = padIndex >= 0 ? incomeAccounts[padIndex] : null;
  const padChildren =
    padIndex >= 0 && transferIndex > padIndex
      ? incomeAccounts.slice(padIndex + 1, transferIndex).map(toChild)
      : [];

  const centralTransferAccounts =
    transferIndex >= 0
      ? incomeAccounts
          .slice(transferIndex + 1, otherIndex > transferIndex ? otherIndex : incomeAccounts.length)
          .filter((account) => account.akun.startsWith("Pendapatan Transfer"))
      : [];
  const regionalAndOtherAccounts =
    otherIndex >= 0
      ? incomeAccounts.slice(otherIndex + 1).filter((account) => account.akun !== "Belanja Daerah")
      : [];
  const regionalTransferAccounts = regionalAndOtherAccounts.filter((account) =>
    account.akun.startsWith("Pendapatan Transfer"),
  );
  const otherIncomeAccounts = regionalAndOtherAccounts.filter(
    (account) => !account.akun.startsWith("Pendapatan Transfer"),
  );

  const centralTransfer =
    centralTransferAccounts.length > 0
      ? centralTransferAccounts.map(toChild)
      : transferIndex >= 0
        ? [
            {
              id: `${incomeAccounts[transferIndex].row_index}-central-transfer`,
              label: "Pendapatan Transfer Pemerintah Pusat",
              amount: toAmount(incomeAccounts[transferIndex].anggaran),
            },
          ]
        : [];
  const transferChildren = [
    ...centralTransfer,
    ...regionalTransferAccounts.map(toChild),
  ];

  return [
    {
      id: "pad",
      label: "Pendapatan Asli Daerah (PAD)",
      description:
        "Penerimaan yang dihimpun daerah, seperti pajak, retribusi, dan hasil pengelolaan kekayaan daerah.",
      amount: padAccount ? toAmount(padAccount.anggaran) : null,
      children: padChildren,
    },
    {
      id: "transfer",
      label: "Pendapatan Transfer",
      description:
        "Dana yang diterima dari pemerintah pusat dan, bila tercatat, pemerintah daerah lain.",
      amount:
        transferChildren.length > 0
          ? transferChildren.reduce((sum, child) => sum + child.amount, 0)
          : null,
      children: transferChildren,
    },
    {
      id: "other",
      label: "Pendapatan Daerah Lainnya yang Sah",
      description:
        "Pendapatan sah di luar PAD dan transfer. Nilainya ditampilkan hanya jika rincian ini tercatat terpisah pada snapshot.",
      amount:
        otherIncomeAccounts.length > 0
          ? otherIncomeAccounts.reduce((sum, account) => sum + toAmount(account.anggaran), 0)
          : null,
      children: otherIncomeAccounts.map(toChild),
    },
  ];
}
