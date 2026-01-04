import { useEffect, useState } from 'react';
import styles from './RecentPosts.module.css';

interface BlogPage {
  route: string;
  title: string;
  description?: string;
  lastUpdatedTime?: string;
  date?: string;
}

export function RecentPosts({ limit = 5 }: { limit?: number }) {
  const [blogPages, setBlogPages] = useState<BlogPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 从 public 目录加载博客页面数据
    fetch('/blog-pages.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: BlogPage[]) => {
        console.log('[RecentPosts] Loaded blog pages:', data);
        setBlogPages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[RecentPosts] Failed to load blog pages:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const blogPosts = blogPages
    .filter((page) => page.route !== '/blog/' && page.route.startsWith('/blog/'))
    .sort((a, b) => {
      const timeA = a.lastUpdatedTime || a.date || '';
      const timeB = b.lastUpdatedTime || b.date || '';
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    })
    .slice(0, limit);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorTitle}>加载博客列表失败</p>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyBox}>
          <div className={styles.emptyIcon}>📝</div>
          <p className={styles.emptyTitle}>暂无博客文章</p>
          <p className={styles.emptyMessage}>
            已加载 {blogPages.length} 个页面，但筛选后没有符合条件的文章
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>最近更新的博客</h2>
        <p className={styles.subtitle}>探索最新的技术分享和生活感悟</p>
      </div>
      <div className={styles.grid}>
        {blogPosts.map((post, index) => (
          <a key={post.route} href={post.route} className={styles.card}>
            {/* 装饰性渐变背景 */}
            <div className={styles.cardGradient} />
            
            {/* 文章编号装饰 */}
            <div className={styles.badge}>
              {String(index + 1).padStart(2, '0')}
            </div>

            <h3 className={styles.cardTitle}>{post.title}</h3>
            
            {post.description && (
              <p className={styles.cardDescription}>{post.description}</p>
            )}
            
            <div className={styles.cardFooter}>
              <time className={styles.cardDate}>
                <span className={styles.cardDateIcon}>📅</span>
                {formatDate(post.lastUpdatedTime || post.date)}
              </time>
              <span className={styles.cardReadMore}>
                阅读更多
                <span className={styles.cardArrow}>→</span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
