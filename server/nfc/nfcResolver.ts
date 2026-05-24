import prisma from '../config/db';

export async function resolveNfcId(nfcId: string) {
  return prisma.object.findUnique({ where: { nfcId } });
}
