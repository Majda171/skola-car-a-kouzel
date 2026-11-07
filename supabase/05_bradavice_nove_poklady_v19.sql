-- Bradavice v19: nové jednorázové poklady. Spustit až po SQL v17 z Příčné ulice.
-- Idempotentní: opakované spuštění skriptu již získané odměny nepřipíše znovu.
-- Ostatní nákupy, galeony, původní nálezy a studentský inventář zůstávají beze změny.
begin;

create or replace function public.v19_claim_treasure(p_treasure_id text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  uid uuid := auth.uid();
  amount integer := 0;
  bombs integer := 0;
  was_added boolean;
begin
  if uid is null then raise exception 'Vyžaduje se přihlášení'; end if;
  case p_treasure_id
    when 'forgotten_room_chest' then amount := 15; bombs := 2;
    when 'secret_chamber_coins' then amount := 40;
    when 'philosopher_hall_coins' then amount := 70;
    when 'forbidden_forest_coins' then amount := 10;
    else raise exception 'Neznámý poklad';
  end case;

  -- Zámek peněženky zamezuje souběžnému dvojímu připsání odměny.
  insert into public.student_wallets(student_id) values(uid) on conflict do nothing;
  perform 1 from public.student_wallets where student_id=uid for update;
  if exists(select 1 from public.student_treasures
      where student_id=uid and treasure_id=p_treasure_id) then
    return jsonb_build_object('already',true,'galeons',0,'dungbombs',0);
  end if;

  if bombs>0 and not exists(select 1 from public.student_inventory
       where student_id=uid and item_id='hnojova-bomba')
       and (select count(*) from public.student_inventory where student_id=uid)>=40 then
    raise exception 'Nejdřív uvolni místo v kouzelném batohu';
  end if;

  insert into public.student_treasures(student_id,treasure_id)
    values(uid,p_treasure_id) on conflict do nothing returning true into was_added;
  if was_added is not true then
    return jsonb_build_object('already',true,'galeons',0,'dungbombs',0);
  end if;

  if amount>0 then
    update public.student_wallets
      set balance=balance+amount,updated_at=now() where student_id=uid;
  end if;
  if bombs>0 then
    insert into public.student_inventory(student_id,item_id,quantity)
      values(uid,'hnojova-bomba',bombs)
      on conflict(student_id,item_id) do update
        set quantity=public.student_inventory.quantity+excluded.quantity;
  end if;
  return jsonb_build_object('already',false,'galeons',amount,'dungbombs',bombs);
end $$;

revoke all on function public.v19_claim_treasure(text) from public,anon;
grant execute on function public.v19_claim_treasure(text) to authenticated;
commit;
