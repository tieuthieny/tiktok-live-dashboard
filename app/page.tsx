'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

type Intent = 'Mua_Hang' | 'Xin_Tu_Van' | 'Hoi_Thong_Tin' | 'Spam' | null;

interface CommentData {
  intent?: Intent;
  comment_text?: string;
  suggested_product?: string;
  product_size?: string;
  product_color?: string;
  suggested_script?: string;
  [key: string]: unknown;
}

interface Comment {
  id: string | number;
  event_type?: string;
  data?: CommentData;
  created_at?: string;
  [key: string]: unknown;
}

interface SelectedComment extends Comment {
  selected: true;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getIntentColor(intent?: Intent): {
  badge: string;
  border: string;
  bg: string;
  icon: string;
  label: string;
} {
  switch (intent) {
    case 'Mua_Hang':
      return {
        badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        icon: '🚨',
        label: 'CHỐT ĐƠN',
      };
    case 'Xin_Tu_Van':
      return {
        badge: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
        border: 'border-orange-500/30',
        bg: 'bg-orange-500/10',
        icon: '💡',
        label: 'CẦN TƯ VẤN',
      };
    case 'Hoi_Thong_Tin':
      return {
        badge: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        icon: 'ℹ️',
        label: 'HỎI ĐÁP',
      };
    case 'Spam':
    default:
      return {
        badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        border: 'border-gray-500/30',
        bg: 'bg-gray-500/10',
        icon: '⚠️',
        label: 'SPAM',
      };
  }
}

function formatTime(dateString?: string): string {
  if (!dateString) return 'Chưa có thời gian';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return 'Thời gian không hợp lệ';
  }
}

function parseMaybeJson(value: unknown): CommentData {
  if (value && typeof value === 'object') {
    return value as CommentData;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? (parsed as CommentData) : {};
    } catch {
      return {};
    }
  }
  return {};
}

// ============================================================================
// UI Components
// ============================================================================

