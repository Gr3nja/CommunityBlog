// Extracted script from index.html
let allArticles = [];
let filteredArticles = [];

// ステータスメッセージ表示
function showStatus(message, type = 'success') {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = `status-${type}`;
  statusEl.style.display = 'block';
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

// JSONファイルから記事データを読み込み
async function loadArticles() {
  try {
    // キャッシュを避けるためのタイムスタンプを追加
    const timestamp = new Date().getTime();
    const response = await fetch(`date.json?t=${timestamp}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // データの検証
    if (!Array.isArray(data)) {
      throw new Error('JSONデータが配列形式ではありません');
    }

    console.log('読み込まれたデータ:', data);

    allArticles = data;
    filteredArticles = [...allArticles];
    displayArticles(filteredArticles);

    showStatus(`${allArticles.length}件の記事を読み込みました`);

  } catch (error) {
    console.error('記事の読み込みに失敗:', error);
    showNoArticles(error.message);
  }
}

// 記事がない場合の表示
function showNoArticles(errorMessage) {
  const container = document.getElementById('articles');
  container.innerHTML = `
    <div class="no-articles">
      <h3>記事が見つかりません</h3>
      <p>エラー: ${errorMessage}</p>
      <p>GitHubリポジトリでdate.jsonファイルを作成してください：</p>
      <a href="https://github.com" target="_blank" class="github-link">
        GitHubで記事を管理する
      </a>
    </div>
  `;
}

// 記事一覧を表示
function displayArticles(articles) {
  const container = document.getElementById('articles');

  if (articles.length === 0) {
    container.innerHTML = `
      <div class="no-articles">
        <h3>該当する記事がありません</h3>
        <p>検索条件を変更してください</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  articles.forEach((article) => {
    const summary = article.summary || (article.content ? article.content.substring(0, 50) + '...' : '概要なし');

    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <img src="${article.thumbnail || 'https://via.placeholder.com/300x180/CCCCCC/FFFFFF?text=No+Image'}" 
           alt="サムネイル" 
           onerror="this.src='https://via.placeholder.com/300x180/CCCCCC/FFFFFF?text=No+Image'">
      <h3>${article.title || '無題'}</h3>
      <p class="summary">${summary}</p>
      <div class="author-info">
        作者: ${article.author || '不明'} | ${article.date || '日付不明'}
      </div>
    `;

    card.addEventListener('click', () => showDetail(article));
    container.appendChild(card);
  });
}

// 詳細表示
function showDetail(article) {
  document.getElementById('detail-title').textContent = article.title || '無題';
  document.getElementById('detail-thumbnail').src = article.thumbnail || '';
  document.getElementById('detail-content-text').textContent = article.content || '内容がありません';
  document.getElementById('detail-author').textContent = article.author || '不明';
  document.getElementById('detail-date').textContent = article.date || '不明';

  const tags = Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || 'タグなし');
  document.getElementById('detail-tags').textContent = tags;

  document.getElementById('detail-modal').style.display = 'flex';
  document.querySelector('#detail-modal .modal-body').scrollTop = 0;
}

// フィルタ機能
function filterArticles() {
  const searchTag = document.getElementById('search').value.trim().toLowerCase();
  const selectTag = document.getElementById('tag-select').value.toLowerCase();

  let filtered = [...allArticles];

  // 検索タグでフィルタ（部分マッチ）
  if (searchTag !== '') {
    filtered = filtered.filter(article => {
      const tags = Array.isArray(article.tags) ? article.tags : [];
      return tags.some(tag => tag.toLowerCase().includes(searchTag)) ||
             (article.title && article.title.toLowerCase().includes(searchTag)) ||
             (article.content && article.content.toLowerCase().includes(searchTag));
    });
  }

  // セレクトタグでフィルタ（完全マッチ）
  if (selectTag !== '') {
    filtered = filtered.filter(article => {
      const tags = Array.isArray(article.tags) ? article.tags : [];
      return tags.some(tag => tag.toLowerCase() === selectTag);
    });
  }

  filteredArticles = filtered;
  displayArticles(filteredArticles);

  // 検索結果の通知
  if (searchTag || selectTag) {
    showStatus(`${filtered.length}件の記事が見つかりました`);
  }
}

// 検索をリセット
function resetSearch() {
  document.getElementById('search').value = '';
  document.getElementById('tag-select').value = '';
  filteredArticles = [...allArticles];
  displayArticles(filteredArticles);
}

// イベントリスナー登録
document.addEventListener('DOMContentLoaded', () => {
  loadArticles();

  // モーダルを閉じる
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      modal.style.display = 'none';
    });
  });

  // モーダル背景クリックで閉じる
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // 検索機能
  document.getElementById('search').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      filterArticles();
    }
  });

  // セレクトボックス変更
  document.getElementById('tag-select').addEventListener('change', filterArticles);

  // サイト名をクリックでリセット
  document.getElementById('site-name').addEventListener('click', (e) => {
    e.preventDefault();
    resetSearch();
  });
});
