document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const inputCharCount = document.getElementById('inputCharCount');
    const outputCharCount = document.getElementById('outputCharCount');
    const processBtn = document.getElementById('processBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const themeToggle = document.getElementById('themeToggle');

    // 检查必要的DOM元素是否存在
    if (!inputText || !outputText || !inputCharCount || !outputCharCount || !processBtn || !copyBtn || !clearBtn || !themeToggle) {
        console.error('必要的DOM元素未找到');
        return;
    }

    // 安全地更新元素内容
    function safeUpdateElement(element, content) {
        if (element && element.textContent !== undefined) {
            element.textContent = content;
        }
    }

    // 安全地更新元素属性
    function safeSetAttribute(element, attr, value) {
        if (element && element.setAttribute) {
            element.setAttribute(attr, value);
        }
    }

    // 安全地添加/移除类
    function safeToggleClass(element, className, add) {
        if (element && element.classList) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }

    // 更新字符统计
    function updateCharCount(text, element) {
        safeUpdateElement(element, text.length);
    }

    // 主题切换
    themeToggle.addEventListener('click', () => {
        try {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            safeSetAttribute(document.body, 'data-theme', isDark ? 'light' : 'dark');
            safeUpdateElement(themeToggle, isDark ? '🌙' : '☀️');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        } catch (error) {
            console.error('主题切换失败:', error);
        }
    });

    // 初始化主题
    try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        safeSetAttribute(document.body, 'data-theme', savedTheme);
        safeUpdateElement(themeToggle, savedTheme === 'dark' ? '☀️' : '🌙');
    } catch (error) {
        console.error('主题初始化失败:', error);
    }

    // 字数统计
    inputText.addEventListener('input', () => {
        try {
            updateCharCount(inputText.value, inputCharCount);
        } catch (error) {
            console.error('字数统计更新失败:', error);
        }
    });

    // 文本处理函数
    function processText(text) {
        if (!text) return '';

        try {
            // 统一换行符
            text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            // 空格处理
            const spaceOption = document.querySelector('input[name="spaceOption"]:checked')?.value;
            if (spaceOption) {
                switch (spaceOption) {
                    case 'remove':
                        text = text.replace(/[ \t]+/g, '');
                        break;
                    case 'single':
                        text = text.replace(/[ \t]+/g, ' ');
                        break;
                }
            }

            // 换行处理
            const lineOption = document.querySelector('input[name="lineOption"]:checked')?.value;
            if (lineOption) {
                switch (lineOption) {
                    case 'remove':
                        text = text.replace(/\n+/g, '');
                        break;
                    case 'single':
                        text = text.replace(/\n{2,}/g, '\n');
                        text = text.split('\n').map(line => line.trim()).join('\n');
                        break;
                }
            }

            // 特殊符号处理
            const symbolOption = document.querySelector('input[name="symbolOption"]:checked')?.value;
            if (symbolOption) {
                if (symbolOption === 'remove') {
                    text = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s.,!?;:，。！？；：]/g, '');
                } else if (symbolOption === 'smart') {
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
                              .replace(/》/g, '>')
                              .replace(/[""''「」『』]/g, '"')
                              .replace(/\.{3,}/g, '…');
                }
            }

            // 标点优化
            const chinesePunctuation = document.getElementById('chinesePunctuation');
            const englishPunctuation = document.getElementById('englishPunctuation');
            
            if (chinesePunctuation?.checked) {
                text = text.replace(/([^a-zA-Z0-9])([,\.!?;:])/g, '$1，');
            }
            if (englishPunctuation?.checked) {
                text = text.replace(/([a-zA-Z0-9])([，。！？；：])/g, '$1,');
            }

            // 段落整理
            const indentFirstLine = document.getElementById('indentFirstLine');
            const uniformSpacing = document.getElementById('uniformSpacing');
            
            if (indentFirstLine?.checked) {
                text = text.split('\n').map(line => {
                    return line.trim() ? '    ' + line : line;
                }).join('\n');
            }
            if (uniformSpacing?.checked) {
                text = text.replace(/\n{3,}/g, '\n\n');
                text = text.trim();
            }

            return text;
        } catch (error) {
            console.error('文本处理失败:', error);
            return text;
        }
    }

    // 处理按钮点击事件
    processBtn.addEventListener('click', () => {
        try {
            if (!inputText.value.trim()) {
                alert('请输入需要清洗的文本内容！');
                return;
            }

            processBtn.disabled = true;
            safeUpdateElement(processBtn, '处理中...');
            
            setTimeout(() => {
                try {
                    const processedText = processText(inputText.value);
                    outputText.value = processedText;
                    updateCharCount(processedText, outputCharCount);
                    
                    safeUpdateElement(processBtn, '清洗完成！');
                    safeToggleClass(processBtn, 'success', true);
                    
                    setTimeout(() => {
                        safeUpdateElement(processBtn, '一键清洗');
                        processBtn.disabled = false;
                        safeToggleClass(processBtn, 'success', false);
                    }, 2000);
                } catch (error) {
                    console.error('处理失败:', error);
                    alert('文本处理失败，请重试！');
                    safeUpdateElement(processBtn, '一键清洗');
                    processBtn.disabled = false;
                }
            }, 100);
        } catch (error) {
            console.error('按钮点击处理失败:', error);
        }
    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', async () => {
        try {
            if (!outputText.value) {
                alert('没有可复制的内容！');
                return;
            }

            await navigator.clipboard.writeText(outputText.value);
            safeUpdateElement(copyBtn, '已复制！');
            safeToggleClass(copyBtn, 'success', true);
            
            setTimeout(() => {
                safeUpdateElement(copyBtn, '复制结果');
                safeToggleClass(copyBtn, 'success', false);
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        }
    });

    // 清空按钮点击事件
    clearBtn.addEventListener('click', () => {
        try {
            inputText.value = '';
            outputText.value = '';
            updateCharCount('', inputCharCount);
            updateCharCount('', outputCharCount);
        } catch (error) {
            console.error('清空操作失败:', error);
        }
    });
}); 