-- add_top10_item 함수 수정: 1-10 범위 내에서만 랭킹 할당
CREATE OR REPLACE FUNCTION public.add_top10_item(
  p_list_id uuid,
  p_media_id uuid,
  p_user_note text DEFAULT NULL::text,
  p_user_link text DEFAULT NULL::text
) RETURNS uuid
LANGUAGE plpgsql
AS $$
declare
  v_next_rank int;
  v_item_id uuid;
  v_existing_count int;
begin
  -- 현재 리스트의 항목 수 확인
  SELECT COUNT(*) INTO v_existing_count
  FROM public.top10_items
  WHERE list_id = p_list_id;
  
  -- 이미 10개 항목이 있으면 에러
  IF v_existing_count >= 10 THEN
    RAISE EXCEPTION '해당 리스트가 이미 10개로 가득 찼습니다.';
  END IF;
  
  -- 사용 가능한 랭킹 찾기 (1-10 범위 내)
  SELECT MIN(t.rank) INTO v_next_rank
  FROM (
    SELECT generate_series(1, 10) AS rank
  ) t
  LEFT JOIN public.top10_items ti ON ti.list_id = p_list_id AND ti.rank = t.rank
  WHERE ti.id IS NULL;
  
  -- 새 항목 추가
  INSERT INTO public.top10_items(list_id, media_id, rank, user_note, user_link)
  VALUES (p_list_id, p_media_id, v_next_rank, p_user_note, p_user_link)
  RETURNING id INTO v_item_id;
  
  -- 리스트의 item_count 업데이트
  UPDATE public.top10_lists
  SET item_count = item_count + 1
  WHERE id = p_list_id;
  
  RETURN v_item_id;
end;
$$;

-- 권한 재설정
GRANT EXECUTE ON FUNCTION public.add_top10_item(uuid, uuid, text, text) TO anon, authenticated, service_role;
