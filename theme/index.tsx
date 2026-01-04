import { Layout as BasicLayout } from 'rspress/theme';
import * as defaultTheme from 'rspress/theme';
import { RecentPosts } from '../src/components/RecentPosts';

function Layout() {
  return (
    <BasicLayout
      afterFeatures={<RecentPosts limit={5} />}
    />
  );
}

const setup = () => {};

// 命名导出
export { Layout, setup };
export * from 'rspress/theme';

// 默认导出（rspress 需要）
export default {
  ...defaultTheme,
  Layout,
  setup,
};

