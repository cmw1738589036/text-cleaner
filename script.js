// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 检查主题切换按钮是否存在
    if (themeToggle) {
        // 从 localStorage 获取主题设置
        const currentTheme = localStorage.getItem('theme');
        
        // 设置初始主题
        if (currentTheme) {
            document.body.setAttribute('data-theme', currentTheme);
            updateThemeIcon(currentTheme);
        } else if (prefersDarkScheme.matches) {
            document.body.setAttribute('data-theme', 'dark');
            updateThemeIcon('dark');
        }
        
        // 主题切换按钮点击事件
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
        
        // 更新主题图标
        function updateThemeIcon(theme) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        
        // 监听系统主题变化
        prefersDarkScheme.addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.body.setAttribute('data-theme', newTheme);
                updateThemeIcon(newTheme);
            }
        });
    }
});

// 回到顶部按钮功能
document.addEventListener('DOMContentLoaded', function() {
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// 文章清洗工具页面的功能
document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const inputCharCount = document.getElementById('inputCharCount');
    const outputCharCount = document.getElementById('outputCharCount');
    const processBtn = document.getElementById('processBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');

    // 检查文章清洗工具页面的必要DOM元素
    if (inputText && outputText && inputCharCount && outputCharCount && processBtn && copyBtn && clearBtn) {
        // 字数统计
        inputText.addEventListener('input', () => {
            try {
                updateCharCount(inputText.value, inputCharCount);
            } catch (error) {
                console.error('字数统计更新失败:', error);
            }
        });

        // 更新字符统计
        function updateCharCount(text, element) {
            if (element) {
                element.textContent = text.length;
            }
        }

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

                // 格式清理
                const removeNumbers = document.getElementById('removeNumbers')?.checked;
                const removeUppercase = document.getElementById('removeUppercase')?.checked;
                const removeLowercase = document.getElementById('removeLowercase')?.checked;
                const removeNumberSymbols = document.getElementById('removeNumberSymbols')?.checked;

                if (removeNumbers) {
                    text = text.replace(/[0-9]/g, '');
                }
                if (removeUppercase) {
                    text = text.replace(/[A-Z]/g, '');
                }
                if (removeLowercase) {
                    text = text.replace(/[a-z]/g, '');
                }
                if (removeNumberSymbols) {
                    const subOptions = document.querySelectorAll('.sub-option');
                    const patterns = {
                        'single-digit-single-char': /\d[^\u4e00-\u9fa5a-zA-Z0-9\s]/g,
                        'single-digit-multi-char': /\d[^\u4e00-\u9fa5a-zA-Z0-9\s]{2,}/g,
                        'multi-digit-single-char': /\d{2,}[^\u4e00-\u9fa5a-zA-Z0-9\s]/g,
                        'multi-digit-multi-char': /\d{2,}[^\u4e00-\u9fa5a-zA-Z0-9\s]{2,}/g,
                        'single-char-single-digit': /[^\u4e00-\u9fa5a-zA-Z0-9\s]\d/g,
                        'single-char-multi-digit': /[^\u4e00-\u9fa5a-zA-Z0-9\s]\d{2,}/g,
                        'multi-char-single-digit': /[^\u4e00-\u9fa5a-zA-Z0-9\s]{2,}\d/g,
                        'multi-char-multi-digit': /[^\u4e00-\u9fa5a-zA-Z0-9\s]{2,}\d{2,}/g
                    };

                    subOptions.forEach(option => {
                        if (option.checked) {
                            const pattern = patterns[option.dataset.pattern];
                            if (pattern) {
                                text = text.replace(pattern, '');
                            }
                        }
                    });
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
                processBtn.textContent = '处理中...';
                
                setTimeout(() => {
                    try {
                        const processedText = processText(inputText.value);
                        outputText.value = processedText;
                        updateCharCount(processedText, outputCharCount);
                        
                        processBtn.textContent = '清洗完成！';
                        processBtn.classList.add('success');
                        
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
            try {
                inputText.value = '';
                outputText.value = '';
                updateCharCount('', inputCharCount);
                updateCharCount('', outputCharCount);
            } catch (error) {
                console.error('清空操作失败:', error);
            }
        });
    }
});

// 提示功能
document.addEventListener('DOMContentLoaded', function() {
    const helpButtons = document.querySelectorAll('.help-btn');
    
    if (helpButtons.length > 0) {
        helpButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const tooltipText = this.getAttribute('data-tooltip');
                
                if (tooltipText) {
                    // 移除现有的提示框
                    const existingTooltip = document.querySelector('.tooltip-content');
                    const existingOverlay = document.querySelector('.tooltip-overlay');
                    
                    if (existingTooltip) existingTooltip.remove();
                    if (existingOverlay) existingOverlay.remove();
                    
                    // 创建新的提示框
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip-content';
                    tooltip.textContent = tooltipText;
                    
                    // 创建遮罩层
                    const overlay = document.createElement('div');
                    overlay.className = 'tooltip-overlay';
                    
                    // 添加到页面
                    document.body.appendChild(overlay);
                    document.body.appendChild(tooltip);
                    
                    // 显示提示框
                    setTimeout(() => {
                        tooltip.classList.add('active');
                    }, 10);
                    
                    // 点击遮罩层关闭提示框
                    overlay.addEventListener('click', function() {
                        tooltip.classList.remove('active');
                        setTimeout(() => {
                            tooltip.remove();
                            overlay.remove();
                        }, 300);
                    });
                    
                    // ESC 键关闭提示框
                    document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                            tooltip.classList.remove('active');
                            setTimeout(() => {
                                tooltip.remove();
                                overlay.remove();
                            }, 300);
                            document.removeEventListener('keydown', escHandler);
                        }
                    });
                }
            });
        });
    }
});

