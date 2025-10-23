// 全域變數，存放從 data.json 讀取到的所有商品資料
let allItems = []; 

// 1. 讀取 JSON 資料（使用非同步 async/await）
async function loadData() {
    try {
        // 嘗試從根目錄讀取 data.json
        const response = await fetch('data.json'); 
        if (!response.ok) {
            // 如果讀取失敗 (例如檔案不存在或伺服器錯誤)
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json(); // 將 JSON 文字轉換為 JavaScript 物件
    } catch (error) {
        console.error("無法讀取 data.json:", error);
        document.getElementById('collection-list').innerHTML = "<p>資料載入失敗，請檢查 data.json 檔案的命名和內容。</p>";
        return [];
    }
}

// 2. 根據資料陣列生成並顯示商品卡片
function renderItems(itemsToDisplay) {
    const listContainer = document.getElementById('collection-list');
    listContainer.innerHTML = ''; // 清空現有內容，準備顯示新的結果

    if (itemsToDisplay.length === 0) {
        listContainer.innerHTML = "<p>抱歉，沒有找到符合條件的商品。</p>";
        return;
    }

    itemsToDisplay.forEach(item => {
        // 僅顯示庫存大於 0 的商品
        if (item.stock < 1) return;

        // 建立商品卡片 (使用模板字串)
        const card = document.createElement('div');
        card.classList.add('item-card');
        card.setAttribute('data-series', item.series); // 加入系列名稱，方便日後擴充篩選

        // 使用 data.json 裡的欄位來填充 HTML 內容
        card.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="series">系列：${item.series}</p>
            <p class="price">價格：$${item.price}</p>
            <a href="${item.sell_url}" target="_blank" class="buy-button">前往賣場購買 (${item.stock} 個)</a>
        `;
        listContainer.appendChild(card); // 將卡片加入到網頁清單中
    });
}

// 3. 實現篩選和搜尋的核心邏輯
function applyFilters() {
    // 取得使用者選擇的系列和輸入的搜尋關鍵字
    const selectedSeries = document.getElementById('series-filter').value;
    const searchText = document.getElementById('search-input').value.toLowerCase();

    // 過濾 allItems 陣列
    const filteredItems = allItems.filter(item => {
        // 篩選系列邏輯：'all' 表示顯示全部，否則必須與商品系列匹配
        const seriesMatch = (selectedSeries === 'all' || item.series === selectedSeries);

        // 搜尋名稱邏輯：將名稱轉小寫後，檢查是否包含搜尋文字
        const searchMatch = item.name.toLowerCase().includes(searchText);

        // 必須同時符合系列篩選和名稱搜尋
        return seriesMatch && searchMatch;
    });

    renderItems(filteredItems); // 重新渲染網頁，顯示過濾後的結果
}

// 4. 動態生成篩選器選項
function setupFilters(items) {
    const filterSelect = document.getElementById('series-filter');
    // 使用 Set 取得所有不重複的系列名稱
    const seriesSet = new Set(items.map(item => item.series));

    seriesSet.forEach(series => {
        const option = document.createElement('option');
        option.value = series;
        option.textContent = series;
        filterSelect.appendChild(option);
    });

    // 監聽事件：當篩選器或搜尋框的內容改變時，執行 applyFilters 函數
    filterSelect.addEventListener('change', applyFilters);
    document.getElementById('search-input').addEventListener('input', applyFilters);
}


// 程式啟動點：載入資料，設置篩選器，並顯示所有商品
loadData().then(data => {
    if (data.length > 0) {
        allItems = data;
        setupFilters(allItems);
        renderItems(allItems); // 第一次載入時顯示全部商品
    }
});
