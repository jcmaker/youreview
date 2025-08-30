-- 현재 데이터 상태 확인
SELECT 
  list_id,
  COUNT(*) as total_items,
  MIN(rank) as min_rank,
  MAX(rank) as max_rank,
  STRING_AGG(rank::text, ', ' ORDER BY rank) as all_ranks
FROM public.top10_items
GROUP BY list_id
ORDER BY list_id;

-- 잘못된 랭킹 값 확인 (1-10 범위 밖)
SELECT id, list_id, rank, user_note
FROM public.top10_items
WHERE rank < 1 OR rank > 10;
