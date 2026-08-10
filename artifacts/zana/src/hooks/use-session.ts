import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSession } from '@/lib/auth';

export function useSession() {
    const query = useQuery({ queryKey: ['session'], queryFn: fetchSession, retry: false, staleTime: 60_000 });
    return { user: query.data ?? null, isLoading: query.isLoading };
}

export function useInvalidateSession() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ['session'] });
}