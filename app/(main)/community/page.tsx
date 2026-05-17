import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import pokemonData from "@/data/pokemon.json";
import { timeAgo, type PokemonSlot } from "@/lib/party-constants";
import "@/styles/community.css";

export const metadata: Metadata = {
  title: "poketier | 커뮤니티",
  description: "포켓티어 파티 커뮤니티",
};

// 포켓몬 이름 → artwork URL
function getArtwork(nameKo: string): string | null {
  return pokemonData.find(p => p.nameKo === nameKo)?.artwork ?? null;
}

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, description, party, author_nick, created_at, likes_count, comments_count")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="community-page">
      <div className="community-page-hero">
        <p className="section-label">COMMUNITY</p>
        <h1>커뮤니티</h1>
        <p className="community-page-lead">파티를 공유하고 의견을 나눠보세요.</p>
      </div>

      <section className="community-board card">
        <div className="community-toolbar">
          <div className="community-search">
            <input type="search" placeholder="검색 (준비 중)" disabled />
          </div>
          <Link href="/community/write" className="login-btn community-write-btn">
            ✏️ 글쓰기
          </Link>
        </div>

        {error ? (
          <p className="community-empty">게시물을 불러올 수 없습니다. (테이블을 먼저 생성해주세요)</p>
        ) : !posts?.length ? (
          <p className="community-empty">아직 게시물이 없습니다. 첫 파티를 공유해보세요!</p>
        ) : (
          <div className="post-list">
            {posts.map(post => {
              const partySlots: PokemonSlot[] = Array.isArray(post.party) ? post.party : [];
              const filled = partySlots.filter(s => s.pokemon).slice(0, 6);

              return (
                <Link key={post.id} href={`/community/${post.id}`} className="post-item">
                  {/* 파티 포켓몬 이미지 6칸 */}
                  <div className="post-party-sprites">
                    {Array.from({ length: 6 }, (_, i) => {
                      const slot = filled[i];
                      const art  = slot ? getArtwork(slot.pokemon) : null;
                      return art ? (
                        <img
                          key={i}
                          src={art}
                          alt={slot!.pokemon}
                          title={slot!.pokemon}
                          className="post-sprite"
                        />
                      ) : (
                        <span key={i} className="post-sprite-empty" />
                      );
                    })}
                  </div>

                  {/* 글 정보 */}
                  <div className="post-info">
                    <h3 className="post-title">{post.title}</h3>
                    {post.description && (
                      <p className="post-desc">{post.description}</p>
                    )}
                    <div className="post-meta">
                      <span className="post-author">{post.author_nick}</span>
                      <span className="post-dot">·</span>
                      <span className="post-time">{timeAgo(post.created_at)}</span>
                      <span className="post-dot">·</span>
                      <span className="post-stat">♥ {post.likes_count ?? 0}</span>
                      <span className="post-stat">💬 {post.comments_count ?? 0}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
