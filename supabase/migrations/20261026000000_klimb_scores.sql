-- Run once in the Supabase SQL editor. Anonymous clients cannot access these tables.
create table if not exists public.klimb_runs (
 token uuid primary key default gen_random_uuid(),
 ip_hash text not null,
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 score integer,
 nickname text,
 submitted_at timestamptz
);
alter table public.klimb_runs enable row level security;
revoke all on public.klimb_runs from anon, authenticated;
create index if not exists klimb_ip_time on public.klimb_runs(ip_hash,started_at);
create index if not exists klimb_rank on public.klimb_runs(score desc,submitted_at) where submitted_at is not null;

create or replace function public.klimb_top() returns jsonb
language sql security definer set search_path=public as $$
 select coalesce(jsonb_agg(jsonb_build_object('nickname',nickname,'score',score) order by score desc,submitted_at,token),'[]'::jsonb)
 from (select nickname,score,submitted_at,token from klimb_runs where submitted_at is not null order by score desc,submitted_at,token limit 5) t;
$$;

create or replace function public.klimb_start(p_ip text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare t uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_ip,0));
 if (select count(*) from klimb_runs where ip_hash=p_ip and started_at>now()-interval '1 minute')>=15
 or (select count(*) from klimb_runs where ip_hash=p_ip and started_at>now()-interval '1 day')>=1000 then
  raise exception 'RATE_LIMIT';
 end if;
 delete from klimb_runs where submitted_at is null and started_at<now()-interval '1 day';
 insert into klimb_runs(ip_hash) values(p_ip) returning token into t;
 return jsonb_build_object('token',t);
end $$;

create or replace function public.klimb_finish(p_token uuid,p_score integer,p_seconds double precision) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r klimb_runs%rowtype; cutoff integer; n integer;
begin
 select * into r from klimb_runs where token=p_token for update;
 if not found or r.started_at<now()-interval '1 day' then raise exception 'EXPIRED'; end if;
 if r.finished_at is null then
  -- Sanity checks and server elapsed time; not proof of honest gameplay.
  if p_score<1 or p_seconds<0 or p_seconds>86400 or p_seconds::text in ('NaN','Infinity','-Infinity')
   or p_seconds>extract(epoch from now()-r.started_at)+5
   or p_score>ceil(220*p_seconds+50) then raise exception 'INVALID_SCORE'; end if;
  update klimb_runs set score=p_score,finished_at=now() where token=p_token;
 else
  if r.score<>p_score then raise exception 'IMMUTABLE_SCORE'; end if;
 end if;
 select count(*),min(score) into n,cutoff from (select score from klimb_runs where submitted_at is not null order by score desc,submitted_at,token limit 5) t;
 return jsonb_build_object('qualifies',n<5 or p_score>cutoff,'top',klimb_top());
end $$;

create or replace function public.klimb_submit(p_token uuid,p_nickname text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare r klimb_runs%rowtype; cutoff integer; n integer; name text;
begin
 perform pg_advisory_xact_lock(4042606);
 select * into r from klimb_runs where token=p_token for update;
 if not found or r.finished_at is null or r.finished_at<now()-interval '30 minutes' then raise exception 'EXPIRED'; end if;
 if r.submitted_at is not null then return jsonb_build_object('accepted',true,'top',klimb_top()); end if;
 name:=btrim(p_nickname);
 if char_length(name)<2 or char_length(name)>16 or name !~ '^[[:alnum:] _-]+$' then raise exception 'INVALID_NAME'; end if;
 select count(*),min(score) into n,cutoff from (select score from klimb_runs where submitted_at is not null order by score desc,submitted_at,token limit 5) t;
 if n>=5 and r.score<=cutoff then return jsonb_build_object('accepted',false,'top',klimb_top()); end if;
 update klimb_runs set nickname=name,submitted_at=now() where token=p_token;
 return jsonb_build_object('accepted',true,'top',klimb_top());
end $$;
revoke execute on function public.klimb_top(),public.klimb_start(text),public.klimb_finish(uuid,integer,double precision),public.klimb_submit(uuid,text) from public,anon,authenticated;
grant execute on function public.klimb_top(),public.klimb_start(text),public.klimb_finish(uuid,integer,double precision),public.klimb_submit(uuid,text) to service_role;
