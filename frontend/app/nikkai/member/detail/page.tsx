import { redirect } from "next/navigation";

export default async function DetailPage({
    searchParams,
}: {
    searchParams?: Promise<{ id?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const memberId = resolvedSearchParams?.id;

    redirect(memberId ? `/nikkai/member/detail/principal?id=${memberId}` : "/nikkai/member/detail/principal");
}