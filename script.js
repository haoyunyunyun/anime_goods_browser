// 全域變數，存放從 data.json 讀取到的所有商品資料
let allItems = [];

// 1. 讀取 JSON 資料 (loadData 函數保持不變)
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("無法讀取 data.json:", error);
        document.getElementById('collection-list').innerHTML = "<p>資料載入失敗，請檢查 data.json 檔案的命名和內容。</p>";
        return [];
    }
}

// 2. 根據資料陣列生成並顯示商品卡片 (renderItems 函數保持不變)
function renderItems(itemsToDisplay) {
    const listContainer = document.getElementById('collection-list');
    listContainer.innerHTML = '';

    if (itemsToDisplay.length === 0) {
        listContainer.innerHTML = "<p>抱歉，沒有找到符合條件的商品。</p>";
        return;
    }

    itemsToDisplay.forEach(item => {
        if (item.stock < 1) return;

        const card = document.createElement('div');
        card.classList.add('item-card');
        card.setAttribute('data-series', item.series);

        card.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="series">系列：${item.series}</p>
            <p class="price">價格：$${item.price}</p>
            <a href="${item.sell_url}" target="_blank" class="buy-button">前往賣場購買 (${item.stock} 個)</a>
        `;
        listContainer.appendChild(card);
    });
}


// 新增：處理導航點擊的篩選功能 (包含高亮邏輯)
function applyNavigationFilter(selectedSeries) {
    // 1. 設定導航連結的高亮狀態 (Active Class)
    document.querySelectorAll('#nav-list a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-series-id') === selectedSeries) {
            link.classList.add('active');
        }
    });

    // 2. 執行過濾邏輯
    const searchText = document.getElementById('search-input').value.toLowerCase();

    const filteredItems = allItems.filter(item => {
        // 篩選系列
        const seriesMatch = (selectedSeries === 'all' || item.series === selectedSeries);

        // 搜尋名稱
        const searchMatch = item.name.toLowerCase().includes(searchText);

        return seriesMatch && searchMatch;
    });

    renderItems(filteredItems);
}


// 3. 實現搜尋的核心邏輯 (修改：基於當前選中的導航項進行搜尋)
function applyFilters() {
    // 獲取當前被選中的系列ID
    const activeLink = document.querySelector('#nav-list a.active');
    // 如果找不到 active 連結，預設為 'all'
    const selectedSeries = activeLink ? activeLink.getAttribute('data-series-id') : 'all';

    // 以當前選中系列為基礎，重新執行過濾
    applyNavigationFilter(selectedSeries);
}


// 4. 動態生成篩選器選項 (大幅修改：生成頂部導航欄連結)
function setupFilters(items) {
    const navList = document.getElementById('nav-list');
    const seriesSet = new Set(items.map(item => item.series));
    
    // 1. 處理「所有商品」的連結點擊事件
    const allLink = navList.querySelector('a[data-series-id="all"]');
    if (allLink) {
        allLink.addEventListener('click', (e) => {
            e.preventDefault();
            applyNavigationFilter('all');
        });
    }

    // 2. 根據 data.json 生成其他系列連結
    seriesSet.forEach(series => {
        // 忽略空的系列名稱
        if (!series) return; 
        
        const listItem = document.createElement('li');
        listItem.classList.add('nav-item');
        
        const link = document.createElement('a');
        link.href = "#";
        link.textContent = series;
        link.classList.add('nav-link');
        link.setAttribute('data-series-id', series);
        
        // 監聽主分類點擊事件
        link.addEventListener('click', (e) => {
            e.preventDefault();
            applyNavigationFilter(series);
        });

        listItem.appendChild(link);
        navList.appendChild(listItem);
    });

    // 3. 監聽搜尋框事件
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // 監聽按鈕點擊
    searchButton.addEventListener('click', applyFilters); 
    
    // 監聽 Enter 鍵
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}


// 程式啟動點：載入資料，設置篩選器，並顯示所有商品 (修改了最後的顯示邏輯)
loadData().then(data => {
    if (data.length > 0) {
        allItems = data;
        setupFilters(allItems);
        
        // 程式啟動時，預設顯示全部商品，並高亮 '所有商品' 連結
        applyNavigationFilter('all'); 
    }
});
