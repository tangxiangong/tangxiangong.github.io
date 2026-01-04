import type { RspressPlugin } from '@rspress/shared';
import * as fs from 'fs';
import * as path from 'path';

interface BlogPage {
  route: string;
  title: string;
  description?: string;
  lastUpdatedTime?: string;
  date?: string;
}

// 收集博客页面数据的函数
function collectBlogPages(root: string): BlogPage[] {
  const blogPagesData: BlogPage[] = [];
  // root 已经是 docs 目录，所以直接使用 blog 子目录
  const blogDir = path.join(root, 'blog');
  
  if (!fs.existsSync(blogDir)) {
    return blogPagesData;
  }

  const files = fs.readdirSync(blogDir, { recursive: true, withFileTypes: true });
  
  for (const file of files) {
    if (file.isFile() && (file.name.endsWith('.md') || file.name.endsWith('.mdx'))) {
      const filePath = path.join(file.parentPath, file.name);
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/title:\s*(.+)/);
        const descMatch = frontmatter.match(/description:\s*(.+)/);
        const dateMatch = frontmatter.match(/date:\s*(.+)/);
        
        // 获取文件修改时间
        const stats = fs.statSync(filePath);
        const lastUpdatedTime = stats.mtime.toISOString();
        
        // 构建路由 - root 已经是 docs 目录
        const relativePath = path.relative(blogDir, filePath);
        let route: string;
        if (relativePath === 'index.md' || relativePath === 'index.mdx') {
          route = '/blog/';
        } else {
          route = `/blog/${relativePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/')}`;
        }
        
        blogPagesData.push({
          route,
          title: titleMatch ? titleMatch[1].trim().replace(/^["']|["']$/g, '') : 'Untitled',
          description: descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, '') : undefined,
          lastUpdatedTime,
          date: dateMatch ? dateMatch[1].trim().replace(/^["']|["']$/g, '') : undefined,
        });
      }
    }
  }
  
  return blogPagesData;
}

// 生成 JSON 文件的辅助函数
function generateBlogPagesJson(root: string) {
  const blogPages = collectBlogPages(root);
  
  // 在构建时生成 JSON 文件到 public 目录 - root 已经是 docs 目录
  const publicDir = path.join(root, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const jsonPath = path.join(publicDir, 'blog-pages.json');
  fs.writeFileSync(jsonPath, JSON.stringify(blogPages, null, 2), 'utf-8');
  console.log(`[plugin-blog-data] Generated blog pages data: ${blogPages.length} pages`);
}

export function pluginBlogData(): RspressPlugin {
  return {
    name: 'plugin-blog-data',
    async config(config) {
      // 在配置阶段也生成文件，确保开发模式也能使用
      const root = config.root || process.cwd();
      generateBlogPagesJson(root);
      return config;
    },
    async beforeBuild(config, isProd) {
      // 构建时再次生成，确保数据是最新的
      const root = config.root || process.cwd();
      generateBlogPagesJson(root);
    },
  };
}

