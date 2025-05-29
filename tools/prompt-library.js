// 全局变量
let prompts = [];
let currentUser = null;
let currentPromptId = null;
let currentAction = null;

// 常量
const ADMIN_PASSWORD = 'admin123'; // 在实际应用中应该使用更安全的方式存储密码

// 分类数据
const categories = {
    '对话类': ['角色扮演', '问答对话', '情感对话', '教育对话'],
    '生成类': ['文章生成', '代码生成', '创意写作', '内容改写'],
    '分析类': ['文本分析', '数据分析', '情感分析', '摘要生成'],
    '图像类': ['图像生成', '图像编辑', '图像描述', '图像分析']
};

// DOM 元素
const categoryFilter = document.getElementById('categoryFilter');
const subcategoryFilter = document.getElementById('subcategoryFilter');
const sortFilter = document.getElementById('sortFilter');
const promptsGrid = document.getElementById('promptsGrid');
const addPromptBtn = document.getElementById('addPromptBtn');
const promptModal = document.getElementById('promptModal');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const verifyModal = document.getElementById('verifyModal');
const promptForm = document.getElementById('promptForm');
const verifyForm = document.getElementById('verifyForm');
const modalTitle = document.getElementById('modalTitle');
const closeBtns = document.querySelectorAll('.close-btn');
const backToTopBtn = document.getElementById('backToTop');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initCategorySelect();
    loadPrompts();
    setupEventListeners();
    setupScrollListener();
});

// 加载提示词
async function loadPrompts() {
    try {
        promptsGrid.classList.add('loading');
        const response = await fetch('/api/prompts');
        if (!response.ok) throw new Error('加载提示词失败');
        prompts = await response.json();
        renderPrompts();
    } catch (error) {
        console.error('加载提示词失败:', error);
        showError('加载提示词失败，请稍后重试');
        // 尝试从本地存储加载
        const localPrompts = localStorage.getItem('prompts');
        if (localPrompts) {
            prompts = JSON.parse(localPrompts);
            renderPrompts();
        }
    } finally {
        promptsGrid.classList.remove('loading');
    }
}

// 保存提示词到本地存储
function savePromptsToLocal() {
    try {
        localStorage.setItem('prompts', JSON.stringify(prompts));
    } catch (error) {
        console.error('保存到本地存储失败:', error);
    }
}

// 验证提示词数据
function validatePromptData(data) {
    const errors = [];
    if (!data.title || data.title.length > 100) {
        errors.push('标题长度必须在1-100个字符之间');
    }
    if (!data.category || !categories[data.category]) {
        errors.push('请选择有效的分类');
    }
    if (!data.subcategory || !categories[data.category].includes(data.subcategory)) {
        errors.push('请选择有效的子分类');
    }
    if (!data.content || data.content.length > 1000) {
        errors.push('内容长度必须在1-1000个字符之间');
    }
    return errors;
}

// 设置事件监听器
function setupEventListeners() {
    // 筛选
    categoryFilter.addEventListener('change', handleCategoryChange);
    subcategoryFilter.addEventListener('change', handleFilterChange);
    sortFilter.addEventListener('change', handleFilterChange);

    // 添加提示词
    addPromptBtn.addEventListener('click', () => {
        currentAction = 'add';
        showPromptModal();
    });

    // 表单提交
    promptForm.addEventListener('submit', handlePromptSubmit);
    verifyForm.addEventListener('submit', handleVerifySubmit);

    // 关闭弹窗
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            promptModal.classList.remove('active');
            deleteConfirmModal.classList.remove('active');
            verifyModal.classList.remove('active');
        });
    });

    // 点击弹窗外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === promptModal) promptModal.classList.remove('active');
        if (e.target === deleteConfirmModal) deleteConfirmModal.classList.remove('active');
        if (e.target === verifyModal) verifyModal.classList.remove('active');
    });

    // 回到顶部
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 处理分类变化
function handleCategoryChange() {
    const category = categoryFilter.value;
    const subcategories = getSubcategories(category);
    
    subcategoryFilter.innerHTML = '<option value="">所有子分类</option>';
    subcategories.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub;
        option.textContent = sub;
        subcategoryFilter.appendChild(option);
    });

    handleFilterChange();
}

