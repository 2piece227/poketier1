"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import pokemonData from "@/data/pokemon.json";
import movesKo from "@/data/moves-ko.json";
import {
  EV_STATS, TYPE_KO, typeIconUrl, timeAgo,
  type PokemonSlot,
} from "@/lib/party-constants";
import "@/styles/community.css";
import "@/styles/login.css";

const MOVES_KO = movesKo as Record<string, { name: string; type: string }>;

interface Post {
  id            : string;
  author_id     : string;
  author_nick   : string;
  title         : string;
  description   : string;
  party         : PokemonSlot[];
  likes_count   : number;
  comments_count: number;
  created_at    : string;
}
interface Comment {
  id         : string;
  author_nick: string;
  content    : string;
  created_at : string;
  author_id  : string;
}

// 파티 슬롯 읽기 전용 카드
function SlotCard({ slot, si }: { slot: PokemonSlot; si: number }) {
  const match   = pokemonData.find(p => p.nameKo === slot.pokemon);
  const evTotal = slot.evs.reduce((a, b) => a + b, 0);

  return (
    <div className="login-card party-slot-card detail-slot-card">
      {/* 포켓몬 이미지 + 이름 */}
      <div className="party-pokemon-row">
        {match?.artwork
          ? <img src={match.artwork} alt={slot.pokemon} className="party-pokemon-sprite" />
          : <span className="party-pokemon-sprite--empty" />}
        <strong className="detail-pokemon-name">{slot.pokemon || `슬롯 ${si + 1}`}</strong>
      </div>

      {/* 성격 / 특성 / 도구 */}
      <div className="detail-slot-badges">
        {slot.nature  && <span className="detail-badge detail-badge--nature">{slot.nature}</span>}
        {slot.ability && <span className="detail-badge detail-badge--ability">{slot.ability}</span>}
        {slot.item    && <span className="detail-badge detail-badge--item">📦 {slot.item}</span>}
      </div>

      {/* 기술 */}
      {(slot.moves.length > 0 || slot.altMove) && (
        <ul className="party-move-list">
          {slot.moves.map(id => {
            const mv = MOVES_KO[id];
            return (
              <li key={id} className="party-move-item">
                <img src={typeIconUrl(mv?.type ?? "normal")} alt={TYPE_KO[mv?.type ?? "normal"] ?? ""} className="party-move-type-icon" />
                <span className="party-move-name">{mv?.name ?? id}</span>
              </li>
            );
          })}
          {slot.altMove && (() => {
            const mv = MOVES_KO[slot.altMove];
            return (
              <li className="party-move-item party-alt-move-item">
                <img src={typeIconUrl(mv?.type ?? "normal")} alt="" className="party-move-type-icon" />
                <span className="party-move-name">{mv?.name ?? slot.altMove}</span>
              </li>
            );
          })()}
        </ul>
      )}

      {/* 노력치 (0 이상인 것만) */}
      {evTotal > 0 && (
        <div className="detail-evs">
          {EV_STATS.map((stat, ei) =>
            slot.evs[ei] > 0 ? (
              <span key={stat} className="detail-ev-chip">{stat}&nbsp;{slot.evs[ei]}</span>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const supabase = createClient();
  const id       = params.id as string;

  const [post,       setPost]       = useState<Post | null>(null);
  const [comments,   setComments]   = useState<Comment[]>([]);
  const [user,       setUser]       = useState<User | null>(null);
  const [liked,      setLiked]      = useState(false);
  const [likeCount,  setLikeCount]  = useState(0);
  const [commentText,setCommentText]= useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // ── 초기 로드 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    supabase.from("posts").select("*").eq("id", id).single()
      .then(({ data }) => {
        if (data) { setPost(data); setLikeCount(data.likes_count ?? 0); }
        setLoading(false);
      });

    supabase.from("comments").select("*").eq("post_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments(data ?? []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 좋아요 여부 확인
  useEffect(() => {
    if (!user) return;
    supabase.from("post_likes").select("user_id")
      .eq("post_id", id).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setLiked(!!data));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  // ── 좋아요 토글 ────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!user) { router.push("/login"); return; }
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", id).eq("user_id", user.id);
      await supabase.from("posts").update({ likes_count: likeCount - 1 }).eq("id", id);
      setLiked(false); setLikeCount(c => c - 1);
    } else {
      await supabase.from("post_likes").insert({ post_id: id, user_id: user.id });
      await supabase.from("posts").update({ likes_count: likeCount + 1 }).eq("id", id);
      setLiked(true); setLikeCount(c => c + 1);
    }
  };

  // ── 댓글 등록 ──────────────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!user)                  { router.push("/login"); return; }
    if (!commentText.trim())    return;

    setSubmitting(true);
    const { data, error } = await supabase.from("comments").insert({
      post_id    : id,
      author_id  : user.id,
      author_nick: user.user_metadata?.nickname ?? "익명",
      content    : commentText.trim(),
    }).select().single();

    if (!error && data) {
      setComments(prev => [...prev, data]);
      const newCount = (post?.comments_count ?? 0) + 1;
      await supabase.from("posts").update({ comments_count: newCount }).eq("id", id);
      setPost(p => p ? { ...p, comments_count: newCount } : p);
      setCommentText("");
      commentRef.current?.focus();
    }
    setSubmitting(false);
  };

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <main className="community-detail-page">
      <p className="community-empty">로딩 중...</p>
    </main>
  );
  if (!post) return (
    <main className="community-detail-page">
      <p className="community-empty">게시물을 찾을 수 없습니다.</p>
    </main>
  );

  const filledSlots = post.party.filter(s => s.pokemon);

  return (
    <main className="community-detail-page">
      {/* ─── 헤더 ─── */}
      <div className="detail-header">
        <button type="button" className="ghost-secondary-btn detail-back-btn" onClick={() => router.push("/community")}>
          ← 목록
        </button>
        <div className="detail-header-body">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <span className="detail-author">{post.author_nick}</span>
            <span className="post-dot">·</span>
            <span className="detail-time">{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* ─── 파티 ─── */}
      <section className="detail-section">
        <h2 className="detail-section-title">파티</h2>
        {filledSlots.length > 0 ? (
          <div className="party-slots-grid">
            {filledSlots.map((slot, si) => (
              <SlotCard key={si} slot={slot} si={si} />
            ))}
          </div>
        ) : (
          <p className="community-empty">파티 정보가 없습니다.</p>
        )}
      </section>

      {/* ─── 설명 ─── */}
      {post.description && (
        <section className="detail-section">
          <h2 className="detail-section-title">설명</h2>
          <div className="detail-description">{post.description}</div>
        </section>
      )}

      {/* ─── 추천 ─── */}
      <div className="detail-like-row">
        <button
          type="button"
          className={`detail-like-btn${liked ? " is-liked" : ""}`}
          onClick={handleLike}
          title={user ? (liked ? "추천 취소" : "추천하기") : "로그인 후 추천 가능"}
        >
          ♥ {likeCount}
        </button>
        <span className="detail-like-hint">{liked ? "추천했습니다!" : "이 파티가 도움이 됐다면 추천해주세요"}</span>
      </div>

      {/* ─── 댓글 ─── */}
      <section className="detail-section detail-comments">
        <h2 className="detail-section-title">댓글 {comments.length}</h2>

        {user ? (
          <div className="comment-input-wrap">
            <textarea
              ref={commentRef}
              className="comment-textarea"
              placeholder="댓글을 입력하세요..."
              rows={3}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleComment();
              }}
            />
            <div className="comment-input-footer">
              <span className="comment-hint">Ctrl+Enter로 등록</span>
              <button
                type="button"
                className="login-btn comment-submit-btn"
                disabled={submitting || !commentText.trim()}
                onClick={handleComment}
              >
                {submitting ? "등록 중..." : "댓글 등록"}
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-login-hint">
            <a href="/login" className="comment-login-link">로그인</a> 후 댓글을 작성할 수 있습니다.
          </p>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="community-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{c.author_nick}</span>
                  <span className="comment-time">{timeAgo(c.created_at)}</span>
                  {user?.id === c.author_id && (
                    <button
                      type="button"
                      className="comment-delete-btn"
                      onClick={async () => {
                        await supabase.from("comments").delete().eq("id", c.id);
                        setComments(prev => prev.filter(x => x.id !== c.id));
                        const newCount = (post.comments_count ?? 1) - 1;
                        await supabase.from("posts").update({ comments_count: newCount }).eq("id", id);
                        setPost(p => p ? { ...p, comments_count: newCount } : p);
                      }}
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="comment-content">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
