-- reorder_top10 함수 수정: 임시 rank=0 설정을 피하기 위해 더 안전한 방식으로 구현
CREATE OR REPLACE FUNCTION public.reorder_top10(
  p_list_id uuid, 
  p_ids uuid[], 
  p_ranks integer[]
) RETURNS void
LANGUAGE plpgsql
AS $$
declare
  n int := array_length(p_ids, 1);
  v_item_id uuid;
  v_old_rank int;
  v_new_rank int;
begin
  if n is distinct from array_length(p_ranks, 1) then
    raise exception 'ids/ranks length mismatch';
  end if;

  -- 각 항목을 순서대로 업데이트
  -- DEFERRABLE 제약 조건을 사용하여 트랜잭션 내에서 일시적으로 중복을 허용
  set constraints top10_items_list_id_rank_key deferred;
  
  for i in 1..n loop
    v_item_id := p_ids[i];
    v_new_rank := p_ranks[i];
    
    -- 현재 랭킹 확인
    select rank into v_old_rank 
    from public.top10_items 
    where id = v_item_id and list_id = p_list_id;
    
    -- 랭킹이 같으면 스킵
    if v_old_rank = v_new_rank then
      continue;
    end if;
    
    -- 새 랭킹 업데이트
    update public.top10_items
    set rank = v_new_rank
    where id = v_item_id and list_id = p_list_id;
  end loop;
end;
$$;

-- 권한 재설정
GRANT EXECUTE ON FUNCTION public.reorder_top10(uuid, uuid[], int[]) TO anon, authenticated, service_role;