function CommentCard({ comment, isSelected, onSelect }: { comment: Comment; isSelected: boolean; onSelect: () => void }) {
  const data = parseMaybeJson(comment.data);
  const intent = (data.intent || 'Spam') as Intent;
  const colors = getIntentColor(intent);

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border transition-all duration-200 p-3 ${
        isSelected
          ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-offset-gray-950 ring-white/30`
          : `border-gray-700/50 bg-gray-900/50 hover:border-gray-600/80 hover:bg-gray-800/50`
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400">Bình luận</div>
          <p className="text-sm font-medium text-white truncate">{data.comment_text || 'Không có nội dung'}</p>
        </div>
        <span className={`shrink-0 px-2 py-1 rounded text-[11px] font-semibold border ${colors.badge}`}>
          {colors.icon} {colors.label}
        </span>
      </div>

      {/* Time */}
      <div className="text-xs text-gray-500">{formatTime(comment.created_at)}</div>
    </div>
  );
}

function AIPanel({ selectedComment }: { selectedComment: Comment | null }) {
  const data = parseMaybeJson(selectedComment?.data);
  const intent = (data.intent || 'Spam') as Intent;

  // Chỉ hiển thị chi tiết nếu có bình luận được chọn
  if (!selectedComment) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
        <div className="text-3xl mb-2">💭</div>
        <p className="text-sm">Chọn một bình luận để xem AI phân tích và đề xuất</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Intent Badge */}
      <div className="rounded-lg bg-gray-800/50 p-3">
        <div className="text-xs text-gray-400 mb-2">PHÂN LOẠI INTENT</div>
        <div className={`inline-block px-3 py-1 rounded-md text-sm font-semibold border ${getIntentColor(intent).badge}`}>
          {getIntentColor(intent).icon} {getIntentColor(intent).label}
        </div>
      </div>

      {/* Comment Content */}
      <div className="rounded-lg bg-gray-800/50 p-3">
        <div className="text-xs text-gray-400 mb-2">NỘI DUNG BÌNH LUẬN</div>
        <p className="text-sm text-white leading-relaxed">{data.comment_text || '(Không có nội dung)'}</p>
      </div>

      {/* Product Suggestion - Chỉ hiển thị nếu intent là 'Xin_Tu_Van' */}
      {intent === 'Xin_Tu_Van' && data.suggested_product && (
        <>
          {/* Product Info */}
          <div className="rounded-lg bg-gray-800/50 p-3 border border-orange-500/20">
            <div className="text-xs text-gray-400 mb-2">🎁 SẢN PHẨM ĐỀ XUẤT</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-400">Tên sản phẩm</div>
                <p className="text-sm font-semibold text-white">{data.suggested_product}</p>
              </div>

              {data.product_size && (
                <div>
                  <div className="text-xs text-gray-400">Size</div>
                  <p className="text-sm text-orange-200 font-medium">{data.product_size}</p>
                </div>
              )}

              {data.product_color && (
                <div>
                  <div className="text-xs text-gray-400">Màu sắc</div>
                  <p className="text-sm text-orange-200 font-medium">{data.product_color}</p>
                </div>
              )}

              {/* Placeholder Icon */}
              <div className="mt-3 rounded-md bg-gray-700/50 h-20 flex items-center justify-center text-3xl">
                📦
              </div>
            </div>
          </div>

          {/* Script */}
          {data.suggested_script && (
            <div className="rounded-lg bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 p-3">
              <div className="text-xs text-gray-300 mb-2 font-semibold">📝 KỊCH BẢN TRẢ LỜI</div>
              <p className="text-sm text-orange-100 leading-relaxed italic">&quot;{data.suggested_script}&quot;</p>
            </div>
          )}
        </>
      )}

      {/* Empty State for Non-Advisory Comments */}
      {intent !== 'Xin_Tu_Van' && (
        <div className="rounded-lg bg-gray-800/30 p-3 text-center text-gray-400 text-sm italic">
          Bình luận này không có đề xuất sản phẩm
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function Home() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(() => !supabase);

  // Fetch initial comments and setup real-time subscription
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let mounted = true;

    const fetchComments = async () => {
      try {
        const { data, error } = await client
          .from('tiktok_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        if (!mounted) return;

        setComments((data as Comment[]) || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        if (mounted) setLoading(false);
      }
    };

    fetchComments();

    // Setup real-time subscription
    const channel = client
      .channel('tiktok_events_comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tiktok_events',
        },
        (payload) => {
          if (mounted) {
            const newComment = payload.new as Comment;
            setComments((prev) => [newComment, ...prev.slice(0, 49)]);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      client.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">AI Co-pilot</p>
            <h1 className="text-2xl md:text-3xl font-black mt-1">Livestream Co-pilot System</h1>
            <p className="text-sm text-gray-400 mt-2">Phân tích bình luận real-time và đề xuất AI cho Streamer</p>
          </div>
          <Link href="/inventory">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 whitespace-nowrap ml-4">
              📦 Quản lý Kho hàng
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto h-[calc(100vh-120px)] flex gap-6 p-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center rounded-lg border border-gray-800/50 bg-gray-900/50">
            <div className="text-center text-gray-400">
              <div className="text-3xl mb-2">⏳</div>
              <p>Đang tải bình luận từ Supabase...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Left Column - Comments Timeline (60%) */}
            <section className="w-3/5 flex flex-col bg-gray-900/30 border border-gray-800/50 rounded-lg overflow-hidden">
              <div className="border-b border-gray-800/50 p-4 bg-gray-900/50">
                <h2 className="text-lg font-bold">📱 Dòng Thời Gian Bình Luận</h2>
                <p className="text-xs text-gray-400 mt-1">{comments.length} bình luận ({comments.length > 0 ? 'Real-time' : 'Không có'})</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 p-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentCard
                      key={String(comment.id)}
                      comment={comment}
                      isSelected={selectedComment?.id === comment.id}
                      onSelect={() => setSelectedComment(comment)}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📭</div>
                      <p>Chưa có bình luận nào</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Right Column - AI Suggestion Panel (40%, Sticky) */}
            <aside className="w-2/5 bg-gray-900/30 border border-gray-800/50 rounded-lg overflow-hidden flex flex-col sticky top-24 h-[calc(100vh-180px)]">
              <div className="border-b border-gray-800/50 p-4 bg-gray-900/50">
                <h2 className="text-lg font-bold">🤖 AI Phân Tích & Đề Xuất</h2>
                <p className="text-xs text-gray-400 mt-1">{selectedComment ? 'Đã chọn bình luận' : 'Chưa chọn'}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <AIPanel selectedComment={selectedComment} />
              </div>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
