// 导航栏组件
export function createNavbar(currentPage) {
    const navbar = document.createElement('header');
    navbar.className = 'navbar';
    
    // 创建返回首页链接
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.className = 'home-link';
    homeLink.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span>返回首页</span>
    `;
    
    // 创建页面标题
    const titleSection = document.createElement('div');
    titleSection.className = 'title-section';
    
    // 根据当前页面设置标题
    const titles = {
        'index': {
            title: '小铭妙妙屋',
            subtitle: '实用工具集合'
        },
        'prompt-library': {
            title: '提示词库',
            subtitle: '高质量提示词集合'
        },
        'article-cleaner': {
            title: '文章清洗',
            subtitle: '一键优化文章格式'
        }
    };
    
    const pageInfo = titles[currentPage] || titles['index'];
    
    titleSection.innerHTML = `
        <h1 class="title title-h1">${pageInfo.title}</h1>
        <p class="subtitle">${pageInfo.subtitle}</p>
    `;
    
    // 创建主题切换按钮
    const themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggle';
    themeToggle.className = 'btn btn-secondary';
    themeToggle.setAttribute('aria-label', '切换主题');
    themeToggle.textContent = '🌙';
    
    // 组装导航栏
    navbar.appendChild(homeLink);
    navbar.appendChild(titleSection);
    navbar.appendChild(themeToggle);
    
    return navbar;
}

// 主题切换功能
export function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 初始化主题
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark.matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
    
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        themeToggle.textContent = isDark ? '��' : '☀️';
    });
} 
