document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const charCount = document.getElementById('charCount');
    const processBtn = document.getElementById('processBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const themeToggle = document.getElementById('themeToggle');

    // 主题切换
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // 初始化主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    // 字数统计
    inputText.addEventListener('input', () => {
        charCount.textContent = inputText.value.length;
    });

    // 文本处理函数
    function processText(text) {
        // 空格处理
        const spaceOption = document.querySelector('input[name="spaceOption"]:checked').value;
        switch (spaceOption) {
            case 'remove':
                text = text.replace(/\s+/g, '');
                break;
            case 'single':
                // 只处理连续的多个空格，保留单个空格
                text = text.replace(/[ ]{2,}/g, ' ');
                break;
        }

        // 换行处理
        const lineOption = document.querySelector('input[name="lineOption"]:checked').value;
        switch (lineOption) {
            case 'remove':
                text = text.replace(/\n+/g, '');
                break;
            case 'single':
                // 只处理连续的多个换行，保留单个换行
                text = text.replace(/\n{2,}/g, '\n');
                break;
        }

        // 特殊符号处理
        const symbolOption = document.querySelector('input[name="symbolOption"]:checked').value;
        if (symbolOption === 'remove') {
            text = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s.,!?;:，。！？；：]/g, '');
        } else if (symbolOption === 'smart') {
            // 全角转半角
            text = text.replace(/，/g, ',')
                      .replace(/。/g, '.')
                      .replace(/！/g, '!')
                      .replace(/？/g, '?')
                      .replace(/；/g, ';')
                      .replace(/：/g, ':')
                      .replace(/（/g, '(')
                      .replace(/）/g, ')')
                      .replace(/【/g, '[')
                      .replace(/】/g, ']')
                      .replace(/《/g, '<')
                      .replace(/》/g, '>');
            
            // 统一引号
            text = text.replace(/[""''「」『』]/g, '"');
            // 省略号规范化
            text = text.replace(/\.{3,}/g, '…');
        }

        // 标点优化
        if (document.getElementById('chinesePunctuation').checked) {
            text = text.replace(/([^a-zA-Z0-9])([,\.!?;:])/g, '$1，');
        }
        if (document.getElementById('englishPunctuation').checked) {
            text = text.replace(/([a-zA-Z0-9])([，。！？；：])/g, '$1,');
        }

        // 段落整理
        if (document.getElementById('indentFirstLine').checked) {
            text = text.replace(/^/gm, '    ');
        }
        if (document.getElementById('uniformSpacing').checked) {
            text = text.replace(/\n{3,}/g, '\n\n');
        }

        return text;
    }

    // 处理按钮点击事件
    processBtn.addEventListener('click', () => {
        // 检查输入是否为空
        if (!inputText.value.trim()) {
            alert('请输入需要清洗的文本内容！');
            return;
        }

        // 添加加载状态
        processBtn.disabled = true;
        processBtn.textContent = '处理中...';
        
        // 使用 setTimeout 模拟异步处理，避免界面卡顿
        setTimeout(() => {
            try {
                const processedText = processText(inputText.value);
                outputText.value = processedText;
                
                // 显示成功提示
                processBtn.textContent = '清洗完成！';
                processBtn.classList.add('success');
                
                // 2秒后恢复按钮状态
                setTimeout(() => {
                    processBtn.textContent = '一键清洗';
                    processBtn.disabled = false;
                    processBtn.classList.remove('success');
                }, 2000);
            } catch (error) {
                console.error('处理失败:', error);
                alert('文本处理失败，请重试！');
                processBtn.textContent = '一键清洗';
                processBtn.disabled = false;
            }
        }, 100);
    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', async () => {
        if (!outputText.value) {
            alert('没有可复制的内容！');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText.value);
            copyBtn.textContent = '已复制！';
            copyBtn.classList.add('success');
            setTimeout(() => {
                copyBtn.textContent = '复制结果';
                copyBtn.classList.remove('success');
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        }
    });

    // 清空按钮点击事件
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        charCount.textContent = '0';
    });
}); 