// 处理筛选
function handleFilterChange() {
    const category = categoryFilter.value;
    const subcategory = subcategoryFilter.value;
    const sort = sortFilter.value;

    let filteredPrompts = [...prompts];

    // 分类筛选
    if (category) {
        filteredPrompts = filteredPrompts.filter(p => p.category === category);
    }
    if (subcategory) {
        filteredPrompts = filteredPrompts.filter(p => p.subcategory === subcategory);
    }

    // 排序
    filteredPrompts.sort((a, b) => {
        if (sort === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    });

    renderPrompts(filteredPrompts);
}

// 显示提示词弹窗
function showPromptModal(prompt = null) {
    currentPromptId = prompt ? prompt.id : null;
    modalTitle.textContent = prompt ? '编辑提示词' : '添加提示词';
    
    // 填充表单
    if (prompt) {
        document.getElementById('promptTitle').value = prompt.title;
        document.getElementById('promptCategory').value = prompt.category;
        document.getElementById('promptSubcategory').value = prompt.subcategory;
        document.getElementById('promptContent').value = prompt.content;
        
        const tagsContainer = document.getElementById('tagsContainer');
        tagsContainer.innerHTML = '';
        prompt.tags.forEach(tag => {
            addTag(tag);
        });
    } else {
        promptForm.reset();
        document.getElementById('tagsContainer').innerHTML = '';
    }

    promptModal.classList.add('active');
}

// 处理提示词提交
async function handlePromptSubmit(e) {
    e.preventDefault();
    
    const promptData = {
        title: document.getElementById('promptTitle').value,
        category: document.getElementById('promptCategory').value,
        subcategory: document.getElementById('promptSubcategory').value,
        content: document.getElementById('promptContent').value,
        tags: Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent.trim())
    };

    // 验证数据
    const errors = validatePromptData(promptData);
    if (errors.length > 0) {
        showError(errors.join('\n'));
        return;
    }

    // 验证密码
    currentAction = currentPromptId ? 'edit' : 'add';
    showVerifyModal();
}

// 处理验证提交
async function handleVerifySubmit(e) {
    e.preventDefault();
    const password = document.getElementById('verifyPassword').value;
    
    if (password !== ADMIN_PASSWORD) {
        showError('密码错误');
        return;
    }

    verifyModal.classList.remove('active');
    document.getElementById('verifyPassword').value = '';

    const promptData = {
        title: document.getElementById('promptTitle').value,
        category: document.getElementById('promptCategory').value,
        subcategory: document.getElementById('promptSubcategory').value,
        content: document.getElementById('promptContent').value,
        tags: Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent.trim())
    };

    try {
        if (currentAction === 'add') {
            const response = await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promptData)
            });
            if (!response.ok) throw new Error('添加提示词失败');
            const newPrompt = await response.json();
            prompts.unshift(newPrompt);
        } else {
            const response = await fetch(`/api/prompts/${currentPromptId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promptData)
            });
            if (!response.ok) throw new Error('更新提示词失败');
            const updatedPrompt = await response.json();
            const index = prompts.findIndex(p => p.id === currentPromptId);
            if (index !== -1) prompts[index] = updatedPrompt;
        }

        promptModal.classList.remove('active');
        renderPrompts();
        showSuccess(currentAction === 'add' ? '提示词添加成功' : '提示词更新成功');
    } catch (error) {
        console.error('操作失败:', error);
        showError('操作失败，请稍后重试');
    }
}

// 处理删除提示词
async function handleDeletePrompt(id) {
    currentPromptId = id;
    currentAction = 'delete';
    showVerifyModal();
}

// 显示验证弹窗
function showVerifyModal() {
    verifyModal.classList.add('active');
    document.getElementById('verifyPassword').value = '';
    document.getElementById('verifyPassword').focus();
}

// 渲染提示词列表
function renderPrompts(promptsToRender = prompts) {
    if (promptsToRender.length === 0) {
        promptsGrid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                    <path fill="currentColor" d="M12 17h5v-2h-5v2zm-3-4h8v-2H9v2zm3-4h5V7h-5v2z"/>
                </svg>
                <h3>暂无提示词</h3>
                <p>点击"添加提示词"按钮开始创建</p>
            </div>
        `;
        return;
    }

    promptsGrid.innerHTML = promptsToRender.map(prompt => `
        <div class="prompt-card" data-id="${prompt.id}">
            <div class="prompt-header">
                <h3 class="prompt-title">${prompt.title}</h3>
                <div class="prompt-actions">
                    <button class="edit-btn" onclick="showPromptModal(${JSON.stringify(prompt)})" aria-label="编辑">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="delete-btn" onclick="handleDeletePrompt('${prompt.id}')" aria-label="删除">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="prompt-category">${prompt.category} - ${prompt.subcategory}</div>
            <div class="prompt-content">${prompt.content}</div>
            <div class="prompt-footer">
                <div class="prompt-tags">
                    ${prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="prompt-date">${formatDate(prompt.createdAt)}</div>
            </div>
        </div>
    `).join('');
}