// 添加清理数字+特殊字符二级选项的交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    const removeNumberSymbols = document.getElementById('removeNumberSymbols');
    const numberSymbolsOptions = document.getElementById('numberSymbolsOptions');
    const subOptionMaster = document.querySelector('.sub-option-master');
    const subOptions = document.querySelectorAll('.sub-option');

    if (removeNumberSymbols && numberSymbolsOptions && subOptionMaster && subOptions.length > 0) {
        let priorityOrder = [];

        // 初始化状态
        function updateSubOptionsVisibility() {
            if (removeNumberSymbols.checked) {
                numberSymbolsOptions.style.display = 'block';
                // 检查是否所有子选项都被选中
                const allChecked = Array.from(subOptions).every(option => option.checked);
                subOptionMaster.checked = allChecked;
            } else {
                numberSymbolsOptions.style.display = 'none';
                // 取消所有子选项的选中状态
                subOptions.forEach(option => {
                    option.checked = false;
                    const item = option.closest('.sub-option-item');
                    if (item) {
                        item.classList.remove('has-priority');
                        const badge = item.querySelector('.priority-badge');
                        if (badge) badge.textContent = '';
                    }
                });
                subOptionMaster.checked = false;
                priorityOrder = [];
            }
        }

        // 更新优先级显示
        function updatePriorityDisplay() {
            // 清除所有优先级显示
            subOptions.forEach(option => {
                const item = option.closest('.sub-option-item');
                if (item) {
                    item.classList.remove('has-priority');
                    const badge = item.querySelector('.priority-badge');
                    if (badge) badge.textContent = '';
                }
            });

            // 更新优先级显示
            priorityOrder.forEach((option, index) => {
                const item = option.closest('.sub-option-item');
                if (item) {
                    item.classList.add('has-priority');
                    const badge = item.querySelector('.priority-badge');
                    if (badge) badge.textContent = (index + 1).toString();
                }
            });
        }

        // 监听主选项变化
        removeNumberSymbols.addEventListener('change', function() {
            updateSubOptionsVisibility();
        });

        // 监听全选选项变化
        subOptionMaster.addEventListener('change', function() {
            subOptions.forEach(option => {
                option.checked = this.checked;
                if (!this.checked) {
                    const item = option.closest('.sub-option-item');
                    if (item) {
                        item.classList.remove('has-priority');
                        const badge = item.querySelector('.priority-badge');
                        if (badge) badge.textContent = '';
                    }
                }
            });
            if (this.checked) {
                priorityOrder = Array.from(subOptions);
                updatePriorityDisplay();
            } else {
                priorityOrder = [];
            }
        });

        // 监听子选项变化
        subOptions.forEach(option => {
            option.addEventListener('change', function() {
                const allChecked = Array.from(subOptions).every(opt => opt.checked);
                subOptionMaster.checked = allChecked;

                if (this.checked) {
                    // 添加到优先级列表
                    if (!priorityOrder.includes(this)) {
                        priorityOrder.push(this);
                    }
                } else {
                    // 从优先级列表中移除
                    const index = priorityOrder.indexOf(this);
                    if (index > -1) {
                        priorityOrder.splice(index, 1);
                    }
                }

                updatePriorityDisplay();
            });
        });

        // 初始化显示状态
        updateSubOptionsVisibility();
    }
});

// 添加清理数字+特殊字符的互斥逻辑
document.addEventListener('DOMContentLoaded', function() {
    const removeNumbers = document.getElementById('removeNumbers');
    const removeNumberSymbols = document.getElementById('removeNumberSymbols');
    const symbolOptions = document.querySelectorAll('input[name="symbolOption"]');
    const keepSymbolOption = document.querySelector('input[name="symbolOption"][value="keep"]');

    if (removeNumbers && removeNumberSymbols && symbolOptions.length > 0) {
        // 监听清理数字+特殊字符选项的变化
        removeNumberSymbols.addEventListener('change', function() {
            if (this.checked) {
                // 禁用清理数字选项
                removeNumbers.checked = false;
                removeNumbers.disabled = true;
                
                // 强制选择保持原符号
                symbolOptions.forEach(option => {
                    option.checked = option === keepSymbolOption;
                    option.disabled = option !== keepSymbolOption;
                });
            } else {
                // 启用清理数字选项
                removeNumbers.disabled = false;
                
                // 启用所有符号选项
                symbolOptions.forEach(option => {
                    option.disabled = false;
                });
            }
        });

        // 监听清理数字选项的变化
        removeNumbers.addEventListener('change', function() {
            if (this.checked && removeNumberSymbols.checked) {
                // 如果清理数字被选中，且清理数字+特殊字符也被选中，则取消清理数字+特殊字符
                removeNumberSymbols.checked = false;
                removeNumberSymbols.dispatchEvent(new Event('change'));
            }
        });
    }
}); 