// 添加标签
function addTag(tag) {
    const tagsContainer = document.getElementById('tagsContainer');
    const tagElement = document.createElement('span');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        ${tag}
        <span class="remove-tag" onclick="this.parentElement.remove()">&times;</span>
    `;
    tagsContainer.appendChild(tagElement);
}

// 设置滚动监听
function setupScrollListener() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
}

// 获取子分类
function getSubcategories(category) {
    return categories[category] || [];
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 显示成功消息
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 100);
}

// 显示错误消息
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// 初始化分类选择
function initCategorySelect() {
    const categoryFilter = document.getElementById('categoryFilter');
    const subcategoryDropdown = document.getElementById('subcategoryDropdown');
    const subcategoryList = subcategoryDropdown.querySelector('.subcategory-list');
    let selectedCategory = '';
    let selectedSubcategory = '';

    // 更新二级分类列表
    function updateSubcategories(category) {
        subcategoryList.innerHTML = '';
        if (category && categories[category]) {
            categories[category].forEach(sub => {
                const item = document.createElement('div');
                item.className = 'subcategory-item';
                item.textContent = sub;
                item.addEventListener('click', () => {
                    selectedSubcategory = sub;
                    subcategoryList.querySelectorAll('.subcategory-item').forEach(el => {
                        el.classList.remove('active');
                    });
                    item.classList.add('active');
                    filterPrompts();
                    subcategoryDropdown.classList.remove('active');
                });
                subcategoryList.appendChild(item);
            });
        }
    }

    // 一级分类选择事件
    categoryFilter.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        selectedSubcategory = '';
        if (selectedCategory) {
            updateSubcategories(selectedCategory);
            subcategoryDropdown.classList.add('active');
        } else {
            subcategoryDropdown.classList.remove('active');
        }
        filterPrompts();
    });

    // 点击外部关闭二级分类下拉框
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.category-select')) {
            subcategoryDropdown.classList.remove('active');
        }
    });

    // 修改筛选函数
    window.filterPrompts = function() {
        const sortValue = document.getElementById('sortFilter').value;
        const prompts = document.querySelectorAll('.prompt-card');
        
        prompts.forEach(prompt => {
            const promptCategory = prompt.dataset.category;
            const promptSubcategory = prompt.dataset.subcategory;
            
            const categoryMatch = !selectedCategory || promptCategory === selectedCategory;
            const subcategoryMatch = !selectedSubcategory || promptSubcategory === selectedSubcategory;
            
            prompt.style.display = categoryMatch && subcategoryMatch ? 'block' : 'none';
        });

        // 排序
        const promptGrid = document.querySelector('.prompt-grid');
        const promptArray = Array.from(prompts);
        
        promptArray.sort((a, b) => {
            const dateA = new Date(a.dataset.date);
            const dateB = new Date(b.dataset.date);
            return sortValue === 'newest' ? dateB - dateA : dateA - dateB;
        });

        promptArray.forEach(prompt => {
            if (prompt.style.display !== 'none') {
                promptGrid.appendChild(prompt);
            }
        });
    };
